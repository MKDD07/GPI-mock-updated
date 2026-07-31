/* =========================================================
   OMBRE — animations.js
   GSAP scroll reveals, split text, tilt, counters, explosion
   ========================================================= */

const OmbreAnim = (() => {
  function initSplitText() {
    if (typeof Splitting === "undefined") return;
    Splitting({ target: "[data-split]", by: "words" });
    gsap.utils.toArray("[data-split]").forEach((el) => {
      const words = el.querySelectorAll(".word");
      gsap.set(words, { yPercent: 120, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(words, {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.035,
          });
        },
      });
    });
  }

  function initReveals() {
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" });
        },
      });
    });
  }

  function initTilt() {
    gsap.utils.toArray("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotateY: x * 10,
          rotateX: -y * 10,
          transformPerspective: 600,
          duration: 0.4,
          ease: "power2.out",
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: "power3.out",
        });
      });
    });
  }

  function initCounters() {
    gsap.utils.toArray(".stat-num").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.val);
            },
          });
        },
      });
    });
  }

  function initSectionParallax() {
    gsap.utils.toArray(".hero-orbit").forEach((el) => {
      gsap.to(el, {
        rotate: 360,
        duration: 60,
        repeat: -1,
        ease: "none",
      });
    });
    gsap.utils.toArray(".floating-box").forEach((el, i) => {
      gsap.to(el, {
        y: i % 2 === 0 ? -22 : 22,
        duration: 3 + i,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
    gsap.utils.toArray(".candy-piece, .cocoa-bean").forEach((el, i) => {
      gsap.to(el, {
        y: i % 2 === 0 ? -14 : 14,
        rotation: "+=15",
        duration: 2.5 + i * 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  }

  function initExplosion() {
    const stage = document.getElementById("explosionStage");
    if (!stage) return;
    const colors = ["#8D6E63", "#D4AF37", "#4E342E", "#6D4C41"];
    const shards = [];
    const count = window.innerWidth < 700 ? 18 : 34;

    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "shard";
      const size = 8 + Math.random() * 18;
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.background = colors[i % colors.length];
      s.style.borderRadius = Math.random() > 0.5 ? "4px" : "50%";
      stage.appendChild(s);
      shards.push(s);
    }

    function scatter() {
      shards.forEach((s) => {
        gsap.to(s, {
          x: (Math.random() - 0.5) * stage.clientWidth * 0.8,
          y: (Math.random() - 0.5) * stage.clientHeight * 0.8,
          rotation: Math.random() * 360,
          duration: 1.4 + Math.random(),
          ease: "power3.out",
        });
      });
    }
    function reassemble() {
      shards.forEach((s) => {
        gsap.to(s, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 1.1,
          ease: "power2.inOut",
        });
      });
    }

    ScrollTrigger.create({
      trigger: stage,
      start: "top 75%",
      onEnter: scatter,
      onLeaveBack: reassemble,
    });

    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect();
      const mx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const my = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      shards.forEach((s, i) => {
        gsap.to(s, {
          x: `+=${mx * (2 + (i % 5))}`,
          y: `+=${my * (2 + (i % 5))}`,
          duration: 0.6,
          ease: "power1.out",
          overwrite: "auto",
        });
      });
    });

    stage.addEventListener("mouseleave", reassemble);
  }

  function initHeroParticles() {
    const wrap = document.getElementById("heroParticles");
    if (!wrap) return;
    const count = window.innerWidth < 700 ? 14 : 26;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = 3 + Math.random() * 6;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "%";
      p.style.top = Math.random() * 100 + "%";
      p.style.background =
        Math.random() > 0.5 ? "rgba(212,175,55,.5)" : "rgba(141,110,99,.6)";
      wrap.appendChild(p);
      gsap.to(p, {
        y: (Math.random() - 0.5) * 120,
        x: (Math.random() - 0.5) * 80,
        opacity: Math.random() * 0.6 + 0.2,
        duration: 4 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 2,
      });
    }
  }

  function initGlow() {
    document.querySelectorAll(".btn-luxury").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty(
          "--mx",
          ((e.clientX - r.left) / r.width) * 100 + "%",
        );
        btn.style.setProperty(
          "--my",
          ((e.clientY - r.top) / r.height) * 100 + "%",
        );
      });
    });
  }

  function initAll() {
    gsap.registerPlugin(ScrollTrigger, TextPlugin, Flip);
    initSplitText();
    initReveals();
    initTilt();
    initCounters();
    initSectionParallax();
    initExplosion();
    initHeroParticles();
    initGlow();
  }

  return { initAll };
})();
