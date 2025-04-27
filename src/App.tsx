import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage.tsx";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App: Checking for existing session");
    
    // Prevent getting stuck in a loading state with a timeout
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("App: Loading timeout reached, forcing loading state to false");
        setLoading(false);
      }
    }, 5000);
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("App: Session check complete", session ? "Session found" : "No session");
      setSession(session);
      setLoading(false);
    }).catch(error => {
      console.error("App: Error getting session:", error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("App: Auth state changed:", event);
      setSession(session);
      
      // Any auth state change should resolve loading
      if (loading) {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [loading]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage session={session} loading={loading} />} />
              <Route path="/quiz" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
