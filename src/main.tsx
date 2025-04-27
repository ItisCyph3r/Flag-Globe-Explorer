import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/utilities.css'
import { registerServiceWorker, setupInstallPrompt } from './pwa'

// Register service worker for PWA
registerServiceWorker();

// Setup PWA install prompt
setupInstallPrompt();

// Add theme-related initialization
const syncBodyThemeClass = () => {
  // This ensures the body has the same theme class as the html element
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  document.body.classList.remove('dark', 'light');
  document.body.classList.add(theme);
};

// Initialize theme class on body
syncBodyThemeClass();

// Listen for theme changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.attributeName === 'class') {
      syncBodyThemeClass();
    }
  });
});

observer.observe(document.documentElement, { attributes: true });

createRoot(document.getElementById("root")!).render(<App />);
