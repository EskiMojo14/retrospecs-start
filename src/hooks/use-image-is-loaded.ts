import { radEventListeners } from "rad-event-listeners";
import { useEffect, useState } from "react";

type LoadStatus = "pending" | "loaded" | "error" | "none";

export function useImageIsLoaded(src?: string | null) {
  const [loadState, setLoadState] = useState<LoadStatus>("pending");

  useEffect(() => {
    if (!src) {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setLoadState("none");
      return;
    }

    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setLoadState("pending");

    const img = new Image();
    const unsub = radEventListeners(img, {
      error() {
        setLoadState("error");
      },
      load() {
        setLoadState("loaded");
      },
    });
    img.src = src;

    return unsub;
  }, [src]);

  return loadState;
}
