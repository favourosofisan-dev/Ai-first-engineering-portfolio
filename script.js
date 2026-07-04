const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".site-nav a");
const yearNode = document.getElementById("year");
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-showcase");
const newsletterForms = document.querySelectorAll("[data-newsletter-form]");
const consentText = "I agree to receive occasional emails from Favour Osofisan (no spam, unsubscribe anytime).";

const revealItems = document.querySelectorAll(
  ".section, .mini-card, .code-panel, .approach-step, .service-card, .info-card, .project-showcase, .cta-card, .hero-pills"
);

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (siteHeader) {
  const onScroll = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    filterBtns.forEach((button) => {
      const active = button === btn;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });

    projectCards.forEach((card) => {
      const categories = (card.dataset.category || "").split(" ");
      const show = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !show);
    });
  });
});

newsletterForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const config = window.NEWSLETTER_SUPABASE;
    const emailInput = form.querySelector('input[name="email"]');
    const consentInput = form.querySelector('input[name="consent"]');
    const message = form.querySelector("[data-newsletter-message]");
    const submitButton = form.querySelector('button[type="submit"]');
    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";

    if (!form.reportValidity()) {
      return;
    }

    if (!config || config.url.includes("YOUR_PROJECT_REF") || config.anonKey.includes("YOUR_SUPABASE_ANON_KEY")) {
      if (message) {
        message.textContent = "Newsletter setup is almost ready. Add your Supabase URL and anon key first.";
        message.className = "newsletter-message is-error";
      }
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Subscribing...";
    }

    try {
      const response = await fetch(`${config.url}/rest/v1/${config.table}`, {
        method: "POST",
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          email,
          consent_given: Boolean(consentInput && consentInput.checked),
          consent_text: consentText,
          source_page: window.location.pathname,
          user_agent: navigator.userAgent,
        }),
      });

      if (response.status === 409) {
        if (message) {
          message.textContent = "You are already subscribed. Thank you.";
          message.className = "newsletter-message is-success";
        }
        form.reset();
        const parentPopup = form.closest("#newsletter-popup");
        if (parentPopup) {
          setTimeout(() => {
            parentPopup.classList.remove("is-visible");
            parentPopup.setAttribute("aria-hidden", "true");
            localStorage.setItem("newsletter_popup_dismissed", "true");
          }, 2000);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`Supabase returned ${response.status}`);
      }

      if (message) {
        message.textContent = "Thank you. You are subscribed.";
        message.className = "newsletter-message is-success";
      }
      form.reset();
      const parentPopup = form.closest("#newsletter-popup");
      if (parentPopup) {
        setTimeout(() => {
          parentPopup.classList.remove("is-visible");
          parentPopup.setAttribute("aria-hidden", "true");
          localStorage.setItem("newsletter_popup_dismissed", "true");
        }, 2000);
      }
    } catch (error) {
      console.error("Newsletter signup failed.", error);
      if (message) {
        message.textContent = "Something went wrong. Please try again in a moment.";
        message.className = "newsletter-message is-error";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Subscribe";
      }
    }
  });
});

revealItems.forEach((item) => item.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* ==========================================================================
   Premium UI/UX Interactions Engine
   ========================================================================== */

// 1. Glow Cards spotlight coordinate tracker
const glowCards = document.querySelectorAll(".glow-card");
glowCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });
});

// 2. 3D Mouse Tilt effect
const tiltElements = document.querySelectorAll(".tilt-3d");
tiltElements.forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    // Normalise mouse position relative to card center (-0.5 to 0.5)
    const xVal = (e.clientX - rect.left) / rect.width - 0.5;
    const yVal = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Smooth rotate angles (keep subtle, max 10 degrees for elegance)
    const rotateX = -(yVal * 10).toFixed(2);
    const rotateY = (xVal * 10).toFixed(2);
    
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  });
});

// 3. Certificate Lightbox functionality
const certTrigger = document.getElementById("cert-card-trigger");
const lightbox = document.getElementById("certificate-lightbox");
const lightboxImg = document.getElementById("lightbox-image");
const closeLightboxBtn = document.getElementById("close-lightbox-btn");

if (certTrigger && lightbox && lightboxImg) {
  const certImg = certTrigger.querySelector(".certificate-image");

  const openLightbox = () => {
    if (certImg) {
      lightboxImg.src = certImg.src;
      lightbox.classList.add("is-visible");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-visible");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  certTrigger.addEventListener("click", openLightbox);
  
  if (closeLightboxBtn) {
    closeLightboxBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }
  
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-content")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("is-visible")) {
      closeLightbox();
    }
  });
}

// 4. Newsletter Popup logic
const popup = document.getElementById("newsletter-popup");
const closePopupBtn = document.getElementById("close-popup-btn");

if (popup) {
  const isDismissed = localStorage.getItem("newsletter_popup_dismissed") === "true";

  if (!isDismissed) {
    setTimeout(() => {
      popup.classList.add("is-visible");
      popup.setAttribute("aria-hidden", "false");
    }, 5000); // 5 seconds delay
  }

  const closePopup = () => {
    popup.classList.remove("is-visible");
    popup.setAttribute("aria-hidden", "true");
    localStorage.setItem("newsletter_popup_dismissed", "true");
  };

  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", closePopup);
  }

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      closePopup();
    }
  });
}
