"use client";

import { useCallback, useRef, useState } from "react";
import { diagrams, type Diagram } from "@/content/site";
import { DiagramCard } from "./diagram-card";
import { DiagramViewer } from "./diagram-viewer";

export function ArchitectureSection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  function openViewer(diagram: Diagram) {
    triggerRef.current = document.activeElement as HTMLElement;
    setSelectedIndex(diagrams.indexOf(diagram));
  }

  const closeViewer = useCallback(() => {
    setSelectedIndex(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const navigateViewer = useCallback((direction: -1 | 1) => {
    setSelectedIndex((current) => current === null ? null : (current + direction + diagrams.length) % diagrams.length);
  }, []);

  return (
    <section id="arquitectura" className="architecture-section section-padding" data-scroll-progress="architecture">
      <div className="container">
        <div className="architecture-heading" data-reveal="heading">
          <div>
            <span className="eyebrow eyebrow--dark"><span className="eyebrow-dot" /> ARQUITECTURA PROPUESTA</span>
            <h2>Arquitectura de <em>AromaPacífico.</em></h2>
          </div>
          <p>
            Cuatro vistas oficiales conectan la infraestructura definida mediante Terraform, las comunicaciones del piloto,
            la trazabilidad orientada a eventos y el transporte de objetos de vuelo. Los diagramas describen el diseño; no
            representan servicios desplegados.
          </p>
        </div>
        <div className="diagram-grid">
          {diagrams.map((diagram, index) => (
            <DiagramCard key={diagram.number} diagram={diagram} onOpen={openViewer} delay={index * 80} />
          ))}
        </div>
      </div>
      {selectedIndex !== null && (
        <DiagramViewer
          diagram={diagrams[selectedIndex]}
          currentIndex={selectedIndex}
          total={diagrams.length}
          onNavigate={navigateViewer}
          onClose={closeViewer}
        />
      )}
    </section>
  );
}
