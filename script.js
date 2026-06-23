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
