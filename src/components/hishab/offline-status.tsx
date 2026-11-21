import { useSyncExternalStore } from "react";

/**
 * Live online/offline state. Server render and hydration assume online, then
 * the browser's own events take over.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

const readOnline = () => navigator.onLine;
const assumeOnline = () => true;

function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, readOnline, assumeOnline);
}

/**
 * Honest storage status: books are device-only because sync does not exist
 * yet. It must never imply that another device or a server has a copy.
 */
export function OfflineStatus() {
  const online = useOnlineStatus();
  return (
    <p
      role="status"
      aria-live="polite"
      data-online={online ? "yes" : "no"}
      className="flex shrink-0 items-center justify-center gap-2 border-t border-line bg-paper px-4 py-2 text-center text-xs text-ink-soft"
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${online ? "bg-palm" : "bg-clay"}`}
      />
      {online ? (
        <span>শুধু এই ফোনে সেভ · সার্ভারে সিঙ্ক হয় না</span>
      ) : (
        <span>অফলাইন · হিসাব এই ফোনে সেভ হবে · সার্ভারে সিঙ্ক হয় না</span>
      )}
    </p>
  );
}
