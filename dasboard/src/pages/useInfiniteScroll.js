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
  const isLoadingRef = useRef(false);

  const intersectionCallback = useCallback((entries) => {
    const firstEntry = entries[0];
    if (firstEntry.isIntersecting && hasMore && !isLoading && !isLoadingRef.current) {
      isLoadingRef.current = true;
      onIntersect();
      // Reset the loading flag after a short delay to prevent rapid firing
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 1000);
    }
  }, [onIntersect, hasMore, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(intersectionCallback, { 
      threshold: 0.1, // Reduced threshold to prevent premature triggering
      rootMargin: '50px' // Add margin to prevent triggering too early
    });
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => observer.disconnect();
  }, [intersectionCallback]);

  return observerRef;
};