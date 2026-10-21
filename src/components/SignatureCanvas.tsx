import React, { useRef, useEffect, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';

interface SignatureCanvasProps {
  label: string;
  initialDataUrl?: string;
  onChange: (dataUrl: string) => void;
  height?: number;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  label,
  initialDataUrl,
  onChange,
  height = 160,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const currentDataRef = useRef<string>(initialDataUrl || '');

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const targetW = Math.round(rect.width * ratio);
    const targetH = Math.round(height * ratio);

    // Save previous drawing before resize
    const prevImage = currentDataRef.current;

    canvas.width = targetW;
    canvas.height = targetH;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827';

    if (prevImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, height);
      };
      img.src = prevImage;
    }
  }, [height]);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  useEffect(() => {
    if (initialDataUrl && initialDataUrl !== currentDataRef.current) {
      currentDataRef.current = initialDataUrl;
      setupCanvas();
    }
  }, [initialDataUrl, setupCanvas]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    isDrawing.current = true;
    const pt = getCoordinates(e);
    lastPoint.current = pt;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !lastPoint.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPt = getCoordinates(e);
    ctx.lineTo(currentPt.x, currentPt.y);
    ctx.stroke();
    lastPoint.current = currentPt;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    isDrawing.current = false;
    lastPoint.current = null;

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const dataUrl = canvas.toDataURL('image/png');
    currentDataRef.current = dataUrl;
    onChange(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, height);
    currentDataRef.current = '';
    onChange('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 tracking-wide">{label}</label>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 text-xs text-red-700 font-semibold hover:text-red-800 transition py-1 px-2 rounded hover:bg-red-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Limpar assinatura
        </button>
      </div>
      <div className="relative rounded-xl border border-gray-300 bg-white shadow-inner overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full cursor-crosshair touch-none select-none block bg-white"
          style={{ height: `${height}px` }}
        />
        <div className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-gray-400 font-medium select-none">
          Assine aqui com o dedo ou caneta
        </div>
      </div>
    </div>
  );
};
