const body = document.body;
const pageLoader = document.querySelector(".page-loader");
const revealItems = document.querySelectorAll(".reveal");
const tiltCards = Array.from(document.querySelectorAll("[data-tilt]"));
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const projectVideos = Array.from(document.querySelectorAll(".project-video"));
const interactiveControls = document.querySelectorAll(".button, .project-link, .sound-toggle, .theme-toggle");
const orbs = document.querySelectorAll(".orb");
const mobileCta = document.querySelector(".mobile-cta");
const contactSection = document.querySelector("#contact");
const themeToggleButtons = document.querySelectorAll("[data-theme-toggle]");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const prefersHoverInput = window.matchMedia("(hover: hover) and (pointer: fine)");
const introOverlay = document.getElementById("intro-sequence");
const contactModal = document.getElementById("contact-modal");
const startProjectButtons = document.querySelectorAll('[data-modal-trigger]');
const modalClose = document.querySelector(".modal-close");
const themeStorageKey = "xaurav-theme";
const themeColors = {
  dark: "#07111f",
  light: "#ffffff",
};

const isReducedMotion = () => prefersReducedMotion.matches;
const tiltEnabled = () => !isReducedMotion() && window.innerWidth > 900;
const hoverPreviewEnabled = () => prefersHoverInput.matches && !isReducedMotion();
const getStoredTheme = () => {
  try {
    const savedTheme = localStorage.getItem(themeStorageKey);
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
  } catch (error) {
    return null;
  }
};
const getTheme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

const syncThemeToggleButtons = (theme) => {
  const nextLabel = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
  const isLightTheme = theme === "light";

  themeToggleButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(isLightTheme));
    button.setAttribute("aria-label", nextLabel);
    button.title = nextLabel;
  });
};

const applyTheme = (theme, persist = false) => {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", themeColors[nextTheme]);
  }

  syncThemeToggleButtons(nextTheme);

  if (persist) {
    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch (error) {}
  }
};

applyTheme(getStoredTheme() || getTheme());

themeToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme = getTheme() === "light" ? "dark" : "light";
    applyTheme(nextTheme, true);
  });
});

const runIntroSequence = () => {
  console.log("Attempting to run intro sequence...");
  if (isReducedMotion() || !introOverlay || !window.gsap) {
    console.log("Intro skipped: reduced motion or missing elements/GSAP");
    if (introOverlay) introOverlay.style.display = "none";
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
    return;
  }

  const gsap = window.gsap;
  const charEl = introOverlay.querySelector(".intro-char");
  const contextEl = introOverlay.querySelector(".intro-context");
  
  const introData = [
    { char: "X", context: "XAURAV" },
    { char: "M", context: "MOTIONS" },
    { char: "E", context: "EDITS" },
    { char: "P", context: "PREMIUM" }
  ];

  console.log("Starting GSAP intro timeline...");
  const tl = gsap.timeline({
    onComplete: () => {
      console.log("Intro timeline complete. Revealing main page...");
      gsap.to(introOverlay, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          introOverlay.style.display = "none";
          body.classList.remove("is-loading");
          body.classList.add("is-ready");
          // animateProgressRing() call removed
        }
      });
    }
  });

  introData.forEach((data, i) => {
    tl.to(contextEl, {
      opacity: 0,
      y: -10,
      duration: 0.1
    }, i === 0 ? 0.15 : ">")
    .set(contextEl, { textContent: data.context, y: 10 })
    .to(contextEl, { opacity: 1, y: 0, duration: 0.25, ease: "back.out(1.7)" })
    
    .to(charEl, {
      opacity: 0,
      scale: 0.8,
      duration: 0.1
    }, "<")
    .set(charEl, { textContent: data.char, scale: 1.2 })
    .to(charEl, { opacity: 1, scale: 1, duration: 0.35, ease: "expo.out" })
    
    .to([charEl, contextEl], {
      opacity: 0,
      duration: 0.2,
      delay: 0.25
    });
  });
};



const markPageReady = () => {
  if (pageLoader) {
    pageLoader.classList.add("is-hidden");
    window.setTimeout(() => {
      pageLoader.remove();
      runIntroSequence();
    }, 520);
  } else {
    runIntroSequence();
  }
};

