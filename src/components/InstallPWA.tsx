import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Download, Check } from 'lucide-react';
import { useToast } from './ui/use-toast';

const InstallPWA = () => {
  const [installable, setInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if the deferredPrompt event has been captured
    const handlePWAInstallable = (e: CustomEvent) => {
      setInstallable(e.detail);
    };

    // Listen for the custom event
    document.addEventListener('pwaInstallable', handlePWAInstallable as EventListener);
    
    // Check if the app is installable on mount
    if (window.installPWA) {
      setInstallable(true);
    }
    
    return () => {
      document.removeEventListener('pwaInstallable', handlePWAInstallable as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    try {
      if (window.installPWA) {
        await window.installPWA();
        setIsInstalled(true);
        toast({
          title: "App Installed",
          description: "Flag Globe Explorer has been installed successfully!",
        });
      }
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        variant: "destructive",
        title: "Installation Failed",
        description: "Could not install the app. Please try again.",
      });
    }
  };

  // If app is already installed, show nothing
  if (isInstalled) {
    return null;
  }

  // Show install button with immediate feedback
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1.5"
      onClick={handleInstallClick}
      disabled={!installable}
    >
      {installable ? (
        <>
          <Download className="h-4 w-4" />
          <span>Install App</span>
        </>
      ) : (
        <>
          <Check className="h-4 w-4" />
          <span>App Ready</span>
        </>
      )}
    </Button>
  );
};

export default InstallPWA; 