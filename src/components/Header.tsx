import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, User, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface HeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  initialQuery?: string;
}

const Header = ({ onSearch, showSearch = true, initialQuery = "" }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/resultados?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setIsDrawerOpen(false);
  };

  const isResultsPage = location.pathname === "/resultados";

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between w-full md:w-auto">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center">
                <div className="space-y-1">
                  <div className="w-5 h-0.5 sm:w-6 bg-white rounded"></div>
                  <div className="w-5 h-0.5 sm:w-6 bg-white rounded"></div>
                  <div className="w-5 h-0.5 sm:w-6 bg-white rounded"></div>
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-bold">
                <span className="text-foreground">jurisprudência</span>
                <span className="text-muted-foreground">fácil</span>
              </div>
            </button>
            
            {/* Mobile Menu Drawer */}
            <div className="flex md:hidden">
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Menu</DrawerTitle>
                    <DrawerDescription>
                      Navegue pelas opções do site
                    </DrawerDescription>
                  </DrawerHeader>
                  
                  <div className="px-4 py-4 space-y-3">
                    {user ? (
                      <>
                        <div className="flex items-center space-x-2 pb-3 border-b">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground font-medium">
                            {user.user_metadata?.full_name || user.email}
                          </span>
                        </div>
                        
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleNavigate("/minha-assinatura")}
                        >
                          Minha Assinatura
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleNavigate("/planos")}
                        >
                          Ver Planos
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="w-full justify-start text-destructive"
                          onClick={handleSignOut}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sair
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleNavigate("/planos")}
                        >
                          Ver Planos
                        </Button>
                        
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => handleNavigate("/auth")}
                        >
                          Entrar / Cadastrar
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline">Fechar</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
            
          {showSearch && (
            <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-2xl md:mx-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Digite sua pesquisa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-2 w-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/minha-assinatura")}
                  className="text-primary border-primary hover:bg-primary hover:text-primary-foreground hidden lg:inline-flex"
                >
                  Minha Assinatura
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/planos")}
                  className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Planos
                </Button>
                <div className="hidden lg:flex items-center space-x-2 px-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Cadastre-se
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Entrar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;