'use client';

import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function HeaderPwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register the Service Worker for PWA compliance
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
        .catch((err) => console.error('Service Worker registration failed:', err));
    }

    // 2. Listen for the browser's PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Detect if already running in standalone mode (PWA installed and opened)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the browser install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    
    // Clear the deferred prompt variable (it can only be used once)
    setDeferredPrompt(null);
  };

  // If the browser doesn't support the install prompt yet, or if it is already installed, show nothing
  if (!deferredPrompt || isInstalled) return null;

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#d6a827]/60 bg-[#d6a827]/10 rounded-lg text-xs font-bold text-[#fef3c7] hover:bg-[#d6a827]/25 hover:border-[#d6a827] active:scale-[0.98] transition-all duration-150 cursor-pointer animate-pulse"
      title="Install Tarmim Care Pro on your device"
    >
      <Download className="w-4 h-4 text-[#d6a827]" />
      <span>Install App</span>
    </button>
  );
}
