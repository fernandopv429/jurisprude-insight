import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import TribunalFilterModal from "@/components/TribunalFilterModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchResult {
  id: string;
  title: string;
  court: string;
  type: string;
  date: string;
  summary: string;
  tags: string[];
}

const mockResults: SearchResult[] = [
  {
    id: "1",
    title: "TJ-RJ - APELAÇÃO XXXXX2022819000102050500901",
    court: "Tribunal de Justiça do Rio de Janeiro",
    type: "Acórdão",
    date: "2023-05-15",
    summary: "APELAÇÃO - ARTIGO : 147 -A, § 1º , II, DO CP . PENA: 0 9 meses de reclusão, em regime aberto, e 15 dias- multa . A pena privativa de liberdade restou substituída por duas restritivas de direitos . Desde data que não se sabe precisar, mas sendo certo que até o dia 14 de dezembro de 2 0 22 , por volta das 1 5h, na Avenida Marechal Câmara, altura do nº 16 0, bairro Centro, nesta comarca, o APELADO, de forma livre, consciente e voluntária, perseguiu a vítima Alessandra Vieira Ramos de Albuquerque Silva , por razões da condição do sexo feminino, reiteradamente, ameaçando-lhe a integridade física e psicológica...",
    tags: ["Jurisprudência", "Acórdão", "Mostrar data de publicação"]
  },
  {
    id: "2", 
    title: "STJ - REsp 1.234.567/SP",
    court: "Superior Tribunal de Justiça",
    type: "Recurso Especial",
    date: "2023-04-20",
    summary: "PROCESSUAL CIVIL. RECURSO ESPECIAL. EXECUÇÃO DE TÍTULO EXTRAJUDICIAL. PENHORA ONLINE. SISTEMA BACENJUD. NECESSIDADE DE PRÉVIA INTIMAÇÃO DO DEVEDOR. PRECEDENTES. 1. A jurisprudência do STJ firmou-se no sentido de que a penhora online, por meio do sistema BacenJud, prescinde de prévia intimação do executado, desde que observados os requisitos legais...",
    tags: ["Jurisprudência", "Recurso Especial", "Processual Civil"]
  },
  {
    id: "3",
    title: "TST - RR 1000-20.2019.5.02.0000",
    court: "Tribunal Superior do Trabalho", 
    type: "Recurso de Revista",
    date: "2023-03-10",
    summary: "RECURSO DE REVISTA. RESPONSABILIDADE SUBSIDIÁRIA. ADMINISTRAÇÃO PÚBLICA. TERCEIRIZAÇÃO. CULPA IN VIGILANDO E IN ELIGENDO. O reconhecimento da responsabilidade subsidiária da Administração Pública por débitos trabalhistas de suas contratadas pressupõe a demonstração de sua culpa in vigilando ou in eligendo, não se aplicando a responsabilização automática...",
    tags: ["Jurisprudência", "Recurso de Revista", "Direito do Trabalho"]
  }
];

const Results = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("relevance");
  const [selectedTribunals, setSelectedTribunals] = useState<string[]>([]);
  const [isTribunalModalOpen, setIsTribunalModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setResults(mockResults);
      setIsLoading(false);
    }, 800);
  }, [query]);

  const handleSearch = (newQuery: string) => {
    window.location.href = `/resultados?q=${encodeURIComponent(newQuery)}`;
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
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Jurisprudência sobre <span className="font-bold">{query}</span>
        </h1>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-primary text-primary-foreground">
                  Jurisprudência <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Jurisprudência</DropdownMenuItem>
                <DropdownMenuItem>Legislação</DropdownMenuItem>
                <DropdownMenuItem>Doutrina</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Tipo de julgado <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Todos os julgados</DropdownMenuItem>
                <DropdownMenuItem>Súmulas</DropdownMenuItem>
                <DropdownMenuItem>Acórdãos</DropdownMenuItem>
                <DropdownMenuItem>Decisões</DropdownMenuItem>
                <DropdownMenuItem>Sentenças</DropdownMenuItem>
                <DropdownMenuItem>Despachos</DropdownMenuItem>
                <DropdownMenuItem>Orientações Jurisprudenciais</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              onClick={() => setIsTribunalModalOpen(true)}
            >
              Tribunal <ChevronDown className="ml-2 h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Em qualquer data <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
              <Button variant="outline" size="sm">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Reordenar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder("relevance")}>
                Relevância
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("date")}>
                Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("court")}>
                Tribunal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-muted-foreground mb-6">
          Mais de 10.000 resultados
        </p>

        <div className="space-y-6">
          {results.map((result) => (
            <div 
              key={result.id} 
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="mb-3">
                <h3 className="text-lg font-medium text-law-blue hover:underline mb-2">
                  {result.title}
                </h3>
                <div className="flex items-center space-x-3">
                  {result.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant={index === 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="font-semibold text-sm text-foreground">Ementa:</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {result.summary}
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {result.court} • {result.type} • {new Date(result.date).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="outline">
            Carregar mais resultados
          </Button>
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