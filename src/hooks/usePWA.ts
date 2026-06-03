import { useState, useEffect } from 'react';
import { Workbox } from 'workbox-window';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAState {
  // Install
  isInstallable: boolean;
  isInstalled: boolean;
  triggerInstall: () => void;
  // Update
  hasUpdate: boolean;
  applyUpdate: () => void;
}

export function usePWA(): PWAState {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [wb, setWb] = useState<Workbox | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    // Detect if already installed (standalone mode)
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsInstalled(mq.matches);
    const mqHandler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener('change', mqHandler);

    // Capture install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Service Worker update detection via workbox-window
    if ('serviceWorker' in navigator) {
      const workbox = new Workbox('/sw.js');

      workbox.addEventListener('waiting', () => {
        setHasUpdate(true);
        setWb(workbox);
      });

      workbox.addEventListener('controlling', () => {
        // After the new SW takes control, reload
        window.location.reload();
      });

      workbox.register().catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      mq.removeEventListener('change', mqHandler);
    };
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstallable(false);
      setInstallPrompt(null);
    }
  };

  const applyUpdate = () => {
    if (!wb) return;
    // Tell waiting SW to skip waiting and activate
    wb.messageSkipWaiting();
  };

  return { isInstallable, isInstalled, triggerInstall, hasUpdate, applyUpdate };
}
