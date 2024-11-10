import { useEffect, useState } from "react";

type LoadStatus = "pending" | "loaded" | "error" | "none";

export function useImageIsLoaded(src?: string | null) {
  const [isLoaded, setIsLoaded] = useState<LoadStatus>("pending");

  useEffect(() => {
    if (!src) {
      setIsLoaded("none");
      return;
    }

    let isMounted = true;
    const image = new window.Image();

    const createStatusHandler = (status: LoadStatus) => () => {
      if (isMounted) setIsLoaded(status);
    };

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
