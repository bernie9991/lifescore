import { useEffect, useRef, useState, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true
}: UsePullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, [enabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !isDragging.current || isRefreshing) return;

    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      isDragging.current = false;
      setPullDistance(0);
      return;
    }

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 0) {
      e.preventDefault();
      const distance = Math.min(deltaY / resistance, threshold * 1.5);
      setPullDistance(distance);
    }
  }, [enabled, isRefreshing, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !isDragging.current || isRefreshing) return;

    isDragging.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [enabled, isRefreshing, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullToRefreshStyle = {
    transform: `translateY(${pullDistance}px)`,
    transition: isDragging.current ? 'none' : 'transform 0.3s ease-out'
  };

  const refreshIndicatorStyle = {
    opacity: Math.min(pullDistance / threshold, 1),
    transform: `scale(${Math.min(pullDistance / threshold, 1)})`
  };

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    pullToRefreshStyle,
    refreshIndicatorStyle,
    shouldShowRefreshIndicator: pullDistance > 0 || isRefreshing
  };
};

export default usePullToRefresh;