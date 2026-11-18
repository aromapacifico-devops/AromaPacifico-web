import { ArrowDownRight, CircleUserRound, MapPinned, Ship, Sprout, Truck, Warehouse } from "lucide-react";
import { journey } from "@/content/site";

const iconMap = {
  sprout: Sprout,
  truck: Truck,
  warehouse: Warehouse,
  ship: Ship,
  buyer: CircleUserRound,
};

export function JourneySection() {
  return (
    <section
      id="recorrido"
      className="journey-section journey-story section-padding"
      data-scroll-progress="journey"
      data-active-stage="0"
      aria-labelledby="journey-title"
    >
      <div className="journey-sticky">
        <div className="container journey-story-inner">
          <div className="journey-heading" data-reveal="heading">
            <div>
              <span className="eyebrow eyebrow--dark"><span className="eyebrow-dot" /> DEL ORIGEN AL DESTINO</span>
              <h2 id="journey-title">Un recorrido.<br /><em>Cinco momentos.</em></h2>
            </div>
            <div className="journey-introduction">
              <p>Cada tramo gana protagonismo a medida que avanza la historia conceptual del café.</p>
              <output className="journey-current" data-journey-output aria-live="polite" aria-atomic="true">
                01 · La finca — Donde todo comienza
              </output>
            </div>
          </div>

          <div className="journey-rail" aria-label="Progreso del recorrido conceptual">
            <div className="journey-rail-line" aria-hidden="true">
              <span className="journey-rail-progress" />
            </div>
            <ol>
              {journey.map((item, index) => {
                const Icon = iconMap[item.icon];
                return (
                  <li
                    key={item.number}
                    data-journey-node
                    data-stage-index={index}
                    data-stage-announcement={`${item.number} · ${item.title} — ${item.subtitle}`}
                    aria-current={index === 0 ? "step" : undefined}
                  >
                    <span className="journey-node"><Icon size={25} aria-hidden="true" /></span>
                    <span className="journey-node-label">{item.title}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="journey-scenes">
            <div className="journey-stage-stack">
              <div className="journey-mobile-line" aria-hidden="true"><span /></div>
              {journey.map((item, index) => {
                const Icon = iconMap[item.icon];
                return (
                  <article
                    className="journey-stage-panel"
                    data-journey-step
                    data-stage-index={index}
                    data-current={index === 0 ? "true" : undefined}
                    key={item.number}
                  >
                    <div className="journey-panel-icon" aria-hidden="true"><Icon size={34} /></div>
                    <span className="journey-panel-number">ETAPA {item.number} / 05</span>
                    <span className="journey-subtitle">{item.subtitle}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <span className="journey-panel-status">FLUJO CONCEPTUAL <ArrowDownRight size={16} aria-hidden="true" /></span>
                  </article>
                );
              })}
            </div>

            <div className="journey-visual" aria-hidden="true">
              <div className="journey-visual-grid" />
              <div className="journey-visual-route"><span /><span /><span /><span /><span /></div>
              {journey.map((item, index) => {
                const Icon = iconMap[item.icon];
                return (
                  <div className="journey-visual-stage" data-journey-visual data-stage-index={index} key={item.number}>
                    <span className="journey-visual-orbit" />
                    <div className="journey-visual-icon"><Icon size={72} /></div>
                    <span>{item.number} · {item.subtitle}</span>
                    <strong>{item.title}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="journey-footer">
            <span><MapPinned size={19} aria-hidden="true" /> Cauca, Huila y Tolima → Buenaventura → Comprador</span>
            <span className="journey-stage-count"><b data-journey-index>01</b> / 05</span>
          </div>
        </div>
      </div>
    </section>
  );
}
