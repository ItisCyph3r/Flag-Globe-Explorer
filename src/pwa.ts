// Register service worker for PWA functionality
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  } else {
    console.log('Service Worker is not supported in this browser');
  }
}

// Check if the app can be installed (is PWA-ready)
export function setupInstallPrompt() {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    console.log('App is installable');
    
    // Optionally, show your own install button
    document.dispatchEvent(new CustomEvent('pwaInstallable', { detail: true }));
  });
  
  // Function to trigger install prompt
  // Call this when your install button is clicked
  window.installPWA = () => {
    if (!deferredPrompt) {
      console.log('Installation prompt not available');
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt variable
      deferredPrompt = null;
    });
  };
}

// Add install PWA method to Window interface
declare global {
  interface Window {
    installPWA: () => void;
  }
} 