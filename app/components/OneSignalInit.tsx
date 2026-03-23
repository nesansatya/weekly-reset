'use client';

import { useEffect } from 'react';

export default function OneSignalInit() {
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        const { default: OneSignal } = await import('onesignal-cordova-plugin');
        OneSignal.initialize('21aaff8b-9072-4e3b-a57d-f713b5b9abb3');
        await OneSignal.Notifications.requestPermission(true);
      } catch (e) {
        // Not in a native app environment, skip silently
        console.log('OneSignal not available:', e);
      }
    };

    const onReady = () => {
      initOneSignal();
    };

    if (document.readyState === 'complete') {
      onReady();
    } else {
      document.addEventListener('deviceready', onReady, false);
      window.addEventListener('load', onReady, { once: true });
    }
  }, []);

  return null;
}