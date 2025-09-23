import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Tribunal {
  id: string;
  name: string;
  acronym: string;
  category: "superior" | "regional";
  hasSubTribunals?: boolean;
}

interface TribunalSelectorProps {
  selectedTribunals: string[];
  onSelectionChange: (selected: string[]) => void;
}

const tribunals: Tribunal[] = [
  { id: "stf", name: "Supremo Tribunal Federal", acronym: "STF", category: "superior" },
  { id: "stj", name: "Superior Tribunal de Justiça", acronym: "STJ", category: "superior" },
  { id: "tst", name: "Tribunal Superior do Trabalho", acronym: "TST", category: "superior" },
  { id: "tse", name: "Tribunal Superior Eleitoral", acronym: "TSE", category: "superior" },
  { id: "stm", name: "Superior Tribunal Militar", acronym: "STM", category: "superior" },
  { id: "tcu", name: "Tribunal de Contas da União", acronym: "TCU", category: "superior" },
  { id: "tnu", name: "Turma Nacional de Uniformização", acronym: "TNU", category: "superior" },
  { id: "tru", name: "Turma Regional de Uniformização", acronym: "TRU", category: "superior" },
  { id: "cnj", name: "Conselho Nacional de Justiça", acronym: "CNJ", category: "superior" },
  { id: "tj", name: "Tribunais de Justiça", acronym: "TJ", category: "regional", hasSubTribunals: true },
  { id: "trf", name: "Tribunais Regionais Federais", acronym: "TRF", category: "regional", hasSubTribunals: true },
  { id: "trt", name: "Tribunais Regionais do Trabalho", acronym: "TRT", category: "regional", hasSubTribunals: true },
  { id: "tre", name: "Tribunais Regionais Eleitorais", acronym: "TRE", category: "regional", hasSubTribunals: true },
  { id: "tjm", name: "Tribunais de Justiça Militar", acronym: "TJM", category: "regional", hasSubTribunals: true },
  { id: "tce", name: "Tribunais de Contas dos Estados", acronym: "TCE", category: "regional", hasSubTribunals: true },
];

const TribunalSelector = ({ selectedTribunals, onSelectionChange }: TribunalSelectorProps) => {
  const handleTribunalChange = (tribunalId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTribunals, tribunalId]);
    } else {
      onSelectionChange(selectedTribunals.filter(id => id !== tribunalId));
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(tribunals.map(t => t.id));
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const superiorTribunals = tribunals.filter(t => t.category === "superior");
  const regionalTribunals = tribunals.filter(t => t.category === "regional");

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Buscar em:</h3>
        <div className="flex space-x-2">
          <Button 
            variant="link" 
            size="sm" 
            onClick={handleSelectAll}
            className="text-law-blue"
          >
            Marcar todos
          </Button>
          <span className="text-muted-foreground">•</span>
          <Button 
            variant="link" 
            size="sm" 
            onClick={handleDeselectAll}
            className="text-law-blue"
          >
            Desmarcar todos
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {superiorTribunals.map((tribunal) => (
            <div key={tribunal.id} className="flex items-center space-x-2 mb-3">
              <Checkbox
                id={tribunal.id}
                checked={selectedTribunals.includes(tribunal.id)}
                onCheckedChange={(checked) => handleTribunalChange(tribunal.id, checked as boolean)}
              />
              <label
                htmlFor={tribunal.id}
                className="text-sm text-foreground cursor-pointer hover:text-law-blue transition-colors"
              >
                {tribunal.name} ({tribunal.acronym})
              </label>
            </div>
          ))}
        </div>

        <div>
          {regionalTribunals.map((tribunal) => (
            <div key={tribunal.id} className="mb-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={tribunal.id}
                  checked={selectedTribunals.includes(tribunal.id)}
                  onCheckedChange={(checked) => handleTribunalChange(tribunal.id, checked as boolean)}
                />
                <label
                  htmlFor={tribunal.id}
                  className="text-sm text-foreground cursor-pointer hover:text-law-blue transition-colors"
                >
                  {tribunal.name} ({tribunal.acronym})
                </label>
              </div>
              {tribunal.hasSubTribunals && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="ml-6 text-xs text-law-blue p-0 h-auto"
                >
                  Selecionar tribunais
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TribunalSelector;