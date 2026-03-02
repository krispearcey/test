"use strict";

/**
 * main.js
 * - Footer year
 * - Staged hero intro (slide up)
 * - Reveal socials + sections
 * - Projects title appears after 3rd card completes
 * - Horizontal wheel scroll for the project rail
 * - About overlay open/close with per-card colors + closing text animation
 * - Prevent layout shift when scrollbar disappears (padding-right lock)
 */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------
     Footer year
     --------------------------- */
  const yearEl = document.getElementById("y");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------
     No animations on other pages
     --------------------------- */
  const NO_ANIMATIONS = document.body.classList.contains("no-animations");

  /* ---------------------------
     Mark as ready (prevents first-load flashing)
     --------------------------- */
  document.documentElement.classList.add("is-ready");

  /* ---------------------------
     Staged hero intro
     --------------------------- */
  const yourText = "Kris";
  const nameText = "Pearcey";
  const headlineText = "Front-End Development & Design";

  const yourEl = document.getElementById("type-your");
  const nameEl = document.getElementById("type-name");
  const headlineEl = document.getElementById("type-headline");

  const socialsEl = document.querySelector(".socials");
  const revealEls = document.querySelectorAll(".reveal-with-socials");
  const projectsTitle = document.querySelector(".section__title-late");
  const heroHeadline = document.querySelector(".hero__headline");

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function showEverythingFinal() {
    if (yourEl) yourEl.textContent = yourText;
    if (nameEl) nameEl.textContent = nameText;
    if (headlineEl) headlineEl.textContent = headlineText;

    socialsEl?.classList.add("show");
    revealEls.forEach((el) => el.classList.add("show"));
    projectsTitle?.classList.add("in");
  }

  async function runIntro() {
    // Set text immediately (no layout shift)
    if (yourEl) yourEl.textContent = yourText;
    if (nameEl) nameEl.textContent = nameText;
    if (headlineEl) headlineEl.textContent = headlineText;

    requestAnimationFrame(() => {
      yourEl?.classList.add("intro-line-in");
    });

    await sleep(160);
    nameEl?.classList.add("intro-line-in");

    await sleep(220);
    heroHeadline?.classList.add("intro-line-in");

    await sleep(180);
    socialsEl?.classList.add("show");
    revealEls.forEach((el) => el.classList.add("show"));

    // Show projects title after the 3rd card finishes
    const THIRD_CARD_DELAY_MS = 180; // nth-child(3)
    const CARD_ANIM_MS = 760;
    const BUFFER_MS = 60;

    setTimeout(() => {
      projectsTitle?.classList.add("in");
    }, THIRD_CARD_DELAY_MS + CARD_ANIM_MS + BUFFER_MS);
  }

  if (NO_ANIMATIONS) showEverythingFinal();
  else runIntro();

  /* ---------------------------
     Project rail wheel scrolling
     --------------------------- */
  const rail = document.querySelector(".rail");
  if (rail) {
    const GAP = 26;
    const THRESHOLD = 70;
    const MAX_STEPS_PER_GESTURE = 6;
    const COOLDOWN_MS = 220;

    let accum = 0;
    let locked = false;
    let cooldownTimer = null;

    function getStepSize() {
      const firstCard = rail.querySelector(".card");
      const cardW = firstCard ? firstCard.getBoundingClientRect().width : 280;
      return cardW + GAP;
    }

    rail.addEventListener(
      "wheel",
      (e) => {
        const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
        if (maxScrollLeft <= 0) return;

        if (e.shiftKey) return;
        if (!e.target.closest(".rail")) return;

        e.preventDefault();

        const delta =
          Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

        accum += delta;

        if (cooldownTimer) clearTimeout(cooldownTimer);
        cooldownTimer = setTimeout(() => {
          accum = 0;
        }, 300);

        if (locked) return;

        const abs = Math.abs(accum);
        if (abs < THRESHOLD) return;

        const dir = accum > 0 ? 1 : -1;

        let steps = Math.floor(abs / THRESHOLD);
        steps = Math.max(1, Math.min(MAX_STEPS_PER_GESTURE, steps));

        accum = (abs - steps * THRESHOLD) * dir;

        locked = true;

        rail.scrollBy({
          left: dir * steps * getStepSize(),
          behavior: "smooth",
        });

        setTimeout(() => {
          locked = false;
        }, COOLDOWN_MS);
      },
      { passive: false }
    );
  }

  /* ---------------------------
     About Overlay (any card -> full screen)
     --------------------------- */
  const overlay = document.getElementById("aboutOverlay");
  const overlayBg = document.getElementById("aboutOverlayBg");

  const overlayTitleEl = document.getElementById("aboutOverlayTitle");
  const overlayBodyEl = document.getElementById("aboutOverlayBody");
  const overlayMetaEl = document.getElementById("aboutOverlayMeta");
  const overlayPolaroidEl = document.getElementById("aboutOverlayPolaroid");

  const overlayTriggers = document.querySelectorAll("[data-about-overlay]");
  let activeTrigger = null;

  // Prevent layout shift when locking scroll
  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  let closeTimer = null;

  function lockScrollNoShift() {
    const w = getScrollbarWidth();
    document.body.style.paddingRight = w > 0 ? `${w}px` : "";
    document.body.classList.add("is-locked");
  }

  function unlockScrollNoShift() {
    document.body.classList.remove("is-locked");
    document.body.style.paddingRight = "";
  }

  function openAboutOverlay(fromEl) {
    if (!overlay || !overlayBg || !fromEl) return;

    // cancel pending close if user re-opens quickly
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    // reset closing state if user re-opens quickly
    overlay.classList.remove("is-closing");

    activeTrigger = fromEl;

    const title = fromEl.getAttribute("data-overlay-title");
    const body = fromEl.getAttribute("data-overlay-body");
    const meta = fromEl.getAttribute("data-overlay-meta");

    if (overlayTitleEl && title) overlayTitleEl.innerHTML = title;
    const showIcon = fromEl.getAttribute("data-overlay-link-icon");
overlayTitleEl?.classList.toggle(
  "has-link-icon",
  showIcon === "true"
);
    if (overlayBodyEl && body) overlayBodyEl.innerHTML = body;
    if (overlayMetaEl) overlayMetaEl.textContent = meta ?? "";
const polaroidSrc = fromEl.getAttribute("data-overlay-polaroid");

if (overlayPolaroidEl) {
  if (polaroidSrc) {
    overlayPolaroidEl.src = polaroidSrc;
    overlayPolaroidEl.classList.remove("is-hidden");
  } else {
    overlayPolaroidEl.removeAttribute("src");
    overlayPolaroidEl.classList.add("is-hidden");
  }
}
    const bg = fromEl.getAttribute("data-overlay-bg") || "#0b0b0b";
    overlayBg.style.setProperty("--about-overlay-bg", bg);

    const textColor = fromEl.getAttribute("data-overlay-text") || "#14171a";
    overlay.style.setProperty("--about-overlay-text", textColor);

    const rect = fromEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    overlayBg.style.setProperty("--about-w", `${rect.width}px`);
    overlayBg.style.setProperty("--about-h", `${rect.height}px`);

    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const scale = Math.max(vw / rect.width, vh / rect.height);

    const prevTransition = overlayBg.style.transition;
    overlayBg.style.transition = "none";

    overlayBg.style.transform =
      `translate(${cardCenterX - rect.width / 2}px, ${cardCenterY - rect.height / 2}px) scale(1)`;

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    // ✅ lock scroll WITHOUT layout shift
    lockScrollNoShift();

    // force reflow
    overlayBg.getBoundingClientRect();

    requestAnimationFrame(() => {
      overlayBg.style.transition = prevTransition || "";

      requestAnimationFrame(() => {
        // animate bg to fullscreen (centered)
        overlayBg.style.transform =
          `translate(${vw / 2 - rect.width / 2}px, ${vh / 2 - rect.height / 2}px) scale(${scale})`;

        overlay.querySelector(".about-overlay__back")?.focus();
      });
    });
  }

  function closeAboutOverlay() {
    if (!overlay || !overlayBg) return;
    if (!overlay.classList.contains("is-open")) return;

    // start text fade-out immediately
    overlay.classList.add("is-closing");

    overlayPolaroidEl?.classList.add("is-hidden");

    // animate background back to the card if we have one
    if (activeTrigger) {
      const rect = activeTrigger.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      overlayBg.style.transform =
        `translate(${cardCenterX - rect.width / 2}px, ${cardCenterY - rect.height / 2}px) scale(1)`;
    }

    // Match this to: .about-overlay__bg { transition: transform XXXms ... }
    const CLOSE_MS = 620;

    if (closeTimer) clearTimeout(closeTimer);

    closeTimer = window.setTimeout(() => {
      overlay.classList.remove("is-open");
      overlay.classList.remove("is-closing");
      overlay.setAttribute("aria-hidden", "true");

      // ✅ unlock scroll WITHOUT layout shift
      unlockScrollNoShift();

      activeTrigger = null;
      closeTimer = null;
    }, CLOSE_MS);
  }

  // open triggers
  overlayTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openAboutOverlay(trigger);
    });
  });

  // Bulletproof close handler (captures BEFORE anything else)
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!overlay || !overlay.classList.contains("is-open")) return;

      // Back button (or its icon)
      if (e.target.closest(".about-overlay__back")) {
        e.preventDefault();
        e.stopPropagation();
        closeAboutOverlay();
        return;
      }

      // Click outside the dialog column closes
      if (!e.target.closest(".about-overlay__content")) {
        closeAboutOverlay();
      }
    },
    true // capture phase
  );

  // click dimmed area closes (but NOT clicks inside the dialog)
  overlay?.addEventListener("click", (e) => {
    if (!e.target.closest(".about-overlay__content")) {
      closeAboutOverlay();
    }
  });

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAboutOverlay();
  });
});
