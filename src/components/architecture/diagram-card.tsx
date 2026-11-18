import Image from "next/image";
import { Expand } from "lucide-react";
import type { Diagram } from "@/content/site";

type DiagramCardProps = {
  diagram: Diagram;
  onOpen: (diagram: Diagram) => void;
  delay: number;
};

export function DiagramCard({ diagram, onOpen, delay }: DiagramCardProps) {
  return (
    <article
      className="diagram-card"
      data-reveal="card"
      data-diagram-scroll
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      <div className="diagram-preview">
        <Image
          src={diagram.previewSrc}
          width={diagram.width}
          height={diagram.height}
          sizes="(max-width: 720px) 100vw, 50vw"
          alt={`Vista previa del diagrama ${diagram.title}`}
          loading="lazy"
        />
      </div>
      <div className="diagram-card-body">
        <div className="diagram-meta">
          <span className="diagram-number">DIAGRAMA {diagram.number}</span>
          <span>{diagram.category}</span>
        </div>
        <h3>{diagram.title}</h3>
        <p>{diagram.description}</p>
        <div className="diagram-actions">
          <button type="button" onClick={() => onOpen(diagram)} aria-label={`Explorar diagrama: ${diagram.title}`}>
            <Expand size={17} aria-hidden="true" /> Explorar diagrama
          </button>
        </div>
      </div>
    </article>
  );
}