if (document.readyState === "complete" || document.readyState === "interactive") {
  requestAnimationFrame(markPageReady);
} else {
  window.addEventListener(
    "DOMContentLoaded",
    () => {
      window.setTimeout(markPageReady, 30);
    },
    { once: true }
  );
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

interactiveControls.forEach((control) => {
  control.addEventListener("pointerdown", (event) => {
    const rect = control.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "button-ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    control.append(ripple);
    ripple.addEventListener(
      "animationend",
      () => {
        ripple.remove();
      },
      { once: true }
    );
  });
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const tiltStates = tiltCards.map((card) => ({
  card,
  maxTilt:
    card.classList.contains("hero-stage")
      ? 7.5
      : card.classList.contains("case-study-panel") || card.classList.contains("contact-panel")
        ? 4.75
        : 3,
  layers: Array.from(card.querySelectorAll(".layer")).map((layer) => ({
    element: layer,
    depth: Number(layer.dataset.depth || 0),
  })),
  targetX: 0,
  targetY: 0,
  currentX: 0,
  currentY: 0,
}));

const orbOffsets = [
  { x: -25, y: -30, unit: "%" },
  { x: 45, y: 10, unit: "%" },
];

const pointerState = {
  targetX: 0,
  targetY: 0,
  currentX: 0,
  currentY: 0,
};

let sceneFrame = 0;

const renderScene = () => {
  sceneFrame = 0;
  let shouldContinue = false;

  tiltStates.forEach((state) => {
    state.currentX += (state.targetX - state.currentX) * 0.085;
    state.currentY += (state.targetY - state.currentY) * 0.085;

    if (Math.abs(state.targetX - state.currentX) > 0.001 || Math.abs(state.targetY - state.currentY) > 0.001) {
      shouldContinue = true;
    }

    const rotateX = state.currentX * state.maxTilt;
    const rotateY = state.currentY * state.maxTilt;
    state.card.style.transform = `perspective(1600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    state.layers.forEach((layer) => {
      const moveX = state.currentY * layer.depth * 0.75;
      const moveY = -state.currentX * layer.depth * 0.75;
      layer.element.style.transform = `translate3d(${moveX}px, ${moveY}px, ${layer.depth}px)`;
    });
  });

  if (orbs.length) {
    pointerState.currentX += (pointerState.targetX - pointerState.currentX) * 0.055;
    pointerState.currentY += (pointerState.targetY - pointerState.currentY) * 0.055;

    if (
      Math.abs(pointerState.targetX - pointerState.currentX) > 0.001 ||
      Math.abs(pointerState.targetY - pointerState.currentY) > 0.001
    ) {
      shouldContinue = true;
    }

    orbs.forEach((orb, index) => {
      const base = orbOffsets[index] || { x: 0, y: 0, unit: "px" };
      const xOffset = pointerState.currentX * (index === 0 ? 46 : -56);
      const yOffset = pointerState.currentY * (index === 0 ? 36 : -42);
      orb.style.transform = `translate(calc(${base.x}${base.unit} + ${xOffset}px), calc(${base.y}${base.unit} + ${yOffset}px))`;
    });


  }

  if (shouldContinue) {
    scheduleSceneFrame();
  }
};

const scheduleSceneFrame = () => {
  if (isReducedMotion() || sceneFrame) {
    return;
  }

  sceneFrame = window.requestAnimationFrame(renderScene);
};

const resetTiltState = () => {
  tiltStates.forEach((state) => {
    state.targetX = 0;
    state.targetY = 0;
    state.currentX = 0;
    state.currentY = 0;
    state.card.style.transform = "perspective(1600px) rotateX(0deg) rotateY(0deg)";

    state.layers.forEach((layer) => {
      layer.element.style.transform = `translate3d(0, 0, ${layer.depth}px)`;
    });
  });
};

resetTiltState();

if (!isReducedMotion()) {
  tiltStates.forEach((state) => {
    const updateTiltTargets = (event) => {
      if (!tiltEnabled()) {
        return;
      }

      const rect = state.card.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1) - 0.5;
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1) - 0.5;
      state.targetY = x;
      state.targetX = -y;
      scheduleSceneFrame();
    };

    state.card.addEventListener("pointermove", updateTiltTargets, { passive: true });
    state.card.addEventListener("pointerleave", () => {
      state.targetX = 0;
      state.targetY = 0;
      scheduleSceneFrame();
    });
  });

  window.addEventListener(
    "pointermove",
    (event) => {
      if (!tiltEnabled()) {
        return;
      }

      pointerState.targetX = event.clientX / window.innerWidth - 0.5;
      pointerState.targetY = event.clientY / window.innerHeight - 0.5;
      scheduleSceneFrame();
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      if (!tiltEnabled()) {
        resetTiltState();
      }
    },
    { passive: true }
  );
}

const previewStates = projectCards
  .map((card) => {
    const video = card.querySelector("[data-hover-preview]");
    if (!video) {
      return null;
    }

    return {
      card,
      video,
      audioButton: card.querySelector("[data-sound-toggle]"),
      audioEnabled: false,
      initialized: false,
      thumbnailTime: Number(video.dataset.thumbnailTime || 0.8),
      pendingThumbnailHandler: null,
    };
  })
  .filter(Boolean);

const previewMap = new Map(previewStates.map((state) => [state.card, state]));

const clearPendingThumbnail = (state) => {
  if (state.pendingThumbnailHandler) {
    state.video.removeEventListener("seeked", state.pendingThumbnailHandler);
    state.pendingThumbnailHandler = null;
  }
};

const getThumbnailTime = (state) => {
  if (!Number.isFinite(state.video.duration) || state.video.duration <= 0) {
    return 0;
  }

  return Math.min(state.thumbnailTime, Math.max(state.video.duration - 0.15, 0));
};

const showThumbnail = (state) => {
  if (state.card.classList.contains("is-playing")) return; // Critical Bug Fix: Prevent loadeddata from brutally pausing active play

  const targetTime = getThumbnailTime(state);

  if (targetTime <= 0) {
    clearPendingThumbnail(state);
    state.video.pause();
    return;
  }

  clearPendingThumbnail(state);

  state.pendingThumbnailHandler = () => {
    state.video.pause();
    state.pendingThumbnailHandler = null;
  };

  if (Math.abs(state.video.currentTime - targetTime) < 0.05) {
    state.pendingThumbnailHandler();
    return;
  }

  state.video.addEventListener("seeked", state.pendingThumbnailHandler, { once: true });
  state.video.currentTime = targetTime;
};

const primePreview = (state) => {
  if (state.initialized) {
    return;
  }

  state.initialized = true;

  if (state.video.readyState >= 2) {
    showThumbnail(state);
    return;
  }

  state.video.addEventListener(
    "loadeddata",
    () => {
      showThumbnail(state);
    },
    { once: true }
  );

  state.video.load();
};

const updateAudioButton = (state) => {
  if (!state.audioButton) {
    return;
  }

  state.audioButton.textContent = state.audioEnabled ? "Audio On" : "Audio Off";
  state.audioButton.setAttribute("aria-pressed", String(state.audioEnabled));
  state.audioButton.classList.toggle("is-active", state.audioEnabled);
};

const playPreview = (state) => {
  primePreview(state);
  state.card.classList.add("is-playing");
  clearPendingThumbnail(state);

  if (state.video.currentTime > 0.05) {
    state.video.currentTime = 0;
  }

  const playPromise = state.video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      state.card.classList.remove("is-playing");
      state.audioEnabled = false;
      state.video.muted = true;
      updateAudioButton(state);
    });
  }
};

const stopPreview = (state) => {
  state.card.classList.remove("is-playing");
  state.audioEnabled = false;
  state.video.pause();
  state.video.muted = true;
  updateAudioButton(state);
  showThumbnail(state);
};

const stopAllPreviews = (activeState = null) => {
  previewStates.forEach((state) => {
    if (state !== activeState) {
      stopPreview(state);
    }
  });
};

if ("IntersectionObserver" in window) {
  const previewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const state = previewMap.get(entry.target);
          if (state) {
            primePreview(state);
            previewObserver.unobserve(entry.target);
          }
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "1200px 0px",
    }
  );

  const playbackObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          const state = previewMap.get(entry.target.closest('.project-card'));
          if (state && state.card.classList.contains("is-playing")) {
            stopPreview(state);
          }
        }
      });
    },
    {
      threshold: 0,
      rootMargin: "0px",
    }
  );

  previewStates.forEach((state) => {
    previewObserver.observe(state.card);
    playbackObserver.observe(state.video);
  });
} else {
  previewStates.forEach((state) => primePreview(state));
}

previewStates.forEach((state) => {
  state.video.pause();
  state.video.muted = true;
  if (!hoverPreviewEnabled()) {
    state.video.loop = false;
    state.video.addEventListener('ended', () => {
      stopPreview(state);
    });
  }
  updateAudioButton(state);

  state.card.addEventListener("mouseenter", () => {
    if (hoverPreviewEnabled()) {
      playPreview(state);
    }
  });
  state.card.addEventListener("mouseleave", () => {
    if (hoverPreviewEnabled()) {
      stopPreview(state);
    }
  });
  state.card.addEventListener("focusin", () => playPreview(state));
  state.card.addEventListener("focusout", (event) => {
    if (!state.card.contains(event.relatedTarget)) {
      stopPreview(state);
    }
  });
  state.card.addEventListener("click", (event) => {
    if (hoverPreviewEnabled() || event.target.closest("[data-sound-toggle]")) {
      return;
    }

    const shouldActivate = !state.card.classList.contains("is-playing");
    stopAllPreviews(state);

    if (shouldActivate) {
      playPreview(state);
    } else {
      stopPreview(state);
    }
  });

  if (state.audioButton) {
    state.audioButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const nextAudioState = !state.audioEnabled;

      stopAllPreviews(state);

      if (nextAudioState) {
        state.audioEnabled = true;
        state.video.muted = false;
        updateAudioButton(state);
        playPreview(state);
      } else {
        state.audioEnabled = false;
        state.video.muted = true;
        updateAudioButton(state);
      }
    });
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    previewStates.forEach((state) => stopPreview(state));
  }
});

window.addEventListener(
  "pagehide",
  () => {
    previewStates.forEach((state) => stopPreview(state));
  },
  { passive: true }
);

projectCards.forEach((card) => {
  card.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  card.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
});

projectVideos.forEach((video) => {
  video.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  video.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
});

/* ── Contact Modal Logic ── */
if (contactModal) {
  console.log("Contact modal found in DOM, initializing listeners...");
  const openModal = (e) => {
    e.preventDefault();
    console.log("Opening contact modal...");
    contactModal.classList.add("is-active");
    body.classList.add("modal-open");
  };

  const closeModal = () => {
    contactModal.classList.remove("is-active");
    body.classList.remove("modal-open");
  };

  startProjectButtons.forEach(btn => btn.addEventListener("click", openModal));
  if (modalClose) modalClose.addEventListener("click", closeModal);

  contactModal.addEventListener("click", (e) => {
    if (e.target === contactModal) closeModal();
  });

  // Handle escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && contactModal.classList.contains("is-active")) {
      closeModal();
    }
  });

  const modalForm = document.getElementById("async-contact-form");
  if (modalForm) {
    modalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Visual feedback for submission
      const submitBtn = modalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      setTimeout(() => {
        // Mock success
        submitBtn.textContent = "Request Sent!";
        setTimeout(() => {
          closeModal();
          // Reset form after closing
          setTimeout(() => {
            modalForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          }, 600);
        }, 1500);
      }, 2000);
    });
  }
}

if (mobileCta && contactSection && "IntersectionObserver" in window) {
  const ctaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        mobileCta.classList.toggle("is-hidden", entry.isIntersecting);
      });
    },
    {
      threshold: 0.25,
    }
  );

  ctaObserver.observe(contactSection);
}

/* ── Magnetic Button Effect ── */
if (!isReducedMotion() && prefersHoverInput.matches) {
  const magneticElements = document.querySelectorAll(
    ".hero-actions .button, .contact-actions .button, .header-cta, .site-nav a"
  );

  magneticElements.forEach((element) => {
    element.classList.add("is-magnetic");
    let magneticFrame = 0;

    element.addEventListener(
      "mousemove",
      (event) => {
        if (magneticFrame) cancelAnimationFrame(magneticFrame);
        magneticFrame = requestAnimationFrame(() => {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (event.clientX - centerX) * 0.25;
          const deltaY = (event.clientY - centerY) * 0.3;
          element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          magneticFrame = 0;
        });
      },
      { passive: true }
    );

    element.addEventListener(
      "mouseleave",
      () => {
        if (magneticFrame) cancelAnimationFrame(magneticFrame);
        element.style.transform = "";
      },
      { passive: true }
    );
  });
}

/* ── Counter Animation for Hero Metrics ── */
const animateCounters = () => {
  const counterElements = document.querySelectorAll(".hero-metrics strong");
  counterElements.forEach((el) => {
    const text = el.textContent.trim();
    const match = text.match(/^(\d+)(\D*)$/);
    if (!match) return;

    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const duration = 1800;
    const startTime = performance.now();
    el.textContent = "0" + suffix;

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  });
};

const heroMetrics = document.querySelector(".hero-metrics");
if (heroMetrics && "IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counterObserver.observe(heroMetrics);
}
