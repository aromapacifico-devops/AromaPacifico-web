"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";

const nav = [
  { label: "La plataforma", href: "#plataforma" },
  { label: "El recorrido", href: "#recorrido" },
  { label: "Experiencias", href: "#experiencias" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link href="#inicio" className="brand-link" aria-label="AromaPacífico, ir al inicio" onClick={() => setOpen(false)}><Logo /></Link>
        <nav id="mobile-nav" className={`site-nav ${open ? "site-nav--open" : ""}`} aria-label="Navegación principal">
          {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
          <Link href="#consulta" className="nav-mobile-cta" onClick={() => setOpen(false)}>Consultar ejemplo <ArrowUpRight size={15}/></Link>
        </nav>
        <Link href="#consulta" className="header-cta">Explorar una historia <ArrowUpRight size={16}/></Link>
        <button type="button" className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Cerrar menú" : "Abrir menú"}>{open ? <X/> : <Menu/>}</button>
      </div>
    </header>
  );
}
