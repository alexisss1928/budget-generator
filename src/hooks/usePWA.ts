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
  // Update (mantenido por compatibilidad con PWABanners)
  hasUpdate: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}

export function usePWA(): PWAState {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(false);

  // Con registerType: 'autoUpdate', el SW se actualiza en silencio.
  // needRefresh se activa igual, pero updateServiceWorker(true) fuerza el reload.
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] Service Worker registrado:', r);
      // Buscar actualizaciones cada 5 min en sesiones largas
      if (r) {
        setInterval(() => r.update(), 5 * 60 * 1000);
      }
    },
    onNeedRefresh() {
      console.log('[PWA] Nueva versión disponible — recargando automáticamente');
      // autoUpdate: aplicar la actualización directamente sin pedir confirmación
      updateServiceWorker(true);
    },
    onOfflineReady() {
      console.log('[PWA] ✅ App cacheada y lista para uso offline');
    },
    onRegisterError(error) {
      console.error('[PWA] Error al registrar SW:', error);
    },
  });

  useEffect(() => {
    // Detectar si ya está instalada (modo standalone)
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsInstalled(mq.matches);
    const mqHandler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener('change', mqHandler);

    // Capturar prompt de instalación
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
    setNeedRefresh(false);
    setUpdateDismissed(true);
  }, [setNeedRefresh]);

  // hasUpdate: mantenido por compatibilidad, con autoUpdate raramente se activa
  const hasUpdate = needRefresh && !updateDismissed;

  return { isInstallable, isInstalled, triggerInstall, hasUpdate, applyUpdate, dismissUpdate };
}
