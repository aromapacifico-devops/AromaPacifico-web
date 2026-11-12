"use client";

import { useEffect } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function viewportProgress(element: HTMLElement, viewportHeight: number) {
  const rect = element.getBoundingClientRect();
  return clamp((viewportHeight * 0.86 - rect.top) / (rect.height + viewportHeight * 0.46));
}

export function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const slowUpdate = window.matchMedia("(update: slow)");
    const mobile = window.matchMedia("(max-width: 720px)");
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const progressTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-progress]"));
    const diagramCards = Array.from(document.querySelectorAll<HTMLElement>("[data-diagram-scroll]"));
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-counter]"));
    let animationFrame = 0;

    root.classList.add("motion-ready");

    const exposeEverything = () => {
      revealTargets.forEach((target) => target.setAttribute("data-visible", "true"));
      progressTargets.forEach((target) => {
        const name = target.dataset.scrollProgress;
        if (name) target.style.setProperty(`--${name}-progress`, "1");
        target.querySelectorAll<HTMLElement>("[data-scroll-word]").forEach((word) =>
          word.style.setProperty("--word-progress", "1"),
        );
        target.querySelectorAll<HTMLElement>("[data-journey-step]").forEach((step) =>
          step.style.setProperty("--step-progress", "1"),
        );
      });
      diagramCards.forEach((card) => card.style.setProperty("--diagram-progress", "1"));
      counters.forEach((counter) => {
        counter.textContent = new Intl.NumberFormat("es-CO").format(Number(counter.dataset.counter));
      });
    };

    if (reduceMotion.matches || slowUpdate.matches || !("IntersectionObserver" in window)) {
      root.classList.add("motion-static");
      exposeEverything();
      return () => {
        root.classList.remove("motion-ready", "motion-static");
      };
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12%", threshold: 0.12 },
    );
    revealTargets.forEach((target) => revealObserver.observe(target));

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const counter = entry.target as HTMLElement;
          const target = Number(counter.dataset.counter);
          const start = performance.now();
          const duration = 1100;

          const tick = (now: number) => {
            const progress = clamp((now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = new Intl.NumberFormat("es-CO").format(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          counterObserver.unobserve(counter);
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((counter) => counterObserver.observe(counter));

    const update = () => {
      animationFrame = 0;
      const viewportHeight = window.innerHeight;

      progressTargets.forEach((target) => {
        const name = target.dataset.scrollProgress;
        if (!name) return;
        const rect = target.getBoundingClientRect();
        const progress = name === "hero"
          ? clamp(-rect.top / Math.max(rect.height * 0.82, 1))
          : viewportProgress(target, viewportHeight);

        target.style.setProperty(`--${name}-progress`, progress.toFixed(4));

        if (name === "text") {
          target.querySelectorAll<HTMLElement>("[data-scroll-word]").forEach((word) => {
            const start = Number(word.dataset.wordStart ?? 0);
            word.style.setProperty("--word-progress", clamp((progress - start) * 4.2).toFixed(4));
          });
        }

        if (name === "stack" && !mobile.matches) {
          const cards = target.querySelectorAll<HTMLElement>("[data-stack-card]");
          cards.forEach((card, index) => {
            const cardProgress = clamp(progress * cards.length - index + 0.72);
            card.style.setProperty("--stack-progress", cardProgress.toFixed(4));
          });
        }

        if (name === "journey") {
          const steps = target.querySelectorAll<HTMLElement>("[data-journey-step]");
          steps.forEach((step, index) => {
            const stepProgress = clamp(progress * steps.length - index + 0.55);
            step.style.setProperty("--step-progress", stepProgress.toFixed(4));
            step.toggleAttribute("data-active", stepProgress > 0.5);
          });
        }
      });

      diagramCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const progress = clamp((viewportHeight * 0.94 - rect.top) / (viewportHeight * 0.55));
        card.style.setProperty("--diagram-progress", progress.toFixed(4));
      });
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(update);
    };

    root.classList.add("scroll-story-ready");
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(animationFrame);
      revealObserver.disconnect();
      counterObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      root.classList.remove("motion-ready", "motion-static", "scroll-story-ready");
    };
  }, []);

  return null;
}
