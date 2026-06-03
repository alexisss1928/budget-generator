import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

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

  const {
    needRefresh: [hasUpdate],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
      // Poll for updates every 60 seconds so the banner appears for long sessions
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

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
    updateServiceWorker(true);
  };

  return { isInstallable, isInstalled, triggerInstall, hasUpdate, applyUpdate };
}
