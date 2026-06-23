const links = document.querySelectorAll('.site-nav a[href^="#"]');
const yearNode = document.getElementById("year");
const newsletterForms = document.querySelectorAll("[data-newsletter-form]");
const consentText = "I agree to receive occasional emails from Favour Osofisan (no spam, unsubscribe anytime).";

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

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

links.forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;

    if (target) {
      target.setAttribute("tabindex", "-1");
    }
  });
});
