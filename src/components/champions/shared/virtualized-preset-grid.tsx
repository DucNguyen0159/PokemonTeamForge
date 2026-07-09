"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { cn } from "@/utils";

const ROW_HEIGHT_ESTIMATE = 720;
const OVERSCAN_ROWS = 2;
// Preset cards are taller than a fixed row estimate; keep virtualization off until dynamic measure exists.
const VIRTUALIZE_THRESHOLD = 48;

function useColumnCount(breakpoint = 1024) {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    function update() {
      setColumns(window.innerWidth >= breakpoint ? 2 : 1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  return columns;
}

export function VirtualizedPresetGrid<T>({
  items,
  renderItem,
  className,
  getKey,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  getKey: (item: T, index: number) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);
  const columns = useColumnCount();

  const shouldVirtualize = items.length >= VIRTUALIZE_THRESHOLD;

  const updateScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const nextScrollTop = Math.max(0, -rect.top);
    setScrollTop(nextScrollTop);
    setViewportHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    if (!shouldVirtualize) {
      return;
    }
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [shouldVirtualize, updateScroll, items.length]);

  const { startIndex, endIndex, totalHeight, offsetY } = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: items.length,
        totalHeight: 0,
        offsetY: 0,
      };
    }

    const rowCount = Math.ceil(items.length / columns);
    const total = rowCount * ROW_HEIGHT_ESTIMATE;
    const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT_ESTIMATE) - OVERSCAN_ROWS);
    const visibleRows =
      Math.ceil(viewportHeight / ROW_HEIGHT_ESTIMATE) + OVERSCAN_ROWS * 2;
    const endRow = Math.min(rowCount, startRow + visibleRows);
    const start = startRow * columns;
    const end = Math.min(items.length, endRow * columns);

    return {
      startIndex: start,
      endIndex: end,
      totalHeight: total,
      offsetY: startRow * ROW_HEIGHT_ESTIMATE,
    };
  }, [columns, items.length, scrollTop, shouldVirtualize, viewportHeight]);

  if (!shouldVirtualize) {
    return (
      <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2", className)}>
        {items.map((item, index) => (
          <div key={getKey(item, index)} className="h-full">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div ref={containerRef} className={className} style={{ position: "relative", height: totalHeight }}>
      <div
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        {visibleItems.map((item, index) => (
          <div key={getKey(item, startIndex + index)} className="h-full" style={{ minHeight: ROW_HEIGHT_ESTIMATE }}>
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
}
