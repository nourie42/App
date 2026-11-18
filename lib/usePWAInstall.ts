'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  getInstallPlatform,
  isStandaloneDisplay,
  type InstallPlatform,
} from './pwa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function subscribeStandalone(callback: () => void) {
  const mql = window.matchMedia('(display-mode: standalone)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getStandaloneSnapshot() {
  const mql = window.matchMedia('(display-mode: standalone)');
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return isStandaloneDisplay(mql.matches, nav.standalone);
}

function getServerStandaloneSnapshot() {
  return false;
}

function subscribeNoop() {
  return () => {};
}

function getPlatformSnapshot(): InstallPlatform {
  return getInstallPlatform(window.navigator.userAgent);
}

function getServerPlatformSnapshot(): InstallPlatform {
  return 'browser';
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [appInstalledEvent, setAppInstalledEvent] = useState(false);

  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getServerStandaloneSnapshot
  );

  const platform = useSyncExternalStore(
    subscribeNoop,
    getPlatformSnapshot,
    getServerPlatformSnapshot
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setAppInstalledEvent(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setAppInstalledEvent(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled: isStandalone || appInstalledEvent,
    isIOS: platform === 'ios',
    platform,
    install,
  };
}
