import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface TribunalOrgan {
  id: string;
  name: string;
}

interface TribunalData {
  id: string;
  name: string;
  acronym: string;
  organs?: TribunalOrgan[];
}

interface TribunalFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTribunals: string[];
  onApplyFilters: (selected: string[]) => void;
}

const tribunalsData: TribunalData[] = [
  {
    id: "stf",
    name: "STF",
    acronym: "STF",
    organs: [
      { id: "stf-1turma", name: "1ª Turma" },
      { id: "stf-2turma", name: "2ª Turma" },
      { id: "stf-3turma", name: "3ª Turma" },
      { id: "stf-presidente", name: "Presidente" },
      { id: "stf-pleno", name: "Tribunal Pleno" },
      { id: "stf-outros", name: "Outros órgãos julgadores" }
    ]
  },
  {
    id: "stj",
    name: "STJ",
    acronym: "STJ",
    organs: [
      { id: "stj-1secao", name: "1ª Seção" },
      { id: "stj-1turma", name: "1ª Turma" },
      { id: "stj-2secao", name: "2ª Seção" },
      { id: "stj-2turma", name: "2ª Turma" },
      { id: "stj-3secao", name: "3ª Seção" },
      { id: "stj-3turma", name: "3ª Turma" },
      { id: "stj-4turma", name: "4ª Turma" },
      { id: "stj-5turma", name: "5ª Turma" },
      { id: "stj-6turma", name: "6ª Turma" },
      { id: "stj-corte", name: "Corte Especial" },
      { id: "stj-presidencia", name: "Presidência" },
      { id: "stj-vice", name: "Vice-Presidência" },
      { id: "stj-outros", name: "Outros órgãos julgadores" }
    ]
  },
  {
    id: "tst",
    name: "TST",
    acronym: "TST",
    organs: [
      { id: "tst-1turma", name: "1ª Turma" },
      { id: "tst-2turma", name: "2ª Turma" },
      { id: "tst-3turma", name: "3ª Turma" },
      { id: "tst-4turma", name: "4ª Turma" },
      { id: "tst-5turma", name: "5ª Turma" },
      { id: "tst-6turma", name: "6ª Turma" },
      { id: "tst-7turma", name: "7ª Turma" },
      { id: "tst-8turma", name: "8ª Turma" },
      { id: "tst-orgao", name: "Órgão Especial" },
      { id: "tst-presidencia", name: "Presidência" },
      { id: "tst-sdc", name: "Seção Especializada em Dissídios Coletivos" },
      { id: "tst-sdi1", name: "Subseção I Especializada em Dissídios Individuais" },
      { id: "tst-sdi2", name: "Subseção II Especializada em Dissídios Individuais" },
      { id: "tst-pleno", name: "Tribunal Pleno" },
      { id: "tst-vice", name: "Vice-Presidência" },
      { id: "tst-outros", name: "Outros órgãos julgadores" }
    ]
  },
  {
    id: "tjs",
    name: "TJs",
    acronym: "TJs",
    organs: [
      { id: "tj-ac", name: "TJ-AC" },
      { id: "tj-al", name: "TJ-AL" },
      { id: "tj-ap", name: "TJ-AP" },
      { id: "tj-am", name: "TJ-AM" },
      { id: "tj-ba", name: "TJ-BA" },
      { id: "tj-ce", name: "TJ-CE" },
      { id: "tj-df", name: "TJ-DF" },
      { id: "tj-es", name: "TJ-ES" },
      { id: "tj-go", name: "TJ-GO" },
      { id: "tj-ma", name: "TJ-MA" },
      { id: "tj-mt", name: "TJ-MT" },
      { id: "tj-ms", name: "TJ-MS" },
      { id: "tj-mg", name: "TJ-MG" },
      { id: "tj-pa", name: "TJ-PA" },
      { id: "tj-pb", name: "TJ-PB" },
      { id: "tj-pr", name: "TJ-PR" },
      { id: "tj-pe", name: "TJ-PE" },
      { id: "tj-pi", name: "TJ-PI" },
      { id: "tj-rj", name: "TJ-RJ" },
      { id: "tj-rn", name: "TJ-RN" },
      { id: "tj-rs", name: "TJ-RS" },
      { id: "tj-ro", name: "TJ-RO" },
      { id: "tj-rr", name: "TJ-RR" },
      { id: "tj-sc", name: "TJ-SC" },
      { id: "tj-sp", name: "TJ-SP" },
      { id: "tj-se", name: "TJ-SE" },
      { id: "tj-to", name: "TJ-TO" }
    ]
  },
  { id: "trfs", name: "TRFs", acronym: "TRFs" },
  { id: "trts", name: "TRTs", acronym: "TRTs" },
  { id: "tse", name: "TSE", acronym: "TSE" },
  {
    id: "tres",
    name: "TREs",
    acronym: "TREs",
    organs: [
      { id: "tre-ac", name: "TRE-AC" },
      { id: "tre-al", name: "TRE-AL" },
      { id: "tre-ap", name: "TRE-AP" },
      { id: "tre-am", name: "TRE-AM" },
      { id: "tre-ba", name: "TRE-BA" },
      { id: "tre-ce", name: "TRE-CE" },
      { id: "tre-df", name: "TRE-DF" },
      { id: "tre-es", name: "TRE-ES" },
      { id: "tre-go", name: "TRE-GO" },
      { id: "tre-ma", name: "TRE-MA" },
      { id: "tre-mt", name: "TRE-MT" },
      { id: "tre-ms", name: "TRE-MS" },
      { id: "tre-mg", name: "TRE-MG" },
      { id: "tre-pa", name: "TRE-PA" },
      { id: "tre-pb", name: "TRE-PB" },
      { id: "tre-pr", name: "TRE-PR" },
      { id: "tre-pe", name: "TRE-PE" },
      { id: "tre-pi", name: "TRE-PI" },
      { id: "tre-rj", name: "TRE-RJ" },
      { id: "tre-rn", name: "TRE-RN" },
      { id: "tre-rs", name: "TRE-RS" },
      { id: "tre-ro", name: "TRE-RO" },
      { id: "tre-rr", name: "TRE-RR" },
      { id: "tre-sc", name: "TRE-SC" },
      { id: "tre-sp", name: "TRE-SP" },
      { id: "tre-se", name: "TRE-SE" },
      { id: "tre-to", name: "TRE-TO" }
    ]
  },
  { id: "stm", name: "STM", acronym: "STM" },
  {
    id: "tjms",
    name: "TJMs",
    acronym: "TJMs",
    organs: [
      { id: "tjm-mg", name: "TJM-MG" },
      { id: "tjm-rs", name: "TJM-RS" },
      { id: "tjm-sp", name: "TJM-SP" }
    ]
  },
  { id: "tcu", name: "TCU", acronym: "TCU" },
  {
    id: "tces",
    name: "TCEs",
    acronym: "TCEs",
    organs: [
      { id: "tce-ac", name: "TCE-AC" },
      { id: "tce-al", name: "TCE-AL" },
      { id: "tce-ap", name: "TCE-AP" },
      { id: "tce-am", name: "TCE-AM" },
      { id: "tce-ba", name: "TCE-BA" },
      { id: "tce-ce", name: "TCE-CE" },
      { id: "tce-df", name: "TCE-DF" },
      { id: "tce-es", name: "TCE-ES" },
      { id: "tce-go", name: "TCE-GO" },
      { id: "tce-ma", name: "TCE-MA" },
      { id: "tce-mt", name: "TCE-MT" },
      { id: "tce-ms", name: "TCE-MS" },
      { id: "tce-mg", name: "TCE-MG" },
      { id: "tce-pa", name: "TCE-PA" },
      { id: "tce-pb", name: "TCE-PB" },
      { id: "tce-pr", name: "TCE-PR" },
      { id: "tce-pe", name: "TCE-PE" },
      { id: "tce-pi", name: "TCE-PI" },
      { id: "tce-rj", name: "TCE-RJ" },
      { id: "tce-rn", name: "TCE-RN" },
      { id: "tce-rs", name: "TCE-RS" },
      { id: "tce-ro", name: "TCE-RO" },
      { id: "tce-rr", name: "TCE-RR" },
      { id: "tce-sc", name: "TCE-SC" },
      { id: "tce-sp", name: "TCE-SP" },
      { id: "tce-se", name: "TCE-SE" },
      { id: "tce-to", name: "TCE-TO" },
      { id: "tat-ms", name: "TAT-MS" },
      { id: "tat-sc", name: "TAT-SC" },
      { id: "tit-sp", name: "TIT-SP" },
      { id: "cat-go", name: "CAT-GO" }
    ]
  },
  { id: "tnu", name: "TNU", acronym: "TNU" },
  { id: "tru", name: "TRU", acronym: "TRU" },
  { id: "cnj", name: "CNJ", acronym: "CNJ" },
  { id: "carf", name: "CARF", acronym: "CARF" },
  { id: "anac", name: "ANAC", acronym: "ANAC" },
  { id: "ancine", name: "ANCINE", acronym: "ANCINE" },
  { id: "aneel", name: "ANEEL", acronym: "ANEEL" },
  { id: "antaq", name: "ANTAQ", acronym: "ANTAQ" },
  { id: "antt", name: "ANTT", acronym: "ANTT" },
  { id: "cade", name: "CADE", acronym: "CADE" },
  { id: "cfm", name: "CFM", acronym: "CFM" }
];

