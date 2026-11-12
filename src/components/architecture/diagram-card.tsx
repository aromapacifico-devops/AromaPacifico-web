import Image from "next/image";
import { ArrowUpRight, Expand } from "lucide-react";
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
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      <div className="diagram-preview">
        <Image
          src={diagram.src}
          width={diagram.width}
          height={diagram.height}
          sizes="(max-width: 720px) 100vw, 50vw"
          alt={`Vista previa del diagrama ${diagram.title}`}
        />
      </div>
      <div className="diagram-card-body">
        <span className="diagram-number">DIAGRAMA {diagram.number}</span>
        <h3>{diagram.title}</h3>
        <p>{diagram.description}</p>
        <div className="diagram-actions">
          <button type="button" onClick={() => onOpen(diagram)}>
            <Expand size={17} aria-hidden="true" /> Explorar diagrama
          </button>
          <a href={diagram.source} target="_blank" rel="noopener noreferrer">
            Fuente original <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
