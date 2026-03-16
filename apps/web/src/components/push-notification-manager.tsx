"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const { data: session } = useSession();
  const registered = useRef(false);

  useEffect(() => {
    if (!session?.user?.id || registered.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    registered.current = true;

    async function setupPush() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        // Check if already subscribed
        const existing = await registration.pushManager.getSubscription();
        if (existing) return;

        // Check if permission was already denied
        if (Notification.permission === "denied") return;

        // Only auto-subscribe if permission was already granted
        // (e.g., user previously enabled it). Otherwise wait for user action.
        if (Notification.permission !== "granted") return;

        const res = await fetch("/api/push-subscriptions/vapid-public-key");
        if (!res.ok) return;
        const { vapidPublicKey } = await res.json();
        if (!vapidPublicKey) return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
        });

        const json = subscription.toJSON();
        await fetch("/api/push-subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
            userAgent: navigator.userAgent,
          }),
        });
      } catch {
        // Push setup is best-effort
      }
    }

    setupPush();
  }, [session?.user?.id]);

  return null;
}

export async function requestPushPermission(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  try {
    const registration = await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) return true;

    const res = await fetch("/api/push-subscriptions/vapid-public-key");
    if (!res.ok) return false;
    const { vapidPublicKey } = await res.json();
    if (!vapidPublicKey) return false;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
    });

    const json = subscription.toJSON();
    await fetch("/api/push-subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
        userAgent: navigator.userAgent,
      }),
    });

    return true;
  } catch {
    return false;
  }
}
