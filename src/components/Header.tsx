import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  initialQuery?: string;
}

const Header = ({ onSearch, showSearch = true, initialQuery = "" }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
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

  const isResultsPage = location.pathname === "/resultados";

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <div className="space-y-1">
                  <div className="w-6 h-0.5 bg-white rounded"></div>
                  <div className="w-6 h-0.5 bg-white rounded"></div>
                  <div className="w-6 h-0.5 bg-white rounded"></div>
                </div>
              </div>
              <div className="text-2xl font-bold">
                <span className="text-foreground">jurisprudência</span>
                <span className="text-muted-foreground">fácil</span>
              </div>
            </button>
            
            {showSearch && (
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
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
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/planos")}
                  className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Planos
                </Button>
                <div className="flex items-center space-x-2 px-2">
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