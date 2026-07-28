import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Displays a banner at the bottom of the screen when a new version
 * of the app has been deployed.  The user can tap "Update" to reload
 * and pick up the latest content without losing their current session.
 */
export default function UpdatePrompt() {
  const registrationRef = useRef(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      registrationRef.current = r;
    },
  });

  // Check for updates every hour; clean up the interval on unmount.
  useEffect(() => {
    const id = setInterval(() => {
      registrationRef.current?.update();
    }, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="update-banner">
      <span>📦 A new version is available!</span>
      <div className="update-banner-actions">
        <button
          className="update-btn update-btn-primary"
          onClick={() => updateServiceWorker(true)}
        >
          Update now
        </button>
        <button
          className="update-btn update-btn-secondary"
          onClick={() => setNeedRefresh(false)}
        >
          Later
        </button>
      </div>
    </div>
  );
}
