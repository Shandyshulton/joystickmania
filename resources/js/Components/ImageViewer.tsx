import { useEffect, useRef, useState } from 'react';

/**
 * Modal viewer gambar dengan kontrol zoom in / zoom out / reset.
 * Mendukung mouse drag & touch (geser 1 jari, pinch 2 jari) untuk mobile.
 */
export default function ImageViewer({
    src,
    alt = 'Preview',
    onClose,
}: {
    src: string;
    alt?: string;
    onClose: () => void;
}) {
    const [zoom, setZoom] = useState(100);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0 });

    // Ref untuk state pinch (dipakai handler sentuh)
    const pinchRef = useRef<{
        distance: number;
        startZoom: number;
        startPos: { x: number; y: number };
        lastTouch: { x: number; y: number } | null;
    }>({ distance: 0, startZoom: 100, startPos: { x: 0, y: 0 }, lastTouch: null });

    // Reset zoom setiap gambar baru dibuka
    useEffect(() => {
        setZoom(100);
        setPos({ x: 0, y: 0 });
    }, [src]);

    // Scroll di dalam modal untuk zoom (desktop), Ctrl+wheel
    const handleWheel = (e: React.WheelEvent) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        setZoom((z) => Math.min(400, Math.max(50, z + (e.deltaY > 0 ? -10 : 10))));
    };

    const startDrag = (e: React.MouseEvent) => {
        setDragging(true);
        setStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    };

    const onMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        setPos({ x: e.clientX - start.x, y: e.clientY - start.y });
    };

    const endDrag = () => setDragging(false);

    // ===== Touch (mobile) =====
    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            // Geser satu jari
            const t = e.touches[0];
            setDragging(true);
            setStart({ x: t.clientX - pos.x, y: t.clientY - pos.y });
            pinchRef.current.lastTouch = { x: t.clientX, y: t.clientY };
        } else if (e.touches.length === 2) {
            // Pinch dua jari
            setDragging(false);
            const [a, b] = [e.touches[0], e.touches[1]];
            pinchRef.current = {
                distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
                startZoom: zoom,
                startPos: { ...pos },
                lastTouch: null,
            };
        }
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && dragging) {
            const t = e.touches[0];
            setPos({ x: t.clientX - start.x, y: t.clientY - start.y });
        } else if (e.touches.length === 2) {
            const [a, b] = [e.touches[0], e.touches[1]];
            const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
            const p = pinchRef.current;

            if (p.distance > 0) {
                const ratio = dist / p.distance;
                const newZoom = Math.min(400, Math.max(50, Math.round(p.startZoom * ratio)));
                setZoom(newZoom);
                // Geser mengikuti pergerakan tengah dua jari
                const midX = (a.clientX + b.clientX) / 2;
                const midY = (a.clientY + b.clientY) / 2;
                if (p.lastTouch) {
                    setPos({
                        x: p.startPos.x + (midX - p.lastTouch.x),
                        y: p.startPos.y + (midY - p.lastTouch.y),
                    });
                }
                p.lastTouch = { x: midX, y: midY };
            }
        }
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        setDragging(false);
        if (e.touches.length === 0) {
            pinchRef.current.lastTouch = null;
        }
    };

    const resetView = () => {
        setZoom(100);
        setPos({ x: 0, y: 0 });
    };

    return (
        <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-3 sm:p-6"
            onClick={onClose}
        >
            <div
                className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-night-600 bg-night-900 shadow-neon-sm"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-night-700 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-white">
                            Foto KTP
                        </span>
                        <span className="badge-neon border border-neon-cyan/40 bg-neon-cyan/10 text-xs text-neon-cyan">
                            {zoom}%
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 transition hover:text-white"
                        aria-label="Tutup"
                    >
                        ✕
                    </button>
                </div>

                {/* Canvas gambar (drag saat zoom > 100) */}
                <div
                    className="relative flex-1 overflow-hidden bg-night-950"
                    onWheel={handleWheel}
                    onMouseDown={startDrag}
                    onMouseMove={onMove}
                    onMouseUp={endDrag}
                    onMouseLeave={endDrag}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onTouchCancel={onTouchEnd}
                    style={{
                        cursor: zoom > 100 ? (dragging ? 'grabbing' : 'grab') : 'default',
                        touchAction: 'none',
                    }}
                >
                    <img
                        src={src}
                        alt={alt}
                        className="max-h-full max-w-full select-none object-contain"
                        style={{
                            transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom / 100})`,
                            transformOrigin: 'center',
                        }}
                        draggable={false}
                    />
                    {zoom > 100 && (
                        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] text-slate-300">
                            Geser untuk memindahkan • Cubit (pinch) untuk zoom
                        </div>
                    )}
                </div>

                {/* Kontrol zoom */}
                <div className="flex items-center justify-center gap-3 border-t border-night-700 px-4 py-3">
                    <button
                        onClick={() => setZoom((z) => Math.max(50, z - 10))}
                        className="btn-neon-outline !h-9 !w-9 !p-0 !text-base"
                        aria-label="Zoom out"
                    >
                        −
                    </button>
                    <span className="w-16 text-center font-mono text-sm font-bold text-neon-cyan">
                        {zoom}%
                    </span>
                    <button
                        onClick={() => setZoom((z) => Math.min(400, z + 10))}
                        className="btn-neon-outline !h-9 !w-9 !p-0 !text-base"
                        aria-label="Zoom in"
                    >
                        +
                    </button>
                    <button
                        onClick={resetView}
                        className="btn-neon !px-4 !py-1.5 !text-xs"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
