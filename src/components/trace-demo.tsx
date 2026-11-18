"use client";

import { ArrowRight, CheckCircle2, LoaderCircle, MapPin, Search, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";

type ResultState = "idle" | "loading" | "found" | "not-found";
const stops = [
  { title: "Registro de origen", place: "Cauca, Colombia", date: "07 oct 2026" },
  { title: "Proceso de secado", place: "Finca de origen", date: "09 oct 2026" },
  { title: "Recepción en centro", place: "Centro de acopio", date: "10 oct 2026" },
  { title: "Entrega final", place: "Buenaventura", date: "12 oct 2026" },
];

export function TraceDemo() {
  const [value, setValue] = useState<string>(site.demoCode);
  const [status, setStatus] = useState<ResultState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    timerRef.current = setTimeout(() => {
      setStatus(value.trim().toUpperCase() === site.demoCode ? "found" : "not-found");
    }, 420);
  }

  return (
    <section id="consulta" className="demo-section section-padding">
      <div className="container demo-layout">
        <div className="demo-copy" data-reveal="heading">
          <span className="eyebrow eyebrow--light"><span className="eyebrow-dot"/> UNA VENTANA AL ORIGEN</span>
          <h2>Una historia detrás <em>de cada saco.</em></h2>
          <p>La trazabilidad no debería ser un misterio. Explora cómo podría verse el recorrido de un saco con información pública clara y respetuosa con la privacidad.</p>
          <div className="demo-highlight"><ShieldCheck size={21}/><span>Solo se muestran datos permitidos para consulta pública. Nunca información personal ni ubicación exacta de la finca.</span></div>
        </div>
        <div className="lookup-card" data-reveal="card" aria-busy={status === "loading"}>
          <div className="lookup-top"><span className="lookup-label">CONSULTA DE TRAZABILIDAD</span><span className="demo-tag">DEMO · DATOS FICTICIOS</span></div>
          <div className="lookup-heading"><div className="lookup-icon"><Search size={23}/></div><div><strong>Consulta un saco</strong><span>Prueba con el código de ejemplo.</span></div></div>
          <form onSubmit={onSubmit} className="lookup-form">
            <label htmlFor="sack-code">Código del saco</label>
            <div className="lookup-input-row"><input id="sack-code" type="text" inputMode="text" autoComplete="off" value={value} onChange={(e) => {setValue(e.target.value);setStatus("idle");}} placeholder="AP-XXXX-XXXX-XXXX-X" maxLength={40} aria-describedby="lookup-hint lookup-feedback" aria-invalid={status === "not-found"} /><button type="submit" disabled={status === "loading"} aria-label="Consultar código de ejemplo">{status === "loading" ? <LoaderCircle className="loading-icon" size={20} aria-hidden="true"/> : <ArrowRight size={20} aria-hidden="true"/>}</button></div>
            <span id="lookup-hint" className="lookup-hint">Código de prueba: {site.demoCode}</span>
          </form>
          {status === "idle" && <div className="lookup-empty"><span className="lookup-empty-decor">✳</span><p>Tu historia comienza con un código.</p><span>Haz clic en la flecha para explorar la demostración.</span></div>}
          {status === "loading" && <div id="lookup-feedback" className="lookup-loading" role="status"><LoaderCircle className="loading-icon" aria-hidden="true"/><strong>Preparando la historia ficticia…</strong><span>No se está consultando ningún servicio externo.</span></div>}
          {status === "not-found" && <div id="lookup-feedback" className="lookup-feedback" role="alert"><strong>Código no incluido en la demostración.</strong><span>Esta página no está conectada a datos reales. Usa el código de ejemplo mostrado arriba.</span></div>}
          {status === "found" && <div id="lookup-feedback" className="lookup-result" role="status"><div className="lookup-result-status"><CheckCircle2 size={20}/><div><strong>Recorrido de ejemplo</strong><span>Estado simulado · Entregado</span></div></div><div className="lookup-origin"><MapPin size={17}/><span>Cauca, Colombia → Buenaventura</span></div><ol>{stops.map((stop) => <li key={stop.title}><span className="timeline-dot"/><div><strong>{stop.title}</strong><small>{stop.place}</small></div><time>{stop.date}</time></li>)}</ol><p className="lookup-disclaimer">Todos los datos de este resultado son ficticios. No representan sacos, fincas ni movimientos reales.</p></div>}
        </div>
      </div>
    </section>
  );
}
