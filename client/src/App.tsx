import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Main converter "pages" - all share the same Home component */}
      <Route path="/" component={Home} />
      <Route path="/temperature" component={Home} />
      <Route path="/volume-weight" component={Home} />
      <Route path="/substitutions" component={Home} />

      {/* Static content */}
      <Route path="/blog" component={Blog} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/about" component={About} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