const TribunalFilterModal = ({ isOpen, onClose, selectedTribunals, onApplyFilters }: TribunalFilterModalProps) => {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedTribunals);
  const [expandedTribunals, setExpandedTribunals] = useState<string[]>(["stf", "stj"]);

  const getAllIds = () => {
    const allIds: string[] = [];
    tribunalsData.forEach(tribunal => {
      allIds.push(tribunal.id);
      if (tribunal.organs) {
        tribunal.organs.forEach(organ => allIds.push(organ.id));
      }
    });
    return allIds;
  };

  const isAllSelected = () => {
    const allIds = getAllIds();
    return allIds.every(id => localSelected.includes(id));
  };

  const handleSelectAll = () => {
    if (isAllSelected()) {
      setLocalSelected([]);
    } else {
      setLocalSelected(getAllIds());
    }
  };

  const toggleTribunal = (tribunalId: string) => {
    setExpandedTribunals(prev => 
      prev.includes(tribunalId) 
        ? prev.filter(id => id !== tribunalId)
        : [...prev, tribunalId]
    );
  };

  const handleTribunalSelection = (tribunal: TribunalData, checked: boolean) => {
    const idsToToggle = [tribunal.id];
    if (tribunal.organs) {
      idsToToggle.push(...tribunal.organs.map(organ => organ.id));
    }

    if (checked) {
      setLocalSelected(prev => [...new Set([...prev, ...idsToToggle])]);
    } else {
      setLocalSelected(prev => prev.filter(id => !idsToToggle.includes(id)));
    }
  };

  const handleOrganSelection = (organId: string, checked: boolean) => {
    if (checked) {
      setLocalSelected(prev => [...prev, organId]);
    } else {
      setLocalSelected(prev => prev.filter(id => id !== organId));
    }
  };

  const isTribunalSelected = (tribunal: TribunalData) => {
    const tribunalIds = [tribunal.id];
    if (tribunal.organs) {
      tribunalIds.push(...tribunal.organs.map(organ => organ.id));
    }
    return tribunalIds.every(id => localSelected.includes(id));
  };

  const isTribunalPartiallySelected = (tribunal: TribunalData) => {
    const tribunalIds = [tribunal.id];
    if (tribunal.organs) {
      tribunalIds.push(...tribunal.organs.map(organ => organ.id));
    }
    const selectedCount = tribunalIds.filter(id => localSelected.includes(id)).length;
    return selectedCount > 0 && selectedCount < tribunalIds.length;
  };

  const handleApply = () => {
    onApplyFilters(localSelected);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelected(selectedTribunals);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Filtrar por tribunal
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecione o tribunal ou o respectivo órgão julgador{" "}
            <span className="bg-accent text-accent-foreground px-2 py-1 rounded text-xs">
              Novo
            </span>
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2">
          <div className="space-y-2">
            {/* Todos */}
            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="todos"
                checked={isAllSelected()}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor="todos"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Todos
              </label>
            </div>

            {/* Tribunais */}
            {tribunalsData.map((tribunal) => (
              <div key={tribunal.id} className="ml-4">
                <div className="flex items-center space-x-2 py-1">
                  {tribunal.organs && (
                    <button
                      onClick={() => toggleTribunal(tribunal.id)}
                      className="p-1 hover:bg-accent rounded"
                    >
                      {expandedTribunals.includes(tribunal.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                  {!tribunal.organs && <div className="w-6" />}
                  
                  <Checkbox
                    id={tribunal.id}
                    checked={isTribunalSelected(tribunal)}
                    onCheckedChange={(checked) => handleTribunalSelection(tribunal, checked as boolean)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor={tribunal.id}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {tribunal.name}
                  </label>
                </div>

                {/* Órgãos do tribunal */}
                {tribunal.organs && expandedTribunals.includes(tribunal.id) && (
                  <div className="ml-8 space-y-1 mt-1">
                    {tribunal.organs.map((organ) => (
                      <div key={organ.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={organ.id}
                          checked={localSelected.includes(organ.id)}
                          onCheckedChange={(checked) => handleOrganSelection(organ.id, checked as boolean)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label
                          htmlFor={organ.id}
                          className="text-sm text-foreground cursor-pointer"
                        >
                          {organ.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleApply} className="bg-primary text-primary-foreground">
            Filtrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TribunalFilterModal;