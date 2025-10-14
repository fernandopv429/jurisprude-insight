import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ArrowUpDown, Copy } from "lucide-react";
import TribunalFilterModal from "@/components/TribunalFilterModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchResult {
  ementa: string;
  orgao_julgador?: string;
  relator?: string;
  data_julgamento?: string;
  data_publicacao?: string;
  numero_processo?: string;
  [key: string]: any;
}

const Results = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tribunaisParam = searchParams.get("tribunais") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("relevance");
  const [selectedTribunals, setSelectedTribunals] = useState<string[]>([]);
  const [isTribunalModalOpen, setIsTribunalModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setIsLoading(true);
      try {
        const tribunais = tribunaisParam ? tribunaisParam.split(',') : null;
        
        // Se todos os tribunais estiverem selecionados, não enviar filtro (evita 0 resultados na API)
        const ALL_TRIBUNAIS = ["stf","stj","tst","tse","stm","tcu","tnu","tru","cnj","tj","trf","trt","tre","tjm","tce"];
        const tribunaisToSend = tribunais && ALL_TRIBUNAIS.every(t => tribunais.includes(t)) && tribunais.length >= ALL_TRIBUNAIS.length ? null : tribunais;
        
        console.log('Chamando função intelligent-search...', { query, tribunais: tribunaisToSend });
        
        const { data, error } = await supabase.functions.invoke('intelligent-search', {
          body: { query, tribunais: tribunaisToSend },
        });

        if (error) {
          console.error('Erro ao buscar:', error);
          toast({
            title: "Erro na busca",
            description: "Não foi possível buscar jurisprudência. Tente novamente.",
            variant: "destructive",
          });
          setResults([]);
          return;
        }

        console.log('Resultados recebidos:', data);
        setResults(Array.isArray(data) ? data : []);
        
      } catch (error) {
        console.error('Erro ao buscar jurisprudência:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao buscar jurisprudência.",
          variant: "destructive",
        });
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, tribunaisParam, toast]);

  const handleSearch = (newQuery: string) => {
    window.location.href = `/resultados?q=${encodeURIComponent(newQuery)}`;
  };

  const copyEmenta = (ementa: string) => {
    navigator.clipboard.writeText(ementa);
    toast({
      title: "Copiado!",
      description: "Ementa copiada para a área de transferência.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={handleSearch} initialQuery={query} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border rounded-lg p-6 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} initialQuery={query} />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
          Jurisprudência sobre <span className="font-bold">{query}</span>
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTribunalModalOpen(true)}
              className="whitespace-nowrap text-xs sm:text-sm"
            >
              Tribunal <ChevronDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap text-xs sm:text-sm">
                  Data <ChevronDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover">
                <DropdownMenuItem>Em qualquer data</DropdownMenuItem>
                <DropdownMenuItem>Último mês</DropdownMenuItem>
                <DropdownMenuItem>Último ano</DropdownMenuItem>
                <DropdownMenuItem>Últimos 2 anos</DropdownMenuItem>
                <DropdownMenuItem>Últimos 3 anos</DropdownMenuItem>
                <DropdownMenuItem>Últimos 5 anos</DropdownMenuItem>
                <DropdownMenuItem>Selecionar período</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                <ArrowUpDown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Reordenar</span>
                <span className="sm:hidden">Ordenar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => setSortOrder("relevance")}>
                Relevância
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("date")}>
                Data mais recente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          {results.length > 0 ? `${results.length} resultados encontrados` : 'Nenhum resultado encontrado'}
        </p>

        {results.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum resultado encontrado para sua busca.</p>
            <p className="text-sm text-muted-foreground mt-2">Tente ajustar os termos de busca ou filtros.</p>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {results.map((result, index) => (
            <div 
              key={index} 
              className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-3">
                  {result.orgao_julgador && (
                    <span className="text-sm font-semibold text-primary">
                      {result.orgao_julgador}
                    </span>
                  )}
                  {result.numero_processo && (
                    <span className="text-sm text-foreground">
                      {result.numero_processo}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {result.ementa}
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1 mb-4">
                {result.orgao_julgador && <p>Órgão Julgador: {result.orgao_julgador}</p>}
                {result.relator && <p>Relator: {result.relator}</p>}
                {result.data_julgamento && (
                  <p>Data do Julgamento: {result.data_julgamento}</p>
                )}
                {result.data_publicacao && (
                  <p>Data da Publicação: {result.data_publicacao}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => copyEmenta(result.ementa)}
                  variant="default"
                  size="sm"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar ementa
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TribunalFilterModal
        isOpen={isTribunalModalOpen}
        onClose={() => setIsTribunalModalOpen(false)}
        selectedTribunals={selectedTribunals}
        onApplyFilters={setSelectedTribunals}
      />
    </div>
  );
};

export default Results;