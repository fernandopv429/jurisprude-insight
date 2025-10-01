import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, CreditCard, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  amount: number;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const MySubscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativo", variant: "default" as const },
      pending: { label: "Pendente", variant: "secondary" as const },
      canceled: { label: "Cancelado", variant: "destructive" as const },
      expired: { label: "Expirado", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPlanName = (planType: string) => {
    return planType === 'monthly' ? 'Plano Mensal' : 'Plano Anual';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Minha Assinatura</h2>

          {!subscription ? (
            <Card>
              <CardHeader>
                <CardTitle>Nenhuma assinatura ativa</CardTitle>
                <CardDescription>
                  Você ainda não possui uma assinatura ativa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/planos")}>
                  Ver Planos Disponíveis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{getPlanName(subscription.plan_type)}</CardTitle>
                  {getStatusBadge(subscription.status)}
                </div>
                <CardDescription>
                  Detalhes da sua assinatura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="text-lg font-semibold">
                        R$ {Number(subscription.amount).toFixed(2)}
                        {subscription.plan_type === 'monthly' ? '/mês' : '/ano'}
                      </p>
                    </div>
                  </div>

                  {subscription.started_at && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Data de Início</p>
                        <p className="font-medium">
                          {format(new Date(subscription.started_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}

                  {subscription.expires_at && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Próximo Vencimento</p>
                        <p className="font-medium">
                          {format(new Date(subscription.expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}

                  {subscription.status === 'pending' && (
                    <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Aguardando Pagamento</p>
                        <p className="text-xs text-muted-foreground">
                          Seu plano será ativado assim que o pagamento for confirmado
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Recursos inclusos:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Acesso completo à plataforma
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Busca ilimitada de jurisprudências
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Filtros avançados por tribunal
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Download de documentos
                    </li>
                    {subscription.plan_type === 'annual' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Suporte prioritário
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Relatórios avançados
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {subscription.status !== 'active' && (
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate("/planos")}
                  >
                    Alterar Plano
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySubscription;
