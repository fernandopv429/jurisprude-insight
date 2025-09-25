import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Plans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (planType: 'monthly' | 'annual') => {
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      
      const planData = {
        monthly: {
          amount: 29.90,
          description: "Plano Mensal - Acesso completo"
        },
        annual: {
          amount: 214.90,
          description: "Plano Anual - Melhor Custo-Benefício (40% de desconto)"
        }
      };

      const { data, error } = await supabase.functions.invoke('create-asaas-subscription', {
        body: {
          planType,
          amount: planData[planType].amount,
          description: planData[planType].description,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.email
        }
      });

      if (error) {
        throw error;
      }

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível processar o pagamento. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const monthlyFeatures = [
    "Acesso completo à plataforma",
    "Busca ilimitada de jurisprudências", 
    "Filtros avançados por tribunal",
    "Download de documentos",
    "Suporte por email"
  ];

  const annualFeatures = [
    "Tudo do plano mensal",
    "40% de desconto (R$ 17,90/mês)",
    "Suporte prioritário",
    "Funcionalidades exclusivas",
    "Relatórios avançados"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">JurisFácil</h1>
          </div>
        </div>
      </header>

      {/* Plans Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Escolha seu plano</h2>
          <p className="text-lg text-muted-foreground">
            Acesso completo à plataforma de jurisprudências mais avançada do Brasil
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-xl">Plano Mensal</CardTitle>
              <CardDescription>Flexibilidade total</CardDescription>
              <div className="text-3xl font-bold">
                R$ 29,90<span className="text-lg font-normal text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {monthlyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe('monthly')}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Assinar Plano Mensal"}
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="relative border-primary shadow-lg">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                Mais Popular
              </Badge>
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="text-xl">Plano Anual</CardTitle>
              <CardDescription>Melhor Custo-Benefício</CardDescription>
              <div className="space-y-1">
                <div className="text-3xl font-bold">
                  R$ 214,90<span className="text-lg font-normal text-muted-foreground">/ano</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">R$ 358,80</span> • Economia de 40%
                </div>
                <div className="text-sm font-medium text-primary">
                  Equivale a R$ 17,90/mês
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {annualFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe('annual')}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Assinar Plano Anual"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trust Section */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-sm text-muted-foreground">
            🔒 Pagamento 100% seguro • Cancele a qualquer momento
          </p>
          <p className="text-xs text-muted-foreground">
            Processado pela Asaas • Dados protegidos com criptografia SSL
          </p>
        </div>
      </div>
    </div>
  );
};

export default Plans;