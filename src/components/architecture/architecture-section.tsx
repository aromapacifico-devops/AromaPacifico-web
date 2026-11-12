"use client";

import { useCallback, useRef, useState } from "react";
import { diagrams, type Diagram } from "@/content/site";
import { DiagramCard } from "./diagram-card";
import { DiagramViewer } from "./diagram-viewer";

export function ArchitectureSection() {
  const [selected, setSelected] = useState<Diagram | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  function openViewer(diagram: Diagram) {
    triggerRef.current = document.activeElement as HTMLElement;
    setSelected(diagram);
  }

  const closeViewer = useCallback(() => {
    setSelected(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  return (
    <section id="arquitectura" className="architecture-section section-padding">
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
      {selected && <DiagramViewer diagram={selected} onClose={closeViewer} />}
    </section>
  );
}
