"use client";

import { useEffect } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function viewportProgress(element: HTMLElement, viewportHeight: number) {
  const rect = element.getBoundingClientRect();
  return clamp((viewportHeight * 0.86 - rect.top) / (rect.height + viewportHeight * 0.46));
}

function setJourneyCurrent(target: HTMLElement, current: number) {
  if (target.dataset.activeStage === String(current)) return;
  target.dataset.activeStage = String(current);
  const nodes = Array.from(target.querySelectorAll<HTMLElement>("[data-journey-node]"));
  const announcement = nodes[current]?.dataset.stageAnnouncement ?? "";
  const output = target.querySelector<HTMLOutputElement>("[data-journey-output]");
  const index = target.querySelector<HTMLElement>("[data-journey-index]");
  if (output) output.textContent = announcement;
  if (index) index.textContent = String(current + 1).padStart(2, "0");
}

function updateJourney(target: HTMLElement, progress: number, desktop: boolean, viewportHeight: number) {
  const steps = Array.from(target.querySelectorAll<HTMLElement>("[data-journey-step]"));
  const nodes = Array.from(target.querySelectorAll<HTMLElement>("[data-journey-node]"));
  const visuals = Array.from(target.querySelectorAll<HTMLElement>("[data-journey-visual]"));
  let current = 0;

  if (desktop) {
    const activeFloat = progress * Math.max(steps.length - 1, 1);
    current = Math.round(activeFloat);
    steps.forEach((step, index) => {
      const offset = index - activeFloat;
      const presence = clamp(1 - Math.abs(offset));
      step.style.setProperty("--stage-opacity", presence.toFixed(4));
      step.style.setProperty("--stage-x", `${Math.max(-1, Math.min(1, offset)) * 118}px`);
      step.style.setProperty("--stage-y", `${(1 - presence) * 30}px`);
      step.style.setProperty("--stage-scale", (0.9 + presence * 0.1).toFixed(4));
    });
    visuals.forEach((visual, index) => {
      const offset = index - activeFloat;
      const presence = clamp(1 - Math.abs(offset));
      visual.style.setProperty("--stage-opacity", presence.toFixed(4));
      visual.style.setProperty("--stage-x", `${Math.max(-1, Math.min(1, offset)) * 86}px`);
      visual.style.setProperty("--stage-scale", (0.84 + presence * 0.16).toFixed(4));
    });
    nodes.forEach((node, index) => node.toggleAttribute("data-complete", index <= activeFloat + 0.01));
  } else {
    let nearestDistance = Number.POSITIVE_INFINITY;
    steps.forEach((step) => {
      const rect = step.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - viewportHeight * 0.52);
      const presence = clamp(1 - distance / (viewportHeight * 0.68));
      step.style.setProperty("--stage-opacity", (0.42 + presence * 0.58).toFixed(4));
      step.style.setProperty("--stage-x", "0px");
      step.style.setProperty("--stage-y", `${(1 - presence) * 48}px`);
      step.style.setProperty("--stage-scale", (0.94 + presence * 0.06).toFixed(4));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        current = Number(step.dataset.stageIndex ?? 0);
      }
    });
    nodes.forEach((node, index) => node.toggleAttribute("data-complete", index <= current));
  }

  steps.forEach((step, index) => step.toggleAttribute("data-current", index === current));
  visuals.forEach((visual, index) => visual.toggleAttribute("data-current", index === current));
  nodes.forEach((node, index) => {
    if (index === current) node.setAttribute("aria-current", "step");
    else node.removeAttribute("aria-current");
  });
  setJourneyCurrent(target, current);
}

export function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const slowUpdate = window.matchMedia("(update: slow)");
    const desktop = window.matchMedia("(min-width: 901px)");
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
          step.style.setProperty("--stage-opacity", "1"),
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
          ? clamp(-rect.top / Math.max(rect.height * 0.72, 1))
          : name === "journey" && desktop.matches
            ? clamp(-rect.top / Math.max(rect.height - viewportHeight, 1))
            : name === "journey"
              ? clamp((viewportHeight * 0.56 - rect.top) / Math.max(rect.height - viewportHeight * 0.35, 1))
              : viewportProgress(target, viewportHeight);

        target.style.setProperty(`--${name}-progress`, progress.toFixed(4));

        if (name === "text") {
          target.querySelectorAll<HTMLElement>("[data-scroll-word]").forEach((word) => {
            const start = Number(word.dataset.wordStart ?? 0);
            word.style.setProperty("--word-progress", clamp((progress - start) * 4.2).toFixed(4));
          });
        }

        if (name === "stack" && desktop.matches) {
          const cards = Array.from(target.querySelectorAll<HTMLElement>("[data-stack-card]"));
          const activeFloat = progress * Math.max(cards.length - 1, 1);
          const current = Math.round(activeFloat);
          cards.forEach((card, index) => {
            const arrival = clamp(progress * cards.length - index + 0.6);
            const depth = clamp(activeFloat - index);
            card.style.setProperty("--stack-arrival", arrival.toFixed(4));
            card.style.setProperty("--stack-depth", depth.toFixed(4));
            card.toggleAttribute("data-stack-current", index === current);
          });
        }

        if (name === "journey") {
          updateJourney(target, progress, desktop.matches, viewportHeight);
        }

        if (name === "metrics") {
          target.querySelectorAll<HTMLElement>(".metric-card").forEach((card) => {
            const cardRect = card.getBoundingClientRect();
            const cardProgress = clamp((viewportHeight * 0.88 - cardRect.top) / (viewportHeight * 0.42));
            card.style.setProperty("--metric-card-progress", cardProgress.toFixed(4));
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
