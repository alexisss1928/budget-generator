import { useState, useEffect, useCallback } from 'react';
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
  dismissUpdate: () => void;
}

export function usePWA(): PWAState {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] Service Worker registrado:', r);
      // Poll for updates every 60 s in long sessions
      if (r) {
        setInterval(() => {
          console.log('[PWA] Buscando actualizaciones...');
          r.update();
        }, 60 * 1000);
      }
    },
    onNeedRefresh() {
      console.log('[PWA] Nueva versión disponible — activando banner');
      setNeedRefresh(true);
    },
    onOfflineReady() {
      console.log('[PWA] App lista para uso offline');
    },
    onRegisterError(error) {
      console.error('[PWA] Error al registrar SW:', error);
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

  const applyUpdate = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  const dismissUpdate = useCallback(() => {
    setUpdateDismissed(true);
  }, []);

  // hasUpdate is true when needRefresh fires AND user hasn't dismissed
  const hasUpdate = needRefresh && !updateDismissed;

  return { isInstallable, isInstalled, triggerInstall, hasUpdate, applyUpdate, dismissUpdate };
}
