import { Moon, Sun, Menu, Newspaper, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import type { MeasurementSystem } from "@/lib/systemDetection";
import { getSystemInfo } from "@/lib/systemDetection";

interface SiteHeaderProps {
  measurementSystem?: MeasurementSystem;
  onSystemPickerOpen?: () => void;
}

export function SiteHeader({ measurementSystem, onSystemPickerOpen }: SiteHeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [location] = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const systemInfo = measurementSystem ? getSystemInfo(measurementSystem) : null;

  return (
    <header className="flex justify-between items-center p-4 border-b border-border">
      <Link href="/" data-testid="link-home-header">
        <div className="cursor-pointer hover-elevate px-3 py-2 -mx-3 -my-2 rounded-lg transition-all">
          <h1 className="text-xl font-semibold text-foreground">Cup to Grams</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Common kitchen conversions and substitutions for the busy chef
          </p>
        </div>
      </Link>
      
      <div className="flex items-center gap-2">
        {/* Desktop navigation - visible on md and up */}
        <nav className="hidden md:flex items-center gap-1 mr-2" data-testid="nav-desktop">
          <Link href="/blog" data-testid="link-blog-desktop">
            <Button
              variant="ghost"
              size="sm"
              className={location === "/blog" ? "bg-accent" : ""}
            >
              Blog
            </Button>
          </Link>
          
          <span className="text-muted-foreground mx-1">|</span>
          
          <Link href="/privacy" data-testid="link-privacy-desktop">
            <Button
              variant="ghost"
              size="sm"
              className={location === "/privacy" ? "bg-accent" : ""}
            >
              Privacy
            </Button>
          </Link>
          
          <span className="text-muted-foreground mx-1">|</span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            data-testid="button-theme-toggle-desktop"
            className="gap-2"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Mode</span>
          </Button>
        </nav>

        {/* Mobile navigation - visible below md */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              data-testid="button-menu-mobile"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/blog" data-testid="link-blog-mobile">
                <div className="flex items-center gap-2 w-full cursor-pointer">
                  <Newspaper className="h-4 w-4" />
                  <span>Blog</span>
                </div>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/privacy" data-testid="link-privacy-mobile">
                <div className="flex items-center gap-2 w-full cursor-pointer">
                  <Shield className="h-4 w-4" />
                  <span>Privacy Policy</span>
                </div>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={toggleTheme}
              data-testid="button-theme-toggle-mobile"
            >
              <div className="flex items-center gap-2 w-full">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 ml-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="ml-6">
                  {theme === "light" ? "Dark" : "Light"} Mode
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* System selector - always visible if provided */}
        {systemInfo && onSystemPickerOpen && (
          <button
            onClick={onSystemPickerOpen}
            data-testid="button-system-selector"
            className="text-2xl p-2 rounded-lg hover-elevate active-elevate-2 transition-all cursor-pointer"
          >
            {systemInfo.icon || systemInfo.flag}
          </button>
        )}
      </div>
    </header>
  );
}
