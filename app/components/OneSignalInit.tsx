'use client';

import { useEffect } from 'react';

export default function OneSignalInit() {
  useEffect(() => {
    const init = () => {
      try {
        // @ts-ignore
        const OneSignal = (window as any).plugins?.OneSignal;
        if (!OneSignal) {
          console.log('OneSignal plugin not found');
          return;
        }

        OneSignal.setAppId('21aaff8b-9072-4e3b-a57d-f713b5b9abb3');

        OneSignal.setNotificationOpenedHandler((result: any) => {
          console.log('OneSignal notification opened:', result);
        });

        OneSignal.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
          console.log('User accepted push notifications:', accepted);
        });

      } catch (e) {
        console.log('OneSignal init error:', e);
      }
    };

    // Wait for Capacitor/Cordova deviceready event
    document.addEventListener('deviceready', init, false);

    return () => {
      document.removeEventListener('deviceready', init);
    };
  }, []);

  return null;
}