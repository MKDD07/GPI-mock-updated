document.addEventListener("DOMContentLoaded", () => {
  const videoContainer = document.getElementById("videoContainer");
  const introVideo = document.getElementById("introVideo");
  const mainScreen = document.getElementById("mainScreen");
  const popup = document.getElementById("popup");
  const popupTitle = document.querySelector(".popup-title");
  const matterContainer = document.getElementById("matterContainer");
  const particleCanvas = document.getElementById("particleCanvas");
  const btnYes = document.getElementById("btnYes");
  const btnNo = document.getElementById("btnNo");

  // Info Modal Elements
  const infoBtn = document.getElementById("infoBtn");
  const stepsModal = document.getElementById("stepsModal");
  const closeStepsBtn = document.getElementById("closeStepsBtn");
  const stepsModalBackdrop = document.getElementById("stepsModalBackdrop");
  const gotItBtn = document.getElementById("gotItBtn");

  // Redemption Card Elements
  const redemptionDrawer = document.getElementById("redemptionDrawer");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  const happyCodeContainer = document.getElementById("happyCodeContainer");
  const codeBoxes = happyCodeContainer
    ? happyCodeContainer.querySelectorAll(".code-box")
    : [];
  const redemptionForm = document.getElementById("redemptionForm");
  const mobileInput = document.getElementById("mobileInput");

  // Success Drawer Elements
  const successDrawer = document.getElementById("successDrawer");
  const copyCodeBtn = document.getElementById("copyCodeBtn");
  const uniqueCodeText = document.getElementById("uniqueCodeText");
  const successContinueBtn = document.getElementById("successContinueBtn");

  // Retailer Card Elements
  const retailerDrawer = document.getElementById("retailerDrawer");
  const closeRetailerBtn = document.getElementById("closeRetailerBtn");
  const retailerGotItBtn = document.getElementById("retailerGotItBtn");

  // Already Participated Warning Card Elements (Treated as popup-card class overlay)
  const participatedModal = document.getElementById("participatedModal");
  const closeWarningBtn = document.getElementById("closeWarningBtn");
  const warningGotItBtn = document.getElementById("warningGotItBtn");

  // QR Scanner Elements
  const qrScannerContainer = document.getElementById("qrScannerContainer");
  const qrFeedback = document.getElementById("qrFeedback");
  const skipQrBtn = document.getElementById("skipQrBtn");

  // Helper to transition out of QR scanner
  function dismissQrScanner() {
    const doTransition = () => {
      gsap.to(qrScannerContainer, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
          qrScannerContainer.style.display = "none";
          startSilentIntroVideo();
        },
      });
    };

    if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
      html5QrcodeScanner
        .stop()
        .then(() => {
          doTransition();
        })
        .catch(() => {
          qrScannerContainer.style.display = "none";
          startSilentIntroVideo();
        });
    } else {
      doTransition();
    }
  }

  if (skipQrBtn) {
    skipQrBtn.addEventListener("click", dismissQrScanner);
  }

  // State to track if the title popping animation has already run
  let titleAnimationHasRun = false;

  /* ---------- 1. QR CAMERA SCANNER INITIALIZATION ---------- */
  let html5QrcodeScanner = null;
  if (qrScannerContainer && typeof Html5Qrcode !== "undefined") {
    // Hide video Container at startup
    if (videoContainer) videoContainer.style.display = "none";

    const qrSuccessCallback = (decodedText, decodedResult) => {
      if (decodedText.trim().toLowerCase() === "mohit") {
        if (qrFeedback) {
          qrFeedback.style.color = "#4caf50";
          qrFeedback.textContent =
            "QR Code Verification Successful! Initializing...";
        }

        // Stop scanner camera immediately
        dismissQrScanner();
      } else {
        if (qrFeedback) {
          qrFeedback.style.color = "#f44336";
          qrFeedback.textContent = "Invalid QR code. Scan target: 'mohit'";
        }
      }
    };

    const qrErrorCallback = (errorMessage) => {
      // Keep scanning silently
    };

    // Instantiate and start camera scanner automatically
    html5QrcodeScanner = new Html5Qrcode("qrReader");
    html5QrcodeScanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        qrSuccessCallback,
        qrErrorCallback,
      )
      .catch((err) => {
        if (qrFeedback) {
          qrFeedback.style.color = "#ff9800";
          qrFeedback.textContent =
            "Camera initialization failed. Please allow camera permissions.";
        }
      });
  } else {
    // Fallback if library or container is missing
    startSilentIntroVideo();
  }

  function startSilentIntroVideo() {
    if (!videoContainer || !introVideo) return;

    introVideo.src = "assets/video-initial.mp4";
    videoContainer.style.display = "block";
    gsap.fromTo(
      videoContainer,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: "power2.inOut" }
    );

    introVideo.muted = true;
    introVideo.controls = false;
    introVideo.currentTime = 0;
    introVideo.play().catch(() => {});

    // Remove any leftover end video listeners
    introVideo.onended = null;
    introVideo.addEventListener("ended", triggerSeamlessTransition);
    setTimeout(() => {
      if (
        videoContainer &&
        videoContainer.style.display !== "none" &&
        !videoContainer.dataset.transitioned
      ) {
        triggerSeamlessTransition();
      }
    }, 6000);
  }

  function triggerSeamlessTransition() {
    if (!videoContainer || videoContainer.dataset.transitioned) return;
    videoContainer.dataset.transitioned = "true";

    // Fade out video smoothly with ease in/out
    gsap.to(videoContainer, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => {
        videoContainer.style.display = "none";
        if (introVideo) introVideo.pause();
      },
    });

    // Bouncy popup scale-up & fall entrance
    gsap.to(popup, {
      scale: 1,
      y: 0,
      opacity: 1,
      duration: 1.4,
      delay: 0.2,
      ease: "back.out(1.8)",
      onStart: () => {
        initParticles();
        initMatterPhysicsToffees();
        fireGoldenConfetti();
        animateTitlePop();
      },
    });
  }

  /* ---------- POPPING TITLE GSAP ANIMATION ---------- */
  function animateTitlePop() {
    if (!popupTitle || titleAnimationHasRun) return;
    titleAnimationHasRun = true;

    // Reset initial state for pop effect
    gsap.set(popupTitle, { scale: 0.3, opacity: 0 });

    // Staggered sequence: pop up big with elastic bounce then settle down
    gsap.to(popupTitle, {
      scale: 1,
      opacity: 1,
      duration: 1.2,
      delay: 0.4,
      ease: "elastic.out(1.2, 0.4)",
    });
  }

  /* ---------- 2. CARD SWITCHER ANIMATION (GSAP Morphing Flight Up & Bottom Slide) ---------- */
  function switchCard(fromCard, toCard, focusInput = false) {
    if (!fromCard || !toCard) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      fromCard.style.display = "none";
      toCard.style.display = "block";
      gsap.set(toCard, { scale: 1, y: 0, opacity: 1 });
    } else {
      // 1. Shrink current card slightly to 95% and fly up out of viewport
      gsap.to(fromCard, {
        scale: 0.95,
        y: -window.innerHeight - 100,
        opacity: 0,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          fromCard.style.display = "none";

          // 2. Prepare next card hidden at bottom viewport boundary
          toCard.style.display = "block";
          gsap.set(toCard, {
            scale: 0.95,
            y: window.innerHeight + 100,
            opacity: 0,
          });

          // 3. Slide it up from bottom to center location
          gsap.to(toCard, {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "back.out(1.5)",
          });
        },
      });
    }

    // Auto focus first code input box if requested
    if (focusInput && codeBoxes.length > 0) {
      setTimeout(() => codeBoxes[0].focus(), 1400);
    }
  }

  function openRedemptionDrawer() {
    switchCard(popup, redemptionDrawer, true);
  }

  function closeRedemptionDrawer() {
    switchCard(redemptionDrawer, popup);
  }

  function openRetailerDrawer() {
    switchCard(popup, retailerDrawer);
  }

  function closeRetailerDrawer() {
    switchCard(retailerDrawer, popup);
  }

  function openWarningModal() {
    // Dynamically calculate redemption details
    const warnRedeemDate = document.getElementById("warnRedeemDate");
    const warnRedeemCode = document.getElementById("warnRedeemCode");
    const warnResetTimer = document.getElementById("warnResetTimer");

    if (warnRedeemDate && warnRedeemCode && warnResetTimer) {
      // Set redeemed date to yesterday dynamically
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const dateStr = `${yesterday.getDate()}-${months[yesterday.getMonth()]}-${yesterday.getFullYear()}`;
      warnRedeemDate.textContent = dateStr;

      // Generate a dynamic mock redemption ID
      const chars = "ABCDEF0123456789";
      let code = "";
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      warnRedeemCode.textContent = `LUV-${code}`;

      // Set remaining reset timer (e.g. 29 days left)
      warnResetTimer.textContent = "Resets in 29 Days";
    }

    switchCard(redemptionDrawer, participatedModal);
  }

  function closeWarningModal() {
    switchCard(participatedModal, popup);
  }

  if (closeDrawerBtn)
    closeDrawerBtn.addEventListener("click", closeRedemptionDrawer);
  if (closeRetailerBtn)
    closeRetailerBtn.addEventListener("click", closeRetailerDrawer);
  if (retailerGotItBtn)
    retailerGotItBtn.addEventListener("click", closeRetailerDrawer);
  if (closeWarningBtn)
    closeWarningBtn.addEventListener("click", closeWarningModal);
  if (warningGotItBtn)
    warningGotItBtn.addEventListener("click", closeWarningModal);

  /* ---------- 3. HAPPY CODE 4-BOX AUTO FOCUS & PASTE ---------- */
  codeBoxes.forEach((box, index) => {
    // Auto-focus next box on input
    box.addEventListener("input", (e) => {
      const value = e.target.value;
      if (value.length >= 1) {
        box.value = value.charAt(0);
        if (index < codeBoxes.length - 1) {
          codeBoxes[index + 1].focus();
        }
      }
    });

    // Backspace moves to previous box
    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && index > 0) {
        codeBoxes[index - 1].focus();
      }
    });

    // Support paste of 4 digit code
    box.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData)
        .getData("text")
        .trim();
      if (pasteData) {
        const digits = pasteData.replace(/\D/g, "").split("");
        digits.forEach((digit, idx) => {
          if (idx < codeBoxes.length) {
            codeBoxes[idx].value = digit;
          }
        });
        const focusIndex = Math.min(digits.length, codeBoxes.length - 1);
        codeBoxes[focusIndex].focus();
      }
    });
  });

  function openSuccessDrawer() {
    // Generate randomized unique redemption code (e.g. LUV-XXXXX)
    if (uniqueCodeText) {
      const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let codeStr = "";
      for (let i = 0; i < 5; i++) {
        codeStr += codeChars.charAt(
          Math.floor(Math.random() * codeChars.length),
        );
      }
      uniqueCodeText.textContent = `LUV-${codeStr}`;
    }

    switchCard(redemptionDrawer, successDrawer);
  }

  function closeSuccessDrawer() {
    if (!videoContainer || !introVideo) {
      switchCard(successDrawer, popup);
      return;
    }

    // 1. Hide the successDrawer card first
    gsap.to(successDrawer, {
      scale: 0.95,
      y: window.innerHeight + 100,
      opacity: 0,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => {
        successDrawer.style.display = "none";
      },
    });

    // 2. Prepare video container overlay, switch to video-end.mp4 and play forward
    introVideo.src = "assets/video-end.mp4";
    introVideo.currentTime = 0;
    introVideo.onended = () => {
      introVideo.pause(); // Ensure video stays paused on the last frame
    };
    videoContainer.style.display = "block";
    videoContainer.dataset.transitioned = "end_video"; // Prevent auto-transition timer

    gsap.fromTo(
      videoContainer,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          introVideo.play().catch((err) => {
            console.warn("Video end play interrupted or blocked:", err);
          });
        },
      }
    );
  }

  // Copy code clipboard helper
  if (copyCodeBtn && uniqueCodeText) {
    copyCodeBtn.addEventListener("click", () => {
      navigator.clipboard
        .writeText(uniqueCodeText.textContent)
        .then(() => {
          // Subtle feedback animation on copy icon click
          gsap.fromTo(copyCodeBtn, { scale: 0.8 }, { scale: 1, duration: 0.2 });
          // Visual text feedback
          const originalText = uniqueCodeText.textContent;
          uniqueCodeText.textContent = "COPIED! ✓";
          setTimeout(() => {
            uniqueCodeText.textContent = originalText;
          }, 1500);
        })
        .catch(() => {});
    });
  }

  if (successContinueBtn) {
    successContinueBtn.addEventListener("click", closeSuccessDrawer);
  }

  if (redemptionForm) {
    redemptionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Check for specific registered campaign mobile number validation
      if (mobileInput && mobileInput.value.trim() === "7827232156") {
        openWarningModal();
        return;
      }

      // Celebratory transition to success screen
      fireGoldenConfetti();
      openSuccessDrawer();
    });
  }

  /* ---------- 4. MATTER.JS RIGID BODY PHYSICS SIMULATION WITH DRAG ---------- */
  function initMatterPhysicsToffees() {
    if (typeof Matter === "undefined" || !matterContainer) return;

    const {
      Engine,
      Render,
      Runner,
      Bodies,
      Composite,
      Body,
      Mouse,
      MouseConstraint,
    } = Matter;

    const engine = Engine.create();
    engine.world.gravity.y = 0.8;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const render = Render.create({
      element: matterContainer,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: "transparent",
      },
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    const ground = Bodies.rectangle(width / 2, height + 30, width * 2, 60, {
      isStatic: true,
      render: { fillStyle: "transparent" },
    });

    Composite.add(engine.world, [ground]);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    const spawnCount = 14;
    for (let i = 0; i < spawnCount; i++) {
      setTimeout(() => {
        const x = Math.random() * (width - 80) + 40;
        const radius = 12 + Math.random() * 4;

        const toffeeBody = Bodies.circle(x, -30, radius, {
          restitution: 0.75,
          friction: 0.05,
          density: 0.0015,
          render: {
            sprite: {
              texture: "assets/toffee.png",
              xScale: (radius * 2) / 100,
              yScale: (radius * 2) / 100,
            },
          },
        });

        Body.setAngularVelocity(toffeeBody, (Math.random() - 0.5) * 0.2);
        Composite.add(engine.world, toffeeBody);
      }, i * 250);
    }
  }

  /* ---------- 5. CANVAS PARTICLE SYSTEM ---------- */
  let ctx,
    particles = [];
  function initParticles() {
    if (!particleCanvas) return;
    ctx = particleCanvas.getContext("2d");
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
      if (!particleCanvas) return;
      particleCanvas.width = window.innerWidth;
      particleCanvas.height = window.innerHeight;
    });

    const total = 35;
    for (let i = 0; i < total; i++) {
      particles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        r: Math.random() * 2.5 + 1,
        color:
          Math.random() > 0.4 ? "rgba(212, 175, 55, " : "rgba(245, 230, 211, ",
        alpha: Math.random() * 0.7 + 0.2,
        speedY: -(Math.random() * 0.4 + 0.1),
        speedX: (Math.random() - 0.5) * 0.3,
      });
    }
    renderParticles();
  }

  function renderParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particles.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y < 0) p.y = particleCanvas.height;
      if (p.x < 0) p.x = particleCanvas.width;
      if (p.x > particleCanvas.width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ")";
      ctx.fill();
    });
    requestAnimationFrame(renderParticles);
  }

  /* ---------- 6. CANVAS CONFETTI CELEBRATION ---------- */
  function fireGoldenConfetti() {
    if (typeof confetti === "undefined") return;
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#D4AF37", "#8D6E63", "#4E342E", "#F5E6D3"],
      disableForReducedMotion: true,
    });
  }

  /* ---------- 7. BUTTON & STEPS MODAL INTERACTIVITY ---------- */
  function openStepsModal() {
    if (!stepsModal) return;
    stepsModal.classList.add("show");
    stepsModal.setAttribute("aria-hidden", "false");
  }

  function closeStepsModal() {
    if (!stepsModal) return;
    stepsModal.classList.remove("show");
    stepsModal.setAttribute("aria-hidden", "true");
  }

  if (infoBtn) infoBtn.addEventListener("click", openStepsModal);
  if (closeStepsBtn) closeStepsBtn.addEventListener("click", closeStepsModal);
  if (stepsModalBackdrop)
    stepsModalBackdrop.addEventListener("click", closeStepsModal);
  if (gotItBtn) gotItBtn.addEventListener("click", closeStepsModal);

  [btnYes, btnNo].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      gsap.to(btn, {
        scale: 0.92,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      });
      if (btn.id === "btnYes") {
        fireGoldenConfetti();
        setTimeout(openRedemptionDrawer, 800);
      } else if (btn.id === "btnNo") {
        setTimeout(openRetailerDrawer, 400);
      }
    });
  });

  /* ---------- 8. FLOATING DEV TEST NAVIGATION TOOLBAR ---------- */
  const devTestToolbar = document.getElementById("devTestToolbar");
  const devToolToggle = document.getElementById("devToolToggle");
  const devToolButtons = document.getElementById("devToolButtons");

  if (devToolToggle && devTestToolbar) {
    devToolToggle.addEventListener("click", () => {
      devTestToolbar.classList.toggle("active");
    });
  }

  function hideAllSections() {
    if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
      html5QrcodeScanner.stop().catch(() => {});
    }
    // Hide panels
    const panels = [
      qrScannerContainer,
      videoContainer,
      popup,
      retailerDrawer,
      redemptionDrawer,
      successDrawer,
      participatedModal,
    ];
    panels.forEach((p) => {
      if (p) {
        p.style.display = "none";
        p.style.opacity = "1";
        gsap.set(p, { opacity: 1, scale: 1, y: 0 });
      }
    });
    closeStepsModal();
    if (introVideo) introVideo.pause();
  }

  if (devToolButtons) {
    devToolButtons.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const section = btn.dataset.section;
      hideAllSections();

      switch (section) {
        case "qr":
          if (qrScannerContainer) {
            qrScannerContainer.style.display = "flex";
            qrScannerContainer.style.opacity = "1";
          }
          break;
        case "video":
          if (videoContainer && introVideo) {
            introVideo.src = "assets/video-initial.mp4";
            introVideo.currentTime = 0;
            videoContainer.style.display = "block";
            videoContainer.dataset.transitioned = "";
            introVideo.play().catch(() => {});
          }
          break;
        case "popup":
          if (popup) popup.style.display = "block";
          break;
        case "retailer":
          if (retailerDrawer) retailerDrawer.style.display = "block";
          break;
        case "redemption":
          if (redemptionDrawer) redemptionDrawer.style.display = "block";
          break;
        case "success":
          if (successDrawer) successDrawer.style.display = "block";
          break;
        case "video-end":
          if (videoContainer && introVideo) {
            introVideo.src = "assets/video-end.mp4";
            introVideo.currentTime = 0;
            videoContainer.style.display = "block";
            videoContainer.dataset.transitioned = "";
            introVideo.play().catch(() => {});
          }
          break;
        case "participated":
          if (participatedModal) participatedModal.style.display = "block";
          break;
        case "steps":
          openStepsModal();
          break;
      }
    });
  }
});
