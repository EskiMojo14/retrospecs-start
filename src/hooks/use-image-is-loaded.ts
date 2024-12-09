import { useEffect, useState } from "react";

type LoadStatus = "pending" | "loaded" | "error" | "none";

export function useImageIsLoaded(src?: string | null) {
  const [isLoaded, setIsLoaded] = useState<LoadStatus>("pending");

  useEffect(() => {
    if (!src) {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setIsLoaded("none");
      return;
    }

    let isMounted = true;
    const image = new window.Image();

    const createStatusHandler = (status: LoadStatus) => () => {
      if (isMounted) setIsLoaded(status);
    };

    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setIsLoaded("pending");
    image.onload = createStatusHandler("loaded");
    image.onerror = createStatusHandler("error");
    image.src = src;

    return () => {
      isMounted = false;
    };
  }, [src]);

  return isLoaded;
}
