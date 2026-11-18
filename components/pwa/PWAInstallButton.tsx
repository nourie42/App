'use client';

import { useState } from 'react';
import { Check, Copy, Download, Monitor, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '@/lib/usePWAInstall';

export function PWAInstallButton({
  variant = 'dark',
}: {
  variant?: 'dark' | 'light';
}) {
  const { isInstallable, isInstalled, isIOS, platform, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  // Suppress button cleanly when already running in standalone app mode
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowGuide(true);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const buttonClasses =
    variant === 'dark'
      ? 'inline-flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 border border-blue-400/40'
      : 'inline-flex items-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 border border-blue-600';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={buttonClasses}
        aria-label={isIOS ? 'Install app on iOS' : 'Install app'}
      >
        <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0d213d] text-white flex items-center justify-center shrink-0">
                  {isIOS ? (
                    <Smartphone className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Monitor className="w-5 h-5" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h2 id="pwa-install-title" className="text-lg font-bold text-slate-900 m-0">
                    Install Weather Nourie
                  </h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Add Weather Nourie as a standalone home screen or desktop app
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close install instructions"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-700">
              {platform === 'ios' ? (
                <ol className="space-y-2.5 pl-4 list-decimal">
                  <li>
                    Tap the <strong className="inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline" aria-hidden="true" /> Share</strong> button in the Safari toolbar.
                  </li>
                  <li>
                    Scroll down and select <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> to launch Weather Nourie full-screen from your Home Screen.
                  </li>
                </ol>
              ) : platform === 'safari-mac' ? (
                <ol className="space-y-2.5 pl-4 list-decimal">
                  <li>
                    In Safari, open the <strong>File</strong> menu or click the <strong>Share</strong> icon in the toolbar.
                  </li>
                  <li>
                    Choose <strong>Add to Dock</strong> to run Weather Nourie as a standalone macOS app.
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2.5 pl-4 list-decimal">
                  <li>
                    Open this page directly in Chrome or Edge (outside embedded preview frames if applicable).
                  </li>
                  <li>
                    Click the <strong>Install</strong> icon in the browser address bar, or open the browser menu and select <strong>Install Weather Nourie</strong>.
                  </li>
                </ol>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span>URL Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy App URL</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0d213d] hover:bg-[#173660] rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
