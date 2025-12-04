import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/") as string;
    
    // Use Supabase for database queries (if available)
    if (supabase) {
      if (path.startsWith("/api/conversions")) {
        const system = queryKey[1] as string | undefined;
        let query = supabase.from('conversion_ratios').select('*');
        
        if (system) {
          query = query.eq('system', system);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        // Transform to match API format (camelCase)
        return data?.map((r: any) => ({
          id: r.id,
          fromUnit: r.from_unit,
          toUnit: r.to_unit,
          ratio: r.ratio,
          system: r.system,
        })) || [];
      }
      
      if (path === "/api/ingredients") {
        const { data, error } = await supabase
          .from('ingredients')
          .select('*');
        
        if (error) throw error;
        
        // Transform to match API format
        return data?.map((i: any) => ({
          id: i.id,
          name: i.name,
          density: i.density,
          category: i.category,
          source: i.source,
        })) || [];
      }
      
      if (path === "/api/substitution-recipes") {
        const { data, error } = await supabase
          .from('substitution_recipes')
          .select('*');
        
        if (error) throw error;
        
        // Transform to match API format
        return data?.map((s: any) => ({
          id: s.id,
          name: s.name,
          baseAmount: s.base_amount,
          baseUnit: s.base_unit,
          substitutes: s.substitutes,
          instructions: s.instructions,
          fidelity: s.fidelity,
          specialInstructions: s.special_instructions,
        })) || [];
      }
    }
    
    // Fallback to fetch for other endpoints (if any remain)
    const res = await fetch(path, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
