import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import TribunalSelector from "@/components/TribunalSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTribunals, setSelectedTribunals] = useState([
    "stf", "stj", "tst", "tse", "stm", "tcu", "tnu", "tru", "cnj", 
    "tj", "trf", "trt", "tre", "tjm", "tce"
  ]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Atenção",
        description: "Digite um termo para buscar",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedTribunals.length === 0) {
      toast({
        title: "Atenção", 
        description: "Selecione pelo menos um tribunal",
        variant: "destructive",
      });
      return;
    }

    navigate(`/resultados?q=${encodeURIComponent(searchQuery)}&tribunais=${selectedTribunals.join(',')}`);
  };

  return (
    <div className="min-h-screen bg-law-gray-light">
      <Header showSearch={false} />
      
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Jurisprudência
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-law-gray px-2">
              Decisões de todos os Tribunais, com busca unificada e gratuita.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-sm">
            <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Digite sua pesquisa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border-2 focus:border-law-blue"
                />
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-law-gray w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              
              <div className="text-xs sm:text-sm text-law-gray">
                Dica: para buscar expressões exatas, use aspas. Exemplo: <em>"cobrança indevida"</em>
              </div>

              <Button 
                type="submit" 
                className="w-full py-3 sm:py-4 text-base sm:text-lg bg-law-blue hover:bg-primary"
                size="lg"
              >
                <Search className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                Buscar Jurisprudência
              </Button>
            </form>
          </div>

          {/* Tribunal Selection */}
          <TribunalSelector 
            selectedTribunals={selectedTribunals}
            onSelectionChange={setSelectedTribunals}
          />

          {/* Footer Info */}
          <div className="mt-8 sm:mt-12 text-center text-law-gray text-xs sm:text-sm px-2">
            <p>Consulta gratuita em mais de 10 milhões de decisões judiciais</p>
            <p className="mt-2">Dados atualizados diariamente dos principais tribunais do país</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
