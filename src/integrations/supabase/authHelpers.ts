import { supabase } from './client';

/**
 * Processes hash fragment from OAuth redirects
 * This function will parse the URL hash and attempt to extract auth tokens
 * @returns Promise<boolean> - True if auth was handled, false otherwise
 */
export async function processAuthCallback(): Promise<boolean> {
  try {
    // Check if there's a hash with access token
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      return false;
    }
    
    console.log("Processing auth callback from hash");
    
    // Parse the hash to get the tokens
    const hashParams = parseHash(hash);
    
    if (hashParams.access_token) {
      // First try to directly set session with the access token
      console.log("Setting session directly with token");
      
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: hashParams.access_token,
          refresh_token: hashParams.refresh_token || '',
        });
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          console.log("Successfully set session from token");
          
          // Clean the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          return true;
        }
      } catch (tokenError) {
        console.error("Error setting session directly:", tokenError);
        // Continue to fallback method
      }
    }
    
    // Fallback: Let Supabase handle the hash
    console.log("Fallback: letting Supabase handle hash");
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session from hash:", error);
      throw error;
    }
    
    if (data.session) {
      console.log("Successfully established session from hash");
      
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return true;
    }
    
    // If all else fails, clear the URL and force reload
    console.log("Could not establish session, reloading");
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.reload();
    return true;
  } catch (error) {
    console.error("Error processing auth callback:", error);
    // Force reload as last resort
    window.location.reload();
    return false;
  }
}

/**
 * Parses a URL hash fragment into an object
 * @param hash - Hash fragment starting with #
 * @returns Object with key-value pairs from the hash
 */
export function parseHash(hash: string): Record<string, string> {
  if (!hash || hash.length === 0) return {};
  
  // Remove the leading # if present
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  
  const result: Record<string, string> = {};
  const parts = cleanHash.split('&');
  
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value) {
      result[key] = decodeURIComponent(value);
    }
  }
  
  return result;
} 