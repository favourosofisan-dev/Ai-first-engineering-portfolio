const links = document.querySelectorAll('.site-nav a[href^="#"]');

links.forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;

    if (target) {
      target.setAttribute("tabindex", "-1");
    }
  });
});
