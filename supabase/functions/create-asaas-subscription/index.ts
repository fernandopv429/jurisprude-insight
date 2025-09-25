import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionRequest {
  planType: 'monthly' | 'annual';
  amount: number;
  description: string;
  userEmail: string;
  userName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { planType, amount, description, userEmail, userName }: SubscriptionRequest = await req.json();

    // Get Asaas API key
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    if (!asaasApiKey) {
      throw new Error('ASAAS API key not configured');
    }

    console.log('Creating subscription for user:', user.id, 'Plan:', planType);

    // Step 1: Create or get customer in Asaas
    let customerId: string;
    
    // First, try to find existing customer
    const existingCustomerResponse = await fetch(`https://www.asaas.com/api/v3/customers?email=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
    });

    const existingCustomerData = await existingCustomerResponse.json();
    
    if (existingCustomerData.data && existingCustomerData.data.length > 0) {
      customerId = existingCustomerData.data[0].id;
      console.log('Found existing customer:', customerId);
    } else {
      // Create new customer
      const customerResponse = await fetch('https://www.asaas.com/api/v3/customers', {
        method: 'POST',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          cpfCnpj: "", // Will be filled by user later if needed
        }),
      });

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json();
        console.error('Error creating customer:', errorData);
        throw new Error('Failed to create customer in Asaas');
      }

      const customerData = await customerResponse.json();
      customerId = customerData.id;
      console.log('Created new customer:', customerId);
    }

    // Step 2: Create subscription in Asaas
    const subscriptionData = {
      customer: customerId,
      billingType: 'PIX', // Using PIX for Brazilian market
      value: amount,
      nextDueDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      description: description,
      cycle: planType === 'monthly' ? 'MONTHLY' : 'YEARLY',
    };

    console.log('Creating subscription with data:', subscriptionData);

    const subscriptionResponse = await fetch('https://www.asaas.com/api/v3/subscriptions', {
      method: 'POST',
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json();
      console.error('Error creating subscription:', errorData);
      throw new Error('Failed to create subscription in Asaas');
    }

    const subscription = await subscriptionResponse.json();
    console.log('Created subscription:', subscription.id);

    // Step 3: Save subscription to database
    const { error: dbError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type: planType,
        status: 'pending',
        asaas_subscription_id: subscription.id,
        asaas_customer_id: customerId,
        amount: amount,
        expires_at: planType === 'monthly' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });

    if (dbError) {
      console.error('Error saving subscription to database:', dbError);
      throw new Error('Failed to save subscription');
    }

    // Step 4: Get payment URL from the first payment
    const paymentsResponse = await fetch(`https://www.asaas.com/api/v3/payments?subscription=${subscription.id}`, {
      method: 'GET',
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!paymentsResponse.ok) {
      console.error('Error fetching payments:', await paymentsResponse.text());
      throw new Error('Failed to fetch payment information');
    }

    const paymentsData = await paymentsResponse.json();
    const firstPayment = paymentsData.data?.[0];

    if (!firstPayment) {
      throw new Error('No payment found for subscription');
    }

    console.log('Payment created:', firstPayment.id);

    return new Response(JSON.stringify({
      subscriptionId: subscription.id,
      paymentId: firstPayment.id,
      paymentUrl: firstPayment.bankSlipUrl || firstPayment.invoiceUrl,
      status: 'pending'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-asaas-subscription function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});