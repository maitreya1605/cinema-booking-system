import React, { useState, useEffect } from 'react';
import { Server, X, CheckCircle2, Zap } from 'lucide-react';
import { apiUrl } from '../config/api';

export default function RenderNoticeBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('pixora_render_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'waking' | 'ready' | 'error'

  useEffect(() => {
    if (dismissed) return;

    let isMounted = true;
    let wakeTimer = setTimeout(() => {
      if (isMounted && backendStatus === 'checking') {
        setBackendStatus('waking');
      }
    }, 2500);

    const checkHealth = async () => {
      try {
        const res = await fetch(apiUrl('/api/health'));
        if (res.ok && isMounted) {
          setBackendStatus('ready');
          // Auto-hide after 5 seconds once backend is confirmed ready
          const hideTimer = setTimeout(() => {
            if (isMounted) {
              setDismissed(true);
              try {
                sessionStorage.setItem('pixora_render_banner_dismissed', 'true');
              } catch {}
            }
          }, 5000);
          return () => clearTimeout(hideTimer);
        }
      } catch (err) {
        if (isMounted) setBackendStatus('waking');
      }
    };

    checkHealth();

    // Re-check periodically every 6s if not yet ready
    const interval = setInterval(() => {
      if (backendStatus !== 'ready') {
        checkHealth();
      }
    }, 6000);

    return () => {
      isMounted = false;
      clearTimeout(wakeTimer);
      clearInterval(interval);
    };
  }, [dismissed, backendStatus]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('pixora_render_banner_dismissed', 'true');
    } catch {}
  };

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Server status notice"
      className="relative z-50 w-full bg-[#0d1017]/95 border-b border-amber-500/25 px-3 py-1.5 sm:px-4 text-xs text-gray-300 backdrop-blur-md transition-all duration-300 flex items-center justify-between gap-2 select-none"
    >
      <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
        {/* Render Badge */}
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex-shrink-0">
          <Zap className="w-3 h-3 text-amber-400" />
          Render Free Tier
        </span>

        {/* Live Status Indicator Dot */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {backendStatus === 'ready' ? (
            <span className="relative flex h-2 w-2">
              <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          )}
        </div>

        {/* Message */}
        <p className="text-[11px] sm:text-xs leading-tight">
          {backendStatus === 'ready' ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-400 flex-shrink-0" />
              <span>Backend service active &amp; ready. Enjoy the show!</span>
            </span>
          ) : (
            <span>
              <strong className="text-amber-400 font-semibold">Cold Start Notice:</strong>{' '}
              Hosted on Render free tier — initial backend spin-up may take{' '}
              <span className="text-white font-medium">30–50 seconds</span> after inactivity.
            </span>
          )}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0 ml-2"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

