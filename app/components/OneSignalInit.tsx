'use client';

import { useEffect } from 'react';

export default function OneSignalInit() {
  useEffect(() => {
    const initOneSignal = async () => {
      const { default: OneSignal } = await import('onesignal-cordova-plugin');
      OneSignal.initialize('21aaff8b-9072-4e3b-a57d-f713b5b9abb3');
      OneSignal.Notifications.requestPermission(true);
    };

    if (typeof window !== 'undefined' && (window as any).cordova) {
      document.addEventListener('deviceready', initOneSignal, false);
    }
  }, []);

  return null;
}