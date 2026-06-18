'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HeatmapCanvas.module.css';

const VIRTUAL_W = 1440;
const VIRTUAL_H = 1000;

export default function HeatmapCanvas({ points = [], pageUrl = null }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Responsive scaling
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Scale to fit width
        setScale(rect.width / VIRTUAL_W);
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;

    const ctx = canvas.getContext('2d');
    
    // We draw on the virtual size directly
    canvas.width = VIRTUAL_W;
    canvas.height = VIRTUAL_H;
    
    ctx.clearRect(0, 0, VIRTUAL_W, VIRTUAL_H);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < VIRTUAL_W; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, VIRTUAL_H);
      ctx.stroke();
    }
    for (let y = 0; y < VIRTUAL_H; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIRTUAL_W, y);
      ctx.stroke();
    }

    // Normalize and draw points to the virtual dimensions
    points.forEach((point, i) => {
      // If we don't have viewport data, assume 1440x1000
      const vw = point.viewportW || VIRTUAL_W;
      
      // Calculate X proportional to the virtual width. 
      // This is an approximation for responsive sites, but much better than stretching
      const nx = (point.x / vw) * VIRTUAL_W;
      
      // For Y, we don't stretch based on height ratio, we scale uniformly with X 
      // to preserve the aspect ratio of the elements they clicked on!
      const ny = point.y * (VIRTUAL_W / vw);

      // Draw heat dot
      const radius = 24;
      const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, radius);

      // Color based on density (more recent = hotter)
      const recency = 1 - (i / points.length);
      const r = Math.round(99 + recency * 156);
      const g = Math.round(102 - recency * 60);
      const b = Math.round(241 - recency * 200);

      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
      gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.25)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.beginPath();
      ctx.arc(nx, ny, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Center dot
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + recency * 0.6})`;
      ctx.fill();
    });
  }, [points]);

  // Mouse interaction for tooltips
  const handleMouseMove = (e) => {
    if (points.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse coordinates relative to the SCALED canvas
    const mx = (e.clientX - rect.left) / scale;
    const my = (e.clientY - rect.top) / scale;

    let closest = null;
    let closestDist = 30; // 30px virtual threshold

    points.forEach((point) => {
      const vw = point.viewportW || VIRTUAL_W;
      const nx = (point.x / vw) * VIRTUAL_W;
      const ny = point.y * (VIRTUAL_W / vw);
      
      const dist = Math.sqrt((mx - nx) ** 2 + (my - ny) ** 2);

      if (dist < closestDist) {
        closestDist = dist;
        closest = { ...point, screenX: nx, screenY: ny };
      }
    });

    setHoveredPoint(closest);
  };

  return (
    <div 
      className={styles.container} 
      ref={containerRef} 
      style={{ height: VIRTUAL_H * scale }}
    >
      <div 
        className={styles.virtualWrapper} 
        style={{ 
          transform: `scale(${scale})`,
          width: VIRTUAL_W,
          height: VIRTUAL_H
        }}
      >
        {pageUrl && (
          <iframe
            src={pageUrl}
            className={styles.iframeBackground}
            title="Heatmap Background"
          />
        )}
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />
      </div>

      {points.length === 0 && (
        <div className={styles.emptyOverlay}>
          <div className="empty-icon">🔥</div>
          <h3>No click data</h3>
          <p>Select a page URL above to view its heatmap</p>
        </div>
      )}

      {hoveredPoint && (
        <div
          className={styles.tooltip}
          style={{
            // Scale the tooltip position back down to actual screen pixels
            left: hoveredPoint.screenX * scale + 15,
            top: hoveredPoint.screenY * scale - 10,
          }}
        >
          <div className={styles.tooltipRow}>
            <span>Original XY:</span>
            <span>({hoveredPoint.x}, {hoveredPoint.y})</span>
          </div>
          <div className={styles.tooltipRow}>
            <span>Viewport:</span>
            <span>{hoveredPoint.viewportW}×{hoveredPoint.viewportH}</span>
          </div>
          {hoveredPoint.timestamp && (
            <div className={styles.tooltipRow}>
              <span>Time:</span>
              <span>{new Date(hoveredPoint.timestamp).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.stats}>
        <span>{points.length} click{points.length !== 1 ? 's' : ''} recorded</span>
      </div>
    </div>
  );
}
