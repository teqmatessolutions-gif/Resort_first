import { useEffect, useRef, useCallback } from 'react';

/**
 * A custom hook for implementing infinite scrolling.
 * @param {function} onIntersect - The callback function to execute when the trigger element is intersected.
 * @param {boolean} hasMore - A boolean indicating if there is more data to load.
 * @param {boolean} isLoading - A boolean indicating if data is currently being fetched.
 * @returns {React.RefObject} A ref to be attached to the trigger element.
 */
export const useInfiniteScroll = (onIntersect, hasMore, isLoading) => {
  const observerRef = useRef(null);

  const intersectionCallback = useCallback((entries) => {
    const firstEntry = entries[0];
    if (firstEntry.isIntersecting && hasMore && !isLoading) {
      onIntersect();
    }
  }, [onIntersect, hasMore, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(intersectionCallback, { threshold: 1.0 });
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => observer.disconnect();
  }, [intersectionCallback]);

  return observerRef;
};