document.addEventListener("DOMContentLoaded", () => {
  // GSAP Loader Showcase Animation
  const loaderOverlay = document.getElementById("loaderOverlay");
  const loaderToffee = document.getElementById("loaderToffee");
  const loaderBarFill = document.getElementById("loaderBarFill");
  const mainContent = document.getElementById("mainContent");

  if (loaderOverlay && loaderToffee && loaderBarFill) {
    // 1. Initial set up
    gsap.set(loaderToffee, { scale: 0.5, rotation: -15, opacity: 0 });
    gsap.set(mainContent, { opacity: 0, y: 20 });

    const tl = gsap.timeline();

    // 2. Animate toffee entrance & pulse showcase
    tl.to(loaderToffee, {
      duration: 1,
      scale: 1.15,
      rotation: 0,
      opacity: 1,
      ease: "back.out(1.7)"
    })
    .to(loaderToffee, {
      duration: 1.2,
      scale: 1,
      rotation: 5,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut"
    }, "-=0.3")
    .to(loaderBarFill, {
      duration: 2,
      width: "100%",
      ease: "power2.inOut"
    }, 0.2)
    .to(loaderOverlay, {
      duration: 0.8,
      opacity: 0,
      ease: "power2.out",
      onComplete: () => {
        loaderOverlay.style.display = "none";
      }
    })
    .to(mainContent, {
      duration: 0.8,
      opacity: 1,
      y: 0,
      ease: "power2.out"
    }, "-=0.4");
  } else if (mainContent) {
    mainContent.style.opacity = 1;
  }

  // Handle Form Submission & Confirmation Modal
  const confirmBtnDesktop = document.getElementById("confirmBtnDesktop");
  const confirmModalOverlay = document.getElementById("confirmModalOverlay");
  const modalConfirmBtn = document.getElementById("modalConfirmBtn");
  const desktopMobileInput = document.getElementById("desktopMobileInput");
  const modalMobileDisplay = document.getElementById("modalMobileDisplay");
  const editMobileBtn = document.getElementById("editMobileBtn");

  // QR Code Scanner Integration
  const scanUpiQrBtn = document.getElementById("scanUpiQrBtn");
  const qrScannerModalOverlay = document.getElementById("qrScannerModalOverlay");
  const closeQrScannerBtn = document.getElementById("closeQrScannerBtn");
  const desktopUpiInput = document.getElementById("desktopUpiInput");
  const qrScannerFeedback = document.getElementById("qrScannerFeedback");

  let html5QrScanner = null;

  function stopScanner() {
    if (html5QrScanner) {
      html5QrScanner.stop().then(() => {
        html5QrScanner.clear();
        html5QrScanner = null;
      }).catch((err) => {
        console.warn("Scanner stop error:", err);
        html5QrScanner = null;
      });
    }
  }

  if (scanUpiQrBtn && qrScannerModalOverlay) {
    scanUpiQrBtn.addEventListener("click", () => {
      qrScannerModalOverlay.classList.add("active");

      if (window.Html5Qrcode) {
        if (!html5QrScanner) {
          html5QrScanner = new Html5Qrcode("retailerQrReader");
        }
        html5QrScanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (desktopUpiInput) {
              desktopUpiInput.value = decodedText;
            }
            if (qrScannerFeedback) {
              qrScannerFeedback.textContent = "QR Code Scanned: " + decodedText;
            }
            setTimeout(() => {
              qrScannerModalOverlay.classList.remove("active");
              stopScanner();
            }, 600);
          },
          (errorMessage) => {
            // Ignore scan error logs
          }
        ).catch((err) => {
          if (qrScannerFeedback) {
            qrScannerFeedback.textContent = "Camera access denied or unavailable. Please enter UPI manually.";
          }
        });
      }
    });
  }

  if (closeQrScannerBtn && qrScannerModalOverlay) {
    closeQrScannerBtn.addEventListener("click", () => {
      qrScannerModalOverlay.classList.remove("active");
      stopScanner();
    });
  }

  if (qrScannerModalOverlay) {
    qrScannerModalOverlay.addEventListener("click", (e) => {
      if (e.target === qrScannerModalOverlay) {
        qrScannerModalOverlay.classList.remove("active");
        stopScanner();
      }
    });
  }

  // Dynamic Form Field Completeness Checker
  const formInputs = [
    document.getElementById("desktopSfaInput"),
    document.getElementById("desktopOutletInput"),
    document.getElementById("desktopLocationInput"),
    document.getElementById("desktopUpiInput"),
    desktopMobileInput
  ];

  function checkFormCompletion() {
    const sfaVal = document.getElementById("desktopSfaInput") ? document.getElementById("desktopSfaInput").value.trim() : "";
    const outletVal = document.getElementById("desktopOutletInput") ? document.getElementById("desktopOutletInput").value.trim() : "";
    const locationVal = document.getElementById("desktopLocationInput") ? document.getElementById("desktopLocationInput").value.trim() : "";
    const upiVal = document.getElementById("desktopUpiInput") ? document.getElementById("desktopUpiInput").value.trim() : "";
    const mobileVal = desktopMobileInput ? desktopMobileInput.value.trim() : "";
    const mobileRegex = /^[6-9]\d{9}$/;

    const isComplete = sfaVal && outletVal && locationVal && upiVal && mobileRegex.test(mobileVal);

    if (confirmBtnDesktop) {
      if (isComplete) {
        confirmBtnDesktop.classList.remove("disabled-btn");
      } else {
        confirmBtnDesktop.classList.add("disabled-btn");
      }
    }
  }

  formInputs.forEach((inputEl) => {
    if (inputEl) {
      inputEl.addEventListener("input", checkFormCompletion);
      inputEl.addEventListener("change", checkFormCompletion);
    }
  });

  // Mobile Input Validation: digits only, max 10
  if (desktopMobileInput) {
    desktopMobileInput.addEventListener("input", (e) => {
      // Strip non-digits
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
      const mobileErrorHint = document.getElementById("mobileErrorHint");
      if (mobileErrorHint) {
        mobileErrorHint.style.display = "none";
      }
      checkFormCompletion();
    });
  }

  // OTP Input Auto-Tab Logic
  const otpFields = document.querySelectorAll(".otp-field");
  otpFields.forEach((field, idx) => {
    field.addEventListener("input", (e) => {
      if (e.target.value.length === 1 && idx < otpFields.length - 1) {
        otpFields[idx + 1].focus();
      }
    });
    field.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && idx > 0) {
        otpFields[idx - 1].focus();
      }
    });
  });

  const otpModalOverlay = document.getElementById("otpModalOverlay");
  const otpMobileDisplay = document.getElementById("otpMobileDisplay");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const successModalOverlay = document.getElementById("successModalOverlay");
  const successDoneBtn = document.getElementById("successDoneBtn");

  // Submit Form -> Open OTP Modal directly after filling form
  if (confirmBtnDesktop && otpModalOverlay) {
    confirmBtnDesktop.addEventListener("click", (e) => {
      e.preventDefault();

      const sfaVal = document.getElementById("desktopSfaInput") ? document.getElementById("desktopSfaInput").value.trim() : "";
      const outletVal = document.getElementById("desktopOutletInput") ? document.getElementById("desktopOutletInput").value.trim() : "";
      const locationVal = document.getElementById("desktopLocationInput") ? document.getElementById("desktopLocationInput").value.trim() : "";
      const upiVal = document.getElementById("desktopUpiInput") ? document.getElementById("desktopUpiInput").value.trim() : "";
      const mobileVal = desktopMobileInput ? desktopMobileInput.value.trim() : "";

      const mobileRegex = /^[6-9]\d{9}$/;
      const mobileErrorHint = document.getElementById("mobileErrorHint");

      // Clear previous invalid highlights
      [
        "desktopSfaInput",
        "desktopOutletInput",
        "desktopLocationInput",
        "desktopUpiInput",
        "desktopMobileInput"
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove("invalid-field");
      });

      let hasEmptyField = false;

      if (!sfaVal) {
        document.getElementById("desktopSfaInput")?.classList.add("invalid-field");
        hasEmptyField = true;
      }
      if (!outletVal) {
        document.getElementById("desktopOutletInput")?.classList.add("invalid-field");
        hasEmptyField = true;
      }
      if (!locationVal) {
        document.getElementById("desktopLocationInput")?.classList.add("invalid-field");
        hasEmptyField = true;
      }
      if (!upiVal) {
        document.getElementById("desktopUpiInput")?.classList.add("invalid-field");
        hasEmptyField = true;
      }
      if (!mobileVal || !mobileRegex.test(mobileVal)) {
        document.getElementById("desktopMobileInput")?.classList.add("invalid-field");
        hasEmptyField = true;
        if (mobileErrorHint) mobileErrorHint.style.display = "block";
      } else {
        if (mobileErrorHint) mobileErrorHint.style.display = "none";
      }

      if (hasEmptyField) {
        return;
      }

      if (otpMobileDisplay) {
        otpMobileDisplay.textContent = mobileVal;
      }
      otpModalOverlay.classList.add("active");
      if (otpFields.length > 0) {
        setTimeout(() => otpFields[0].focus(), 200);
      }
    });
  }

  // Confirm Modal -> Open OTP Modal
  if (modalConfirmBtn && confirmModalOverlay && otpModalOverlay) {
    modalConfirmBtn.addEventListener("click", () => {
      confirmModalOverlay.classList.remove("active");
      if (otpMobileDisplay && desktopMobileInput) {
        otpMobileDisplay.textContent = desktopMobileInput.value.trim();
      }
      otpModalOverlay.classList.add("active");
      // Focus first OTP field
      if (otpFields.length > 0) {
        setTimeout(() => otpFields[0].focus(), 200);
      }
    });
  }

  // Chart.js Graph Initialization Function
  let salesChartInstance = null;
  let currentChartMode = "weekly";

  const chartDatasets = {
    weekly: {
      labels: ["01 - 07 Jul", "08 - 14 Jul", "15 - 21 Jul", "22 - 28 Jul", "29 - 31 Jul"],
      sold: [420, 580, 710, 660, 890],
      claims: [350, 480, 610, 530, 750]
    },
    monthly: {
      labels: ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026"],
      sold: [1240, 1580, 1890, 2100, 2450, 2890, 3260],
      claims: [980, 1320, 1540, 1780, 2050, 2410, 2780]
    }
  };

  function renderRetailerSalesChart(mode = currentChartMode) {
    currentChartMode = mode;
    const ctx = document.getElementById("retailerSalesChart");
    if (!ctx || !window.Chart) return;

    if (salesChartInstance) {
      salesChartInstance.destroy();
    }

    const currentData = chartDatasets[mode] || chartDatasets.weekly;

    salesChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: currentData.labels,
        datasets: [
          {
            label: "Toffee Packs Sold",
            data: currentData.sold,
            borderColor: "#d4af37",
            backgroundColor: "rgba(212, 175, 55, 0.12)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#b8860b",
            pointRadius: 5,
            pointHoverRadius: 7
          },
          {
            label: "Customer Claims Verified",
            data: currentData.claims,
            borderColor: "#8c533c",
            backgroundColor: "rgba(140, 83, 60, 0.05)",
            borderWidth: 2,
            borderDash: [5, 5],
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#8c533c",
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { family: "sans-serif", size: 12 }
            }
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "#212529",
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.05)" }
          }
        }
      }
    });
  }

  // Chart Filter Button Event Handlers
  const weeklyBtn = document.getElementById("chartFilterWeekly");
  const monthlyBtn = document.getElementById("chartFilterMonthly");

  const filterBtns = [weeklyBtn, monthlyBtn];

  function setActiveChartFilter(activeBtn, mode) {
    filterBtns.forEach(btn => {
      if (btn) btn.classList.remove("active");
    });
    if (activeBtn) activeBtn.classList.add("active");
    renderRetailerSalesChart(mode);
  }

  if (weeklyBtn) weeklyBtn.addEventListener("click", () => setActiveChartFilter(weeklyBtn, "weekly"));
  if (monthlyBtn) monthlyBtn.addEventListener("click", () => setActiveChartFilter(monthlyBtn, "monthly"));

  // Customer Claims Dataset & Offer Codes
  const initialCustomers = [
    { name: "Mohit Sharma", mobile: "7206611307", upiId: "BHARATPE.900687@fbpe", date: "2026-02-16", amount: "20", status: "SUCCESS", happyCode: "7892", item: "1x Signature Choco Toffee", time: "10:42 AM Today", offerTitle: "20% Cashback + Bonus Toffee Pack", offerCode: "CHOCO-GOLD-77" },
    { name: "Priya Verma", mobile: "7206611307", upiId: "BHARATPE.900687@fbpe", date: "2026-02-17", amount: "20", status: "SUCCESS", happyCode: "4102", item: "1x Signature Choco Toffee", time: "09:15 AM Today", offerTitle: "Buy 2 Get 1 Free Toffee Pack", offerCode: "SUPER-CHOCO-21" },
    { name: "Rahul Mehta", mobile: "9712039485", upiId: "RAHULMEHTA@okhdfcbank", date: "2026-02-15", amount: "20", status: "SUCCESS", happyCode: "8823", item: "1x Signature Choco Toffee", time: "Yesterday", offerTitle: "₹50 Instant UPI Cashback", offerCode: "HAPPY-CASH-50" },
    { name: "Ananya Roy", mobile: "9632147850", upiId: "ANANYAROY@paytm", date: "2026-02-14", amount: "20", status: "SUCCESS", happyCode: "1294", item: "1x Signature Choco Toffee", time: "Yesterday", offerTitle: "Free Premium Choco Gift Box", offerCode: "GOLD-BOX-99" },
    { name: "Suresh Kumar", mobile: "9541236987", upiId: "SURESHK@ybl", date: "2026-02-13", amount: "20", status: "SUCCESS", happyCode: "9031", item: "1x Signature Choco Toffee", time: "02 Aug 2026", offerTitle: "15% Retailer Special Bonus", offerCode: "SPECIAL-REWARD-15" }
  ];

  const offerTemplates = [
    { offerTitle: "25% Cashback + Free Toffee Bar", offerCode: "CHOCO-BONUS-25" },
    { offerTitle: "Buy 1 Get 1 Free Artisanal Toffee", offerCode: "BOGO-TOFFEE-GOLD" },
    { offerTitle: "₹100 Instant Merchant Reward Voucher", offerCode: "REWARD-100-UPI" },
    { offerTitle: "Exclusive VIP Choco Sample Pack", offerCode: "VIP-SAMPLE-CHOCO" }
  ];

  function renderCustomerTable(filterText = "") {
    const listContainer = document.getElementById("dashCustomerList");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    const query = filterText.toLowerCase().trim();
    const filtered = initialCustomers.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.mobile.includes(query) ||
      (c.upiId && c.upiId.toLowerCase().includes(query)) ||
      c.happyCode.includes(query) ||
      c.offerCode.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div class="dash-cust-empty"><i class="fa-solid fa-folder-open"></i><span>No customer claims found matching "${filterText}"</span></div>`;
      return;
    }

    filtered.forEach((cust) => {
      const card = document.createElement("div");
      card.className = "dash-cust-card";
      card.innerHTML = `
        <div class="dash-cust-info">
          <div class="dash-cust-avatar">
            <i class="fa-regular fa-user"></i>
          </div>
          <div class="dash-cust-details">
            <div class="dash-cust-name">${cust.name}</div>
            <div class="dash-cust-mobile"><i class="fa-solid fa-phone"></i>${cust.mobile}</div>
            <div class="dash-cust-upi"><i class="fa-solid fa-wallet"></i>${cust.upiId || 'BHARATPE.900687@fbpe'}</div>
          </div>
        </div>
        <div class="dash-cust-meta">
          <span class="dash-cust-amount">₹${cust.amount || '20'}</span>
          <span class="dash-badge dash-badge--green-solid">${cust.status || 'SUCCESS'}</span>
          <span class="dash-cust-time"><i class="fa-regular fa-calendar"></i>${cust.date || cust.time}</span>
          <span class="dash-badge dash-badge--gold">${cust.offerCode}</span>
        </div>
      `;

      // Card Click -> Open Customer Offer Modal
      card.addEventListener("click", () => {
        openCustomerOfferModal(cust);
      });

      listContainer.appendChild(card);
    });
  }

  // Offer Detail Modal Handlers
  const customerOfferModalOverlay = document.getElementById("customerOfferModalOverlay");
  const closeCustomerOfferModalBtn = document.getElementById("closeCustomerOfferModalBtn");
  const closeOfferModalDoneBtn = document.getElementById("closeOfferModalDoneBtn");

  function openCustomerOfferModal(cust) {
    if (!customerOfferModalOverlay) return;
    if (document.getElementById("offerModalCustomerName")) document.getElementById("offerModalCustomerName").textContent = cust.name;
    if (document.getElementById("offerModalFullName")) document.getElementById("offerModalFullName").textContent = cust.name;
    if (document.getElementById("offerModalUpiId")) document.getElementById("offerModalUpiId").textContent = cust.upiId || "BHARATPE.900687@fbpe";
    if (document.getElementById("offerModalCustomerMobile")) document.getElementById("offerModalCustomerMobile").textContent = "Mobile: " + cust.mobile;
    if (document.getElementById("offerModalHappyCode")) document.getElementById("offerModalHappyCode").textContent = cust.happyCode;
    if (document.getElementById("offerModalClaimTime")) document.getElementById("offerModalClaimTime").textContent = cust.time || "Just Now";
    if (document.getElementById("offerModalValidDate")) document.getElementById("offerModalValidDate").textContent = cust.validDate || "31 Aug 2026";
    if (document.getElementById("offerModalOfferTitle")) document.getElementById("offerModalOfferTitle").textContent = cust.offerTitle;
    if (document.getElementById("offerModalOfferCode")) document.getElementById("offerModalOfferCode").textContent = cust.offerCode;

    customerOfferModalOverlay.style.display = "flex";
    customerOfferModalOverlay.style.zIndex = "25000";
    customerOfferModalOverlay.classList.add("active");
  }

  if (closeCustomerOfferModalBtn) {
    closeCustomerOfferModalBtn.addEventListener("click", () => {
      customerOfferModalOverlay.classList.remove("active");
      customerOfferModalOverlay.style.display = "none";
    });
  }

  if (closeOfferModalDoneBtn) {
    closeOfferModalDoneBtn.addEventListener("click", () => {
      customerOfferModalOverlay.classList.remove("active");
      customerOfferModalOverlay.style.display = "none";
    });
  }

  // Customer Table Search Listener
  const searchInput = document.getElementById("dashCustomerSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderCustomerTable(e.target.value);
    });
  }

  // Section Tab Navigation Handler for Sidebar Items
  const sectionMeta = [
    { title: "Toffee Sales & Customer Redemption Analytics", sub: "Monitor daily toffee pack sales, customer claim details, and payouts in real-time." },
    { title: "Customer Claims & Offer Voucher Log", sub: "View complete records of customer code redemptions and available promo offer codes." },
    { title: "Toffee Pack Shelf & Merchant Stock Inventory", sub: "Track remaining batch stock, total packs sold, and re-stock requests." },
    { title: "Merchant Commission & Reward Payout Statements", sub: "Historical record of settled merchant commissions and payout timelines." },
    { title: "Retailer Merchant Store Settings", sub: "Manage store outlet info, SFA ID credentials, and settlement UPI accounts." }
  ];

  const allNavLinks = document.querySelectorAll(".dash-nav-link");
  const tabPanes = [
    document.getElementById("tabSalesOverview"),
    document.getElementById("tabCustomerClaims"),
    document.getElementById("tabInventory"),
    document.getElementById("tabPayouts"),
    document.getElementById("tabSettings")
  ];

  allNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = parseInt(link.getAttribute("data-tab-index"), 10);
      if (isNaN(idx)) return;

      // Reset all nav links
      allNavLinks.forEach(l => {
        l.classList.remove("active", "dash-nav-active");
      });
      // Activate matching links
      document.querySelectorAll('.dash-nav-link[data-tab-index="' + idx + '"]').forEach(l => {
        l.classList.add("active", "dash-nav-active");
      });

      // Show target tab pane with smooth ease-in animation
      tabPanes.forEach((pane, pIdx) => {
        if (pane) {
          if (pIdx === idx) {
            pane.style.display = "flex";
            // Trigger reflow to apply transition smooth ease-in
            requestAnimationFrame(() => {
              pane.classList.add("active-pane");
            });
          } else {
            pane.classList.remove("active-pane");
            pane.style.display = "none";
          }
        }
      });

      // Update Section Header Title
      const meta = sectionMeta[idx] || sectionMeta[0];
      const titleEl = document.getElementById("dashSectionTitle");
      const subEl = document.getElementById("dashSectionSub");
      if (titleEl) titleEl.textContent = meta.title;
      if (subEl) subEl.textContent = meta.sub;

      // Close mobile drawer if open
      const sidebar = document.getElementById("dashSidebar");
      const backdrop = document.getElementById("dashDrawerBackdrop");
      if (sidebar) sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("active");
    });
  });

  // Mobile Drawer Toggle (Hamburger + Close + Backdrop)
  const hamburgerBtn = document.getElementById("dashHamburgerBtn");
  const drawerCloseBtn = document.getElementById("dashDrawerCloseBtn");
  const dashSidebar = document.getElementById("dashSidebar");
  const dashBackdrop = document.getElementById("dashDrawerBackdrop");

  function openDrawer() {
    if (dashSidebar) dashSidebar.classList.add("open");
    if (dashBackdrop) dashBackdrop.classList.add("active");
  }
  function closeDrawer() {
    if (dashSidebar) dashSidebar.classList.remove("open");
    if (dashBackdrop) dashBackdrop.classList.remove("active");
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener("click", openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
  if (dashBackdrop) dashBackdrop.addEventListener("click", closeDrawer);

  // OTP Verify -> Open Retailer Analytics Dashboard Screen
  const retailerDashboardScreen = document.getElementById("retailerDashboardScreen");
  const dashMerchantName = document.getElementById("dashMerchantName");
  const dashSfaId = document.getElementById("dashSfaId");
  const dashLogoutBtn = document.getElementById("dashLogoutBtn");

  if (verifyOtpBtn && otpModalOverlay && retailerDashboardScreen) {
    verifyOtpBtn.addEventListener("click", () => {
      otpModalOverlay.classList.remove("active");

      // Extract form values
      const outletVal = document.getElementById("desktopOutletInput") ? document.getElementById("desktopOutletInput").value.trim() : "Retailer Merchant";
      const sfaVal = document.getElementById("desktopSfaInput") ? document.getElementById("desktopSfaInput").value.trim() : "104829";
      const mobileVal = desktopMobileInput ? desktopMobileInput.value.trim() : "9876543210";

      if (dashMerchantName) dashMerchantName.textContent = outletVal || "Retailer Merchant";
      if (dashSfaId) dashSfaId.textContent = "SFA-" + (sfaVal || "104829");

      // Add dynamic new customer entry with random offer
      const randOffer = offerTemplates[Math.floor(Math.random() * offerTemplates.length)];
      initialCustomers.unshift({
        name: outletVal || "New Customer",
        mobile: mobileVal,
        happyCode: Math.floor(1000 + Math.random() * 9000).toString(),
        item: "1x Signature Choco Toffee",
        time: "Just Now",
        offerTitle: randOffer.offerTitle,
        offerCode: randOffer.offerCode
      });

      renderCustomerTable();

      // Hide form & show dashboard
      if (mainContent) mainContent.style.display = "none";
      retailerDashboardScreen.style.display = "flex";
      const tab1 = document.getElementById("tabSalesOverview");
      if (tab1) tab1.classList.add("active-pane");

      // Render Chart.js graph
      setTimeout(() => {
        renderRetailerSalesChart();
      }, 100);
    });
  }

  // Direct Skip to Dashboard Button Handler
  const skipToDashboardBtn = document.getElementById("skipToDashboardBtn");
  if (skipToDashboardBtn && retailerDashboardScreen) {
    skipToDashboardBtn.addEventListener("click", () => {
      renderCustomerTable();
      if (mainContent) mainContent.style.display = "none";
      retailerDashboardScreen.style.display = "flex";
      const tab1 = document.getElementById("tabSalesOverview");
      if (tab1) tab1.classList.add("active-pane");
      setTimeout(() => {
        renderRetailerSalesChart();
      }, 100);
    });
  }

  // Dashboard Logout / Return to Form
  if (dashLogoutBtn && retailerDashboardScreen && mainContent) {
    dashLogoutBtn.addEventListener("click", () => {
      retailerDashboardScreen.style.display = "none";
      mainContent.style.display = "block";
    });
  }

  // Close Modals when clicking outside
  [confirmModalOverlay, otpModalOverlay, customerOfferModalOverlay].forEach((overlay) => {
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });
    }
  });

  // Focus mobile input on Edit button click
  if (editMobileBtn && desktopMobileInput) {
    editMobileBtn.addEventListener("click", () => {
      desktopMobileInput.focus();
    });
  }

  // Floating Action Button (FAB) Menu Toggle
  const fabMainBtn = document.getElementById("fabMainBtn");
  const fabMenu = document.getElementById("fabMenu");
  if (fabMainBtn && fabMenu) {
    fabMainBtn.addEventListener("click", () => {
      fabMenu.classList.toggle("active");
    });
  }
});
