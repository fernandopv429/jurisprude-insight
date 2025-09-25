import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const webhook = await req.json();
    console.log('Received Asaas webhook:', JSON.stringify(webhook, null, 2));

    // Process payment webhook
    if (webhook.event === 'PAYMENT_RECEIVED' || webhook.event === 'PAYMENT_CONFIRMED') {
      const payment = webhook.payment;
      
      if (payment?.subscription) {
        console.log('Processing subscription payment:', payment.subscription);
        
        // Update subscription status to active
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({ 
            status: 'active',
            started_at: new Date().toISOString()
          })
          .eq('asaas_subscription_id', payment.subscription);

        if (updateError) {
          console.error('Error updating subscription status:', updateError);
          throw updateError;
        }

        console.log('Subscription activated successfully');
      }
    }

    // Process subscription webhook
    else if (webhook.event === 'SUBSCRIPTION_CREATED' || webhook.event === 'SUBSCRIPTION_UPDATED') {
      const subscription = webhook.subscription;
      
      console.log('Processing subscription webhook:', subscription.id);
      
      // Update subscription in database
      const updateData: any = {};
      
      if (subscription.status === 'ACTIVE') {
        updateData.status = 'active';
        updateData.started_at = new Date().toISOString();
      } else if (subscription.status === 'CANCELLED') {
        updateData.status = 'cancelled';
      } else if (subscription.status === 'EXPIRED') {
        updateData.status = 'expired';
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update(updateData)
          .eq('asaas_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          throw updateError;
        }

        console.log('Subscription updated successfully');
      }
    }

    // Handle failed payment
    else if (webhook.event === 'PAYMENT_OVERDUE' || webhook.event === 'PAYMENT_DELETED') {
      const payment = webhook.payment;
      
      if (payment?.subscription) {
        console.log('Processing failed payment for subscription:', payment.subscription);
        
        // Mark subscription as expired if payment fails
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('asaas_subscription_id', payment.subscription);

        if (updateError) {
          console.error('Error updating subscription status:', updateError);
          throw updateError;
        }

        console.log('Subscription marked as expired due to failed payment');
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      received: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});