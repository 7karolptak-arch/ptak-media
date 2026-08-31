(() => {
  const ready = () => {
    const wrap = document.querySelector(".nav-wrap");
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");

    const reveals = document.querySelectorAll("[data-reveal]");
    const show = (el) => el.classList.add("is-visible");
    const showInView = () => {
      reveals.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight - 24) show(el);
      });
    };
    showInView();
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              show(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach(show);
    }
    setTimeout(() => reveals.forEach(show), 1200);

    if (wrap && toggle && menu) {
      const close = () => {
        wrap.classList.remove("menu-visible");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Otwórz menu");
        menu.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menu-open");
      };
      toggle.addEventListener("click", () => {
        const open = !wrap.classList.contains("menu-visible");
        wrap.classList.toggle("menu-visible", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
        menu.setAttribute("aria-hidden", String(!open));
        document.body.classList.toggle("menu-open", open);
      });
      menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
      addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
      });
      const sticky = document.getElementById("sticky-cta");
      const onScroll = () => {
        wrap.classList.toggle("is-compact", scrollY > 40);
        if (sticky) {
          const nearFooter = document.documentElement.scrollHeight - (scrollY + innerHeight) < 280;
          sticky.classList.toggle("is-on", scrollY > 520 && !nearFooter);
          sticky.hidden = !sticky.classList.contains("is-on");
        }
      };
      addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const sel = btn.getAttribute("data-copy");
        const node = sel ? document.querySelector(sel) : btn.previousElementSibling;
        const text = (node && (node.innerText || node.textContent) || "").trim();
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          const prev = btn.textContent;
          btn.textContent = "Skopiowane";
          setTimeout(() => { btn.textContent = prev; }, 1600);
        } catch (_) {}
      });
    });

    document.querySelectorAll(".faq-list details").forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        document.querySelectorAll(".faq-list details").forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
