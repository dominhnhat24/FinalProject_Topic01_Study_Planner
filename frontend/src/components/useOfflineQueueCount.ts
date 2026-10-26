import { useEffect, useState } from "react";
import { readQueue } from "../services/offline";
import { subscribeNetwork } from "../services/network";

export function useOfflineQueueCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let mounted = true;
    const load = () => void readQueue().then((queue) => mounted && setCount(queue.length));
    load();
    const unsubscribe = subscribeNetwork(() => load());
    const timer = setInterval(load, 2500);
    return () => {
      mounted = false;
      unsubscribe();
      clearInterval(timer);
    };
  }, []);
  return count;
}
