"use client";

import Image from "next/image";
import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import type { Diagram } from "@/content/site";

type DiagramViewerProps = {
  diagram: Diagram;
  onClose: () => void;
};

type Point = { x: number; y: number };

export function DiagramViewer({ diagram, onClose }: DiagramViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ pointer: Point; origin: Point } | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });

  const fitToScreen = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const nextScale = Math.min(
      (viewport.clientWidth - 32) / diagram.width,
      (viewport.clientHeight - 32) / diagram.height,
      1,
    );
    setScale(Math.max(nextScale, 0.2));
    setPosition({ x: 0, y: 0 });
  }, [diagram.height, diagram.width]);

  const reset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoom = useCallback((amount: number) => {
    setScale((current) => Math.min(3, Math.max(0.2, Number((current + amount).toFixed(2)))));
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const frame = requestAnimationFrame(fitToScreen);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "+" || event.key === "=") zoom(0.2);
      if (event.key === "-") zoom(-0.2);
      if (event.key === "0") reset();
      if (event.key.toLowerCase() === "f") fitToScreen();
      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        const distance = 32;
        setPosition((current) => ({
          x: current.x + (event.key === "ArrowLeft" ? distance : event.key === "ArrowRight" ? -distance : 0),
          y: current.y + (event.key === "ArrowUp" ? distance : event.key === "ArrowDown" ? -distance : 0),
        }));
      }
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", fitToScreen);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", fitToScreen);
    };
  }, [fitToScreen, onClose, reset, zoom]);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointer: { x: event.clientX, y: event.clientY },
      origin: position,
    };
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    setPosition({
      x: dragRef.current.origin.x + event.clientX - dragRef.current.pointer.x,
      y: dragRef.current.origin.y + event.clientY - dragRef.current.pointer.y,
    });
  }

  function stopDrag(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="viewer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="diagram-viewer"
        data-viewer-enter
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewer-title"
      >
        <header className="viewer-header">
          <div>
            <span>DIAGRAMA {diagram.number}</span>
            <h2 id="viewer-title">{diagram.title}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar visor">
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="viewer-toolbar" role="toolbar" aria-label="Controles del diagrama">
          <button type="button" onClick={() => zoom(-0.2)} aria-label="Alejar"><Minus aria-hidden="true" /></button>
          <output aria-live="polite" aria-label="Escala actual">{Math.round(scale * 100)}%</output>
          <button type="button" onClick={() => zoom(0.2)} aria-label="Acercar"><Plus aria-hidden="true" /></button>
          <button type="button" onClick={reset}><RotateCcw aria-hidden="true" /> <span>100%</span></button>
          <button type="button" onClick={fitToScreen}><Maximize2 aria-hidden="true" /> <span>Ajustar</span></button>
        </div>
        <div
          ref={viewportRef}
          className="viewer-viewport"
          tabIndex={0}
          aria-label="Diagrama ampliado. Arrastra o usa las flechas para recorrerlo. Usa más y menos para cambiar el zoom."
          onPointerDown={startDrag}
          onPointerMove={drag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        >
          <div
            className="viewer-canvas"
            style={{
              transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0) scale(${scale})`,
            }}
          >
            <Image src={diagram.src} width={diagram.width} height={diagram.height} alt={diagram.title} priority draggable={false} />
          </div>
        </div>
        <p className="viewer-help">Teclado: +/− zoom · 0 escala real · F ajustar · flechas mover · Esc cerrar</p>
      </div>
    </div>
  );
}
