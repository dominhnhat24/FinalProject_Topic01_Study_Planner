import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

let latestOnline = true;
let unsubscribe: (() => void) | null = null;
const listeners = new Set<(online: boolean) => void>();

function notify(value: boolean) {
  latestOnline = value;
  listeners.forEach((listener) => listener(value));
}

export function startNetworkMonitor() {
  if (unsubscribe) return;
  unsubscribe = NetInfo.addEventListener((state) => notify(Boolean(state.isConnected && state.isInternetReachable !== false)));
}

export function getIsOnline() {
  return latestOnline;
}

export function subscribeNetwork(listener: (online: boolean) => void) {
  listeners.add(listener);
  listener(latestOnline);
  return () => listeners.delete(listener);
}

export function useNetworkStatus() {
  const [online, setOnline] = useState(getIsOnline());
  useEffect(() => {
    startNetworkMonitor();
    return subscribeNetwork(setOnline);
  }, []);
  return online;
}
