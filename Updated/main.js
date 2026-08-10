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
        animateRewardCard();
      },
    });
  }

  /* ---------- PREMIUM REWARD CARD GSAP ANIMATION ---------- */
  function animateRewardCard() {
    const rewardCard = document.querySelector(".reward-card");
    const rewardGlow = document.querySelector(".reward-card-glow");
    const rewardTag = document.querySelector(".reward-tag");
    const rewardHighlight = document.querySelector(".reward-highlight");

    if (!rewardCard) return;

    // Entrance pop animation
    gsap.fromTo(
      rewardCard,
      { scale: 0.85, opacity: 0, y: 15 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay: 0.6,
        ease: "back.out(1.7)",
      }
    );

    // Staggered tag & highlight text pop
    if (rewardTag && rewardHighlight) {
      gsap.fromTo(
        [rewardTag, rewardHighlight],
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.9,
          stagger: 0.15,
          ease: "power2.out",
        }
      );
    }

    // Continuous radial glow rotation sweep
    if (rewardGlow) {
      gsap.to(rewardGlow, {
        rotation: 360,
        duration: 12,
        repeat: -1,
        ease: "none",
      });
    }

    // Subtle continuous pulse on the reward box border & scale
    gsap.to(rewardCard, {
      boxShadow:
        "0 12px 35px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 0 28px rgba(229, 193, 88, 0.35)",
      borderColor: "rgba(255, 220, 110, 0.7)",
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  /* ---------- POPPING SPLIT-TEXT TITLE GSAP ANIMATION ---------- */
  function animateTitlePop() {
    const titles = document.querySelectorAll(".popup-title");
    if (!titles.length || titleAnimationHasRun) return;
    titleAnimationHasRun = true;

    titles.forEach((titleEl) => {
      const text = titleEl.textContent.trim();
      titleEl.innerHTML = "";
      titleEl.style.display = "inline-block";

      const chars = text.split("");
      chars.forEach((char) => {
        const span = document.createElement("span");
        span.className = "char-span";
        span.style.display = "inline-block";
        span.style.willChange = "transform, opacity";
        if (char === " ") {
          span.innerHTML = "&nbsp;";
        } else {
          span.textContent = char;
        }
        titleEl.appendChild(span);
      });

      const charSpans = titleEl.querySelectorAll(".char-span");
      gsap.set(charSpans, {
        opacity: 0,
        scale: 0,
        y: 25,
        rotation: () => (Math.random() - 0.5) * 30,
      });

      gsap.to(charSpans, {
        opacity: 1,
        scale: 1,
        y: 0,
        rotation: 0,
        duration: 0.8,
        delay: 0.3,
        stagger: 0.05,
        ease: "back.out(2)",
      });
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
    // Generate randomized unique redemption code (e.g. TOFFEE-XXXXX)
    if (uniqueCodeText) {
      const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let codeStr = "";
      for (let i = 0; i < 5; i++) {
        codeStr += codeChars.charAt(
          Math.floor(Math.random() * codeChars.length),
        );
      }
      uniqueCodeText.textContent = `TOFFEE-${codeStr}`;
    }

    switchCard(redemptionDrawer, successDrawer);
    setTimeout(initScratchCardCanvas, 400);
  }

  /* ---------- INTERACTIVE CANVAS SCRATCH CARD ---------- */
  function initScratchCardCanvas() {
    const scratchCanvas = document.getElementById("scratchCanvas");
    const scratchContainer = document.getElementById("scratchContainer");
    if (!scratchCanvas || !scratchContainer) return;

    const ctx = scratchCanvas.getContext("2d");
    const rect = scratchContainer.getBoundingClientRect();
    const width = rect.width || 280;
    const height = rect.height || 64;

    scratchCanvas.width = width;
    scratchCanvas.height = height;

    // Fill canvas with luxury gold metallic layer & pattern
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#f7e096");
    grad.addColorStop(0.3, "#d4af37");
    grad.addColorStop(0.7, "#aa820a");
    grad.addColorStop(1, "#f7e096");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Overlay Scratch Instruction Text on top layer
    ctx.font = "bold 13px Outfit, sans-serif";
    ctx.fillStyle = "#0f0906";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ SCRATCH HERE TO REVEAL ✨", width / 2, height / 2);

    let isDrawing = false;
    let scratchedPixels = 0;

    function getPointerPos(e) {
      const cRect = scratchCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - cRect.left,
        y: clientY - cRect.top,
      };
    }

    function scratch(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPointerPos(e);

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
      ctx.fill();

      checkScratchPercentage();
    }

    function checkScratchPercentage() {
      // Check every few scratches if >= 45% scratched, auto reveal remaining layer seamlessly
      const imgData = ctx.getImageData(0, 0, width, height);
      let clearCount = 0;
      const totalPixels = imgData.data.length / 4;

      for (let i = 3; i < imgData.data.length; i += 4 * 8) {
        if (imgData.data[i] === 0) {
          clearCount += 8;
        }
      }

      if (clearCount / totalPixels > 0.35) {
        gsap.to(scratchCanvas, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            scratchCanvas.style.display = "none";
            fireGoldenConfetti();
          },
        });
      }
    }

    scratchCanvas.addEventListener("mousedown", (e) => {
      isDrawing = true;
      scratch(e);
    });
    scratchCanvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", () => {
      isDrawing = false;
    });

    scratchCanvas.addEventListener("touchstart", (e) => {
      isDrawing = true;
      scratch(e);
    });
    scratchCanvas.addEventListener("touchmove", scratch);
    window.addEventListener("touchend", () => {
      isDrawing = false;
    });
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

  // Social & Rating Modal Controls
  const socialRatingModal = document.getElementById("socialRatingModal");
  const closeSocialRatingBtn = document.getElementById("closeSocialRatingBtn");
  const socialDoneBtn = document.getElementById("socialDoneBtn");
  const starBtns = document.querySelectorAll(".star-btn");
  const ratingFeedbackText = document.getElementById("ratingFeedbackText");

  function openSocialRatingModal() {
    switchCard(successDrawer, socialRatingModal);
  }

  function closeSocialRatingModal() {
    closeSuccessDrawer();
    if (socialRatingModal) socialRatingModal.style.display = "none";
  }

  if (successContinueBtn) {
    successContinueBtn.addEventListener("click", () => {
      openSocialRatingModal();
    });
  }

  if (closeSocialRatingBtn) {
    closeSocialRatingBtn.addEventListener("click", closeSocialRatingModal);
  }

  if (socialDoneBtn) {
    socialDoneBtn.addEventListener("click", closeSocialRatingModal);
  }

  // Interactive 5-Star Rating Logic with Hover Preview & Thank-You Burst
  if (starBtns.length > 0) {
    let currentSelectedRating = 0;

    function updateStarDisplay(ratingValue, isTemporary = false) {
      starBtns.forEach((s, idx) => {
        const starVal = idx + 1;
        if (starVal <= ratingValue) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    }

    starBtns.forEach((star) => {
      // Hover Enter Preview (Fills all stars before hover target)
      star.addEventListener("mouseenter", () => {
        const hoverVal = parseInt(star.dataset.value, 10);
        updateStarDisplay(hoverVal, true);
      });

      // Click Selection
      star.addEventListener("click", () => {
        const selectedVal = parseInt(star.dataset.value, 10);
        currentSelectedRating = selectedVal;
        updateStarDisplay(currentSelectedRating);

        // GSAP Pop Scale Animation on filled stars
        starBtns.forEach((s, idx) => {
          if (idx < currentSelectedRating) {
            gsap.fromTo(s, { scale: 0.7 }, { scale: 1.25, duration: 0.25, yoyo: true, repeat: 1, ease: "back.out(2)" });
          }
        });

        // Trigger Confetti Pop Effect if 5 Stars
        if (currentSelectedRating === 5 && typeof fireGoldenConfetti === "function") {
          fireGoldenConfetti();
        }

        // Thank-you feedback message display
        if (ratingFeedbackText) {
          const feedbackMsg = [
            "Thank you! Rated 1 Star",
            "Thank you! Rated 2 Stars",
            "Thank you! Rated 3 Stars",
            "Thank you! Rated 4 Stars ⭐",
            "Thank you! 5 Star Golden Experience! ✨"
          ];
          ratingFeedbackText.textContent = feedbackMsg[currentSelectedRating - 1] || "Thank you for rating!";
          ratingFeedbackText.style.color = "#ffd700";
          ratingFeedbackText.style.fontWeight = "600";

          gsap.fromTo(ratingFeedbackText, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
        }
      });
    });

    // Reset to current selected rating when mouse leaves star container
    const starRatingWrap = document.getElementById("starRatingWrap");
    if (starRatingWrap) {
      starRatingWrap.addEventListener("mouseleave", () => {
        updateStarDisplay(currentSelectedRating);
      });
    }
  }

  // Realtime Mobile Input Sanitization (only allow digits and max 10 chars)
  if (mobileInput) {
    mobileInput.addEventListener("input", (e) => {
      mobileInput.value = mobileInput.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  // Realtime Mobile Input Sanitization (only allow digits and max 10 chars)
  if (mobileInput) {
    mobileInput.addEventListener("input", (e) => {
      mobileInput.value = mobileInput.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  if (redemptionForm) {
    redemptionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const mobileVal = mobileInput ? mobileInput.value.trim() : "";
      const mobileRegex = /^[6-9]\d{9}$/;

      if (!mobileRegex.test(mobileVal)) {
        alert(
          "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9."
        );
        if (mobileInput) mobileInput.focus();
        return;
      }

      // Check for specific registered campaign mobile number validation
      if (mobileVal === "7827232156") {
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

    const total = 55;
    for (let i = 0; i < total; i++) {
      const type = Math.random();
      particles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        r: type > 0.85 ? Math.random() * 3.5 + 2 : Math.random() * 2 + 0.8,
        color:
          type > 0.6
            ? "rgba(229, 193, 88, "
            : type > 0.3
            ? "rgba(255, 235, 175, "
            : "rgba(139, 90, 43, ",
        alpha: Math.random() * 0.75 + 0.25,
        speedY: -(Math.random() * 0.5 + 0.15),
        speedX: (Math.random() - 0.5) * 0.4,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseAngle: Math.random() * Math.PI * 2,
        isGlow: type > 0.8,
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
      p.pulseAngle += p.pulseSpeed;

      if (p.y < -10) p.y = particleCanvas.height + 10;
      if (p.x < -10) p.x = particleCanvas.width + 10;
      if (p.x > particleCanvas.width + 10) p.x = -10;

      const currentAlpha = p.alpha + Math.sin(p.pulseAngle) * 0.15;
      const clampedAlpha = Math.max(0.1, Math.min(1, currentAlpha));

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

      if (p.isGlow) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(229, 193, 88, 0.8)";
      }

      ctx.fillStyle = p.color + clampedAlpha + ")";
      ctx.fill();
      ctx.restore();
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
      socialRatingModal,
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