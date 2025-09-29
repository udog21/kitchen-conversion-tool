import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Info } from "lucide-react";
import { type Substitution } from "@shared/schema";

export function SubstitutionsDisplay() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch all substitutions
  const { data: substitutions = [], isLoading } = useQuery<Substitution[]>({
    queryKey: ['/api/substitutions'],
  });

  // Extract unique categories
  const categories = ["all", ...Array.from(new Set(substitutions.map((sub) => sub.category)))];

  // Filter substitutions based on search term and category
  const filteredSubstitutions = substitutions.filter((sub) => {
    const matchesSearch = 
      sub.originalIngredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.substituteIngredient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || sub.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group substitutions by original ingredient
  const groupedSubstitutions = filteredSubstitutions.reduce((acc: Record<string, Substitution[]>, sub) => {
    if (!acc[sub.originalIngredient]) {
      acc[sub.originalIngredient] = [];
    }
    acc[sub.originalIngredient].push(sub);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-substitutions">
        <div className="text-lg text-muted-foreground">Loading substitutions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for an ingredient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-ingredient-search"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              data-testid={`button-category-${category}`}
            >
              {category === "all" ? "All Categories" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Introduction */}
      {searchTerm === "" && selectedCategory === "all" && (
        <Card className="bg-card border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-conversion-accent" />
              Ingredient Substitutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Find common cooking substitutions when you're missing an ingredient. 
              Search for what you need or browse by category to discover alternatives.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Substitutions List */}
      {Object.keys(groupedSubstitutions).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-card-border">
          <h3 className="text-lg font-medium mb-2">No Substitutions Found</h3>
          <p>Try searching for a different ingredient or adjust your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedSubstitutions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([originalIngredient, subs]) => (
              <Card key={originalIngredient} className="bg-card border-card-border">
                <CardHeader>
                  <CardTitle className="text-lg" data-testid={`title-${originalIngredient.replace(/\s+/g, '-').toLowerCase()}`}>
                    {originalIngredient}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subs.map((sub: Substitution, index: number) => (
                      <div 
                        key={`${sub.id}-${index}`} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 rounded-lg"
                        data-testid={`substitution-${originalIngredient.replace(/\s+/g, '-').toLowerCase()}-${index}`}
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-conversion-accent">
                              {sub.substituteIngredient}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {sub.category}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Ratio:</span> {sub.ratio}
                          </div>
                          {sub.notes && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Note:</span> {sub.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Helpful Tips */}
      <Card className="bg-card border-card-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">💡 Substitution Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Always consider how substitutions might affect texture, flavor, and cooking time</p>
          <p>• When substituting liquids for solids (or vice versa), adjust other liquid ingredients</p>
          <p>• Test substitutions in small batches before using in important recipes</p>
          <p>• Some substitutions work better for specific cooking methods (baking vs. cooking)</p>
        </CardContent>
      </Card>
    </div>
  );
}