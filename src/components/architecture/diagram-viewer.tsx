"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, LoaderCircle, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { PointerEvent, WheelEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Diagram } from "@/content/site";

type DiagramViewerProps = {
  diagram: Diagram;
  currentIndex: number;
  total: number;
  onNavigate: (direction: -1 | 1) => void;
  onClose: () => void;
};

type Point = { x: number; y: number };
type Transform = { scale: number; position: Point };

const MAX_SCALE = 4;
const VIEWPORT_PADDING = 32;

export function DiagramViewer({ diagram, currentIndex, total, onNavigate, onClose }: DiagramViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ pointer: Point; origin: Point } | null>(null);
  const pinchRef = useRef<{ distance: number; scale: number; local: Point } | null>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const fitScaleRef = useRef(0.2);
  const transformRef = useRef<Transform>({ scale: 1, position: { x: 0, y: 0 } });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [imageState, setImageState] = useState<"loading" | "ready" | "error">("loading");
  const [imageNonce, setImageNonce] = useState(0);

  const constrain = useCallback((next: Point, nextScale: number): Point => {
    const viewport = viewportRef.current;
    if (!viewport) return next;
    const maxX = Math.max(0, (diagram.width * nextScale - viewport.clientWidth) / 2) + 32;
    const maxY = Math.max(0, (diagram.height * nextScale - viewport.clientHeight) / 2) + 32;
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }, [diagram.height, diagram.width]);

  const updateTransform = useCallback((nextScale: number, nextPosition: Point) => {
    const normalizedScale = Math.min(MAX_SCALE, Math.max(fitScaleRef.current, nextScale));
    const normalizedPosition = constrain(nextPosition, normalizedScale);
    transformRef.current = { scale: normalizedScale, position: normalizedPosition };
    setScale(normalizedScale);
    setPosition(normalizedPosition);
  }, [constrain]);

  const fitToScreen = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const nextScale = Math.min(
      (viewport.clientWidth - VIEWPORT_PADDING) / diagram.width,
      (viewport.clientHeight - VIEWPORT_PADDING) / diagram.height,
      1,
    );
    fitScaleRef.current = Math.max(nextScale, 0.08);
    updateTransform(fitScaleRef.current, { x: 0, y: 0 });
  }, [diagram.height, diagram.width, updateTransform]);

  const showActualSize = useCallback(() => updateTransform(1, { x: 0, y: 0 }), [updateTransform]);

  const zoomAt = useCallback((nextScale: number, clientPoint?: Point) => {
    const viewport = viewportRef.current;
    const current = transformRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const anchor = clientPoint ?? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const relative = { x: anchor.x - rect.left - rect.width / 2, y: anchor.y - rect.top - rect.height / 2 };
    const local = {
      x: (relative.x - current.position.x) / current.scale,
      y: (relative.y - current.position.y) / current.scale,
    };
    const normalizedScale = Math.min(MAX_SCALE, Math.max(fitScaleRef.current, nextScale));
    updateTransform(normalizedScale, {
      x: relative.x - local.x * normalizedScale,
      y: relative.y - local.y * normalizedScale,
    });
  }, [updateTransform]);

  const zoomBy = useCallback((factor: number) => zoomAt(transformRef.current.scale * factor), [zoomAt]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setImageState("loading");
      setImageNonce(0);
      fitToScreen();
    });
    return () => cancelAnimationFrame(frame);
  }, [diagram.src, fitToScreen]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const main = document.querySelector("main");
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      inert: main?.hasAttribute("inert") ?? false,
    };
    Object.assign(body.style, {
      position: "fixed",
      top: `-${scrollY}px`,
      left: "0",
      right: "0",
      width: "100%",
      overflow: "hidden",
    });
    main?.setAttribute("inert", "");
    closeRef.current?.focus();

    return () => {
      Object.assign(body.style, {
        position: previous.position,
        top: previous.top,
        left: previous.left,
        right: previous.right,
        width: previous.width,
        overflow: previous.overflow,
      });
      if (!previous.inert) main?.removeAttribute("inert");
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "+" || event.key === "=") zoomBy(1.2);
      if (event.key === "-") zoomBy(1 / 1.2);
      if (event.key === "0") fitToScreen();
      if (event.key === "1") showActualSize();
      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        const current = transformRef.current;
        const distance = 48;
        updateTransform(current.scale, {
          x: current.position.x + (event.key === "ArrowLeft" ? distance : event.key === "ArrowRight" ? -distance : 0),
          y: current.position.y + (event.key === "ArrowUp" ? distance : event.key === "ArrowDown" ? -distance : 0),
        });
      }
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
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
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", fitToScreen);
    };
  }, [fitToScreen, onClose, showActualSize, updateTransform, zoomBy]);

  function startPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);
    if (pointersRef.current.size === 1) {
      dragRef.current = { pointer: point, origin: transformRef.current.position };
    } else if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      const rect = event.currentTarget.getBoundingClientRect();
      const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const relative = { x: midpoint.x - rect.left - rect.width / 2, y: midpoint.y - rect.top - rect.height / 2 };
      const current = transformRef.current;
      pinchRef.current = {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        scale: current.scale,
        local: {
          x: (relative.x - current.position.x) / current.scale,
          y: (relative.y - current.position.y) / current.scale,
        },
      };
      dragRef.current = null;
    }
  }

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = [...pointersRef.current.values()];
      const rect = event.currentTarget.getBoundingClientRect();
      const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const relative = { x: midpoint.x - rect.left - rect.width / 2, y: midpoint.y - rect.top - rect.height / 2 };
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const nextScale = pinchRef.current.scale * (distance / Math.max(1, pinchRef.current.distance));
      updateTransform(nextScale, {
        x: relative.x - pinchRef.current.local.x * nextScale,
        y: relative.y - pinchRef.current.local.y * nextScale,
      });
      return;
    }
    if (dragRef.current) {
      const current = transformRef.current;
      updateTransform(current.scale, {
        x: dragRef.current.origin.x + event.clientX - dragRef.current.pointer.x,
        y: dragRef.current.origin.y + event.clientY - dragRef.current.pointer.y,
      });
    }
  }

  function stopPointer(event: PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const remaining = [...pointersRef.current.values()][0];
    if (remaining) dragRef.current = { pointer: remaining, origin: transformRef.current.position };
  }

  function wheelZoom(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * 0.0015);
    zoomAt(transformRef.current.scale * factor, { x: event.clientX, y: event.clientY });
  }

  const viewer = (
    <div className="viewer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} className="diagram-viewer" data-viewer-enter role="dialog" aria-modal="true" aria-labelledby="viewer-title" aria-describedby="viewer-description">
        <header className="viewer-header">
          <div className="viewer-heading">
            <span>{diagram.category} · DIAGRAMA {diagram.number}</span>
            <h2 id="viewer-title">{diagram.title}</h2>
            <p id="viewer-description">{diagram.description}</p>
          </div>
          <div className="viewer-navigation" aria-label="Navegación entre diagramas">
            <button type="button" onClick={() => onNavigate(-1)} aria-label="Diagrama anterior"><ChevronLeft aria-hidden="true" /></button>
            <output aria-live="polite" aria-label={`Diagrama ${currentIndex + 1} de ${total}`}>{String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</output>
            <button type="button" onClick={() => onNavigate(1)} aria-label="Diagrama siguiente"><ChevronRight aria-hidden="true" /></button>
            <button ref={closeRef} className="viewer-close" type="button" onClick={onClose} aria-label="Cerrar visor"><X aria-hidden="true" /></button>
          </div>
        </header>
        <div className="viewer-toolbar" role="toolbar" aria-label="Controles del diagrama">
          <button type="button" onClick={() => zoomBy(1 / 1.2)} aria-label="Alejar" aria-keyshortcuts="-"><Minus aria-hidden="true" /></button>
          <output className="viewer-scale" aria-live="polite" aria-label="Escala actual">{Math.round(scale * 100)}%</output>
          <button type="button" onClick={() => zoomBy(1.2)} aria-label="Acercar" aria-keyshortcuts="+"><Plus aria-hidden="true" /></button>
          <span className="viewer-toolbar-divider" aria-hidden="true" />
          <button type="button" onClick={fitToScreen} aria-label="Ajustar" aria-keyshortcuts="0"><Maximize2 aria-hidden="true" /> <span>Ajustar</span></button>
          <button type="button" onClick={showActualSize} aria-label="100%" aria-keyshortcuts="1"><RotateCcw aria-hidden="true" /> <span>100%</span></button>
          <span className="viewer-gesture-hint"><Expand aria-hidden="true" /> Rueda o gesto para ampliar</span>
        </div>
        <div
          ref={viewportRef}
          className="viewer-viewport"
          tabIndex={0}
          aria-label="Diagrama ampliado. Arrastra o usa las flechas para recorrerlo. Usa más y menos para cambiar el zoom."
          onPointerDown={startPointer}
          onPointerMove={movePointer}
          onPointerUp={stopPointer}
          onPointerCancel={stopPointer}
          onWheel={wheelZoom}
          onDoubleClick={(event) => zoomAt(transformRef.current.scale * 1.35, { x: event.clientX, y: event.clientY })}
        >
          {imageState === "loading" && <div className="viewer-image-state" role="status"><LoaderCircle aria-hidden="true" /> Preparando diagrama…</div>}
          {imageState === "error" && <div className="viewer-image-state viewer-image-state--error" role="alert"><strong>No fue posible mostrar el diagrama.</strong><button type="button" onClick={() => { setImageState("loading"); setImageNonce((value) => value + 1); }}>Reintentar</button></div>}
          <div className="viewer-canvas" data-image-state={imageState} style={{ transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0) scale(${scale})` }}>
            <Image key={`${diagram.src}-${imageNonce}`} src={diagram.src} width={diagram.width} height={diagram.height} alt={`Diagrama técnico: ${diagram.title}`} priority draggable={false} onLoad={() => setImageState("ready")} onError={() => setImageState("error")} />
          </div>
        </div>
        <p className="viewer-help">Teclado: +/− zoom · 0 ajustar · 1 escala real · flechas mover · Esc cerrar</p>
      </div>
    </div>
  );

  return createPortal(viewer, document.body);
}
