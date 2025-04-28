import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Session } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/ThemeToggle";
import InstallPWA from "@/components/InstallPWA";
import Index from "./Index";
import "../styles/bubbly-background.css";

interface HomePageProps {
  session: Session | null;
  loading: boolean;
}

export default function HomePage({ session, loading }: HomePageProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  console.log("HomePage render - session:", session?.user?.email, "loading:", loading);
  
  useEffect(() => {
    // Log session state changes
    console.log("HomePage useEffect - session state changed:", 
                session?.user?.email, 
                "loading:", loading);
  }, [session, loading]);

  // Send welcome email to new users
  const sendWelcomeEmail = async (email: string, name: string) => {
    try {
      // Only try to send email if we have an active session
      if (!session?.user?.id) {
        console.log("No active session user ID, skipping welcome email");
        return;
      }
      
      // Check if this is the user's first login by querying the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('created_at, last_login')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }
      
      // If created_at and last_login are close together (within 5 seconds), 
      // this is likely a first-time login
      if (profile) {
        const createdAt = new Date(profile.created_at);
        const lastLogin = profile.last_login ? new Date(profile.last_login) : null;
        const isFirstLogin = !lastLogin || 
                            Math.abs(createdAt.getTime() - (lastLogin?.getTime() || 0)) < 5000;
        
        if (isFirstLogin) {
          // Get welcome email template
          const { data: template, error: templateError } = await supabase
            .from('email_templates')
            .select('*')
            .eq('template_name', 'welcome_email')
            .eq('status', 'active')
            .single();
          
          if (templateError) {
            console.error('Error fetching email template:', templateError);
            return;
          }
          
          if (template) {
            // In a real implementation, you would call your email service here
            console.log(`Sending welcome email to ${email} using template: ${template.template_name}`);
            
            // For demonstration purposes, we're just showing a toast
            toast({
              title: "Welcome to Flag Globe Explorer!",
              description: `Thanks for joining us, ${name}! Check your inbox for a welcome email.`,
              duration: 5000,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Safety check for user metadata
            const metadata = session.user.user_metadata || {};
            const {
              user: {
                id,
                email,
                user_metadata: {
                  full_name = "",
                  avatar_url = "",
                  given_name = "",
                  family_name = "",
                  locale = "",
                } = {}
              }
            } = session;

            console.log("Updating profile for user:", email);
            
            // Update profile with user info from Google for marketing purposes
            const { error: updateError } = await supabase
              .from('profiles')
              .upsert({
                id,
                email,
                full_name,
                avatar_url,
                given_name,
                family_name,
                locale,
                last_login: new Date().toISOString(),
              }, { 
                onConflict: 'id', 
                ignoreDuplicates: false 
              });

            if (updateError) {
              console.error("Profile update error:", updateError);
              throw updateError;
            }

            // Send welcome email for new users
            if (email) {
              await sendWelcomeEmail(email, full_name || given_name || email);
            }

            toast({
              title: "Welcome!",
              description: `Signed in as ${full_name || email}`,
            });
          } catch (error) {
            console.error('Profile update error:', error);
            toast({
              variant: "destructive",
              title: "Error updating profile",
              description: error instanceof Error ? error.message : "Unknown error occurred"
            });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Simplified sign-in function
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Sign-in error:', error);
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: error instanceof Error ? error.message : "Failed to sign in with Google"
      });
      setIsLoading(false);
    }
  };

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, show the quiz - ensure we have a non-null session
  if (session && session.user) {
    console.log("Rendering Quiz for authenticated user:", session.user.email);
    return <Index />;
  }

  // If not authenticated, show the login page
  console.log("Rendering login page - no valid session");
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative">
      {/* Bubbly background */}
      <div className="bubbly-background">
        <div className="bubble bubble-enhanced"></div>
        <div className="bubble bubble-enhanced"></div>
        <div className="bubble bubble-enhanced"></div>
        <div className="bubble bubble-enhanced"></div>
        <div className="bubble bubble-enhanced"></div>
        <div className="bubble bubble-enhanced"></div>
        <div className="bubble bubble-enhanced"></div>
        <div className="bubble bubble-enhanced"></div>
        <div className="bubble bubble-enhanced"></div>
        <div className="bubble bubble-enhanced"></div>
      </div>
      
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <InstallPWA />
        <ThemeToggle />
      </div>
      
      <div className="container container-tight max-w-md mx-auto px-4 flex flex-col items-center z-10 mt-16">
        <header className="text-center mb-8 w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="w-8" /> {/* Spacer for balance */}
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="text-primary">Flag</span> Globe Explorer
            </h1>
            <div className="w-8" /> {/* Spacer for balance */}
          </div>
          <p className="text-muted-foreground">Learn flags from around the world</p>
        </header>

        <div className="w-full space-y-8 bg-card rounded-lg border shadow-sm p-8 pop-in backdrop-blur-sm bg-opacity-80">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
            <p className="text-muted-foreground mb-6">Sign in to start learning flags</p>
          </div>

          <Button
            className="w-full text-white"
            onClick={signInWithGoogle}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Continue with Google"
            )}
          </Button>
        </div>

        <footer className="mt-8 text-center text-muted-foreground text-sm z-10">
          <p>Created with ❤️ | Samuel Momoh</p>
        </footer>
      </div>
    </div>
  );
} 