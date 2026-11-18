"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./logo";

const nav = [
  { label: "Plataforma", href: "#plataforma", id: "plataforma" },
  { label: "Recorrido", href: "#recorrido", id: "recorrido" },
  { label: "Arquitectura", href: "#arquitectura", id: "arquitectura" },
  { label: "Experiencias", href: "#experiencias", id: "experiencias" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = nav
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -60%", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <div className="header-inner container">
        <Link href="#inicio" className="brand-link" aria-label="Aroma Pacífico, ir al inicio" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav id="mobile-nav" className={`site-nav ${open ? "site-nav--open" : ""}`} aria-label="Navegación principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active === item.id ? "location" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link href="#consulta" className="nav-mobile-cta" onClick={() => setOpen(false)}>
            Consultar ejemplo <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </nav>
        <Link href="#consulta" className="header-cta">Explorar una historia <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
