import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

const InstallPWA = () => {
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    // Check if the deferredPrompt event has been captured in the pwa.ts file
    const handlePWAInstallable = (e: CustomEvent) => {
      setInstallable(e.detail);
    };

    // Listen for the custom event that's dispatched when the app is installable
    document.addEventListener('pwaInstallable', handlePWAInstallable as EventListener);
    
    return () => {
      document.removeEventListener('pwaInstallable', handlePWAInstallable as EventListener);
    };
  }, []);

  // Handle install button click
  const handleInstallClick = () => {
    if (window.installPWA) {
      window.installPWA();
    }
  };

  // Only show the install button if the app is installable
  if (!installable) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1.5"
      onClick={handleInstallClick}
    >
      <Download className="h-4 w-4" />
      <span>Install App</span>
    </Button>
  );
};

export default InstallPWA; 