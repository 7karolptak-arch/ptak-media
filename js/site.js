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

  const bootShader = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    canvas.id = "bg-shader";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false });
    if (!gl) {
      canvas.remove();
      return;
    }

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}");
    const fs = compile(
      gl.FRAGMENT_SHADER,
      [
        "precision mediump float;",
        "uniform vec2 u_res;uniform float u_t;",
        "void main(){",
        "vec2 uv=gl_FragCoord.xy/u_res;",
        "vec2 p=uv*2.-1.;p.x*=u_res.x/u_res.y;",
        "float t=u_t*.12;",
        "float n=sin(p.x*2.1+t)+sin(p.y*2.7-t*1.3);",
        "n+=sin((p.x+p.y)*1.8+t*1.7)*.6;",
        "float band=.5+.5*sin(n*1.4+uv.y*3.+t);",
        "vec3 deep=vec3(.02,.03,.05);",
        "vec3 blue=vec3(.23,.51,.96);",
        "vec3 ice=vec3(.38,.65,.98);",
        "vec3 col=mix(deep,blue,band*.55);",
        "col=mix(col,ice,smoothstep(.62,.95,band)*.28);",
        "col+=vec3(.08,.14,.28)*smoothstep(.2,.0,length(p-vec2(.7,-.55)));",
        "gl_FragColor=vec4(col,1.);",
        "}"
      ].join("")
    );
    if (!vs || !fs) {
      canvas.remove();
      return;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.remove();
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uT = gl.getUniformLocation(prog, "u_t");

    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    fit();
    addEventListener("resize", fit, { passive: true });
    document.body.classList.add("has-shader");

    let start = performance.now();
    let raf = 0;
    const tick = (now) => {
      if (document.hidden) {
        raf = 0;
        return;
      }
      gl.uniform1f(uT, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !raf) raf = requestAnimationFrame(tick);
    });
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    ready();
    bootShader();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
