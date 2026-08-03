document.addEventListener("DOMContentLoaded", () => {
  // Customer Claims Dataset
  const initialCustomers = [
    { name: "Mohit Sharma", mobile: "7206611307", upiId: "BHARATPE.900687@fbpe", date: "2026-02-16", amount: "20", status: "SUCCESS", happyCode: "7892", item: "1x Signature Choco Toffee", time: "10:42 AM Today", offerTitle: "20% Cashback + Bonus Toffee Pack", offerCode: "CHOCO-GOLD-77" },
    { name: "Priya Verma", mobile: "7206611307", upiId: "BHARATPE.900687@fbpe", date: "2026-02-17", amount: "20", status: "SUCCESS", happyCode: "4102", item: "1x Signature Choco Toffee", time: "09:15 AM Today", offerTitle: "Buy 2 Get 1 Free Toffee Pack", offerCode: "SUPER-CHOCO-21" },
    { name: "Rahul Mehta", mobile: "9712039485", upiId: "RAHULMEHTA@okhdfcbank", date: "2026-02-15", amount: "20", status: "SUCCESS", happyCode: "8823", item: "1x Signature Choco Toffee", time: "Yesterday", offerTitle: "₹50 Instant UPI Cashback", offerCode: "HAPPY-CASH-50" },
    { name: "Ananya Roy", mobile: "9632147850", upiId: "ANANYAROY@paytm", date: "2026-02-14", amount: "20", status: "SUCCESS", happyCode: "1294", item: "1x Signature Choco Toffee", time: "Yesterday", offerTitle: "Free Premium Choco Gift Box", offerCode: "GOLD-BOX-99" },
    { name: "Suresh Kumar", mobile: "9541236987", upiId: "SURESHK@ybl", date: "2026-02-13", amount: "20", status: "SUCCESS", happyCode: "9031", item: "1x Signature Choco Toffee", time: "02 Aug 2026", offerTitle: "15% Retailer Special Bonus", offerCode: "SPECIAL-REWARD-15" }
  ];

  function renderCustomerList(filterText = "") {
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
        <span class="dash-badge dash-badge--green-solid">${cust.status || 'SUCCESS'}</span>
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
          <span class="dash-cust-time"><i class="fa-regular fa-calendar"></i>${cust.date || cust.time}</span>
          <span class="dash-badge dash-badge--gold">${cust.offerCode}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        openOfferModal(cust);
      });

      listContainer.appendChild(card);
    });
  }

  // Render initial list & search filter
  renderCustomerList();

  const searchInput = document.getElementById("dashCustomerSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderCustomerList(e.target.value);
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

  // Modal 1: Customer Offer Modal
  const customerOfferModalOverlay = document.getElementById("customerOfferModalOverlay");
  const closeCustomerOfferModalBtn = document.getElementById("closeCustomerOfferModalBtn");
  const closeOfferModalDoneBtn = document.getElementById("closeOfferModalDoneBtn");

  function openOfferModal(cust = initialCustomers[0]) {
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

    customerOfferModalOverlay.classList.add("active");
  }

  function closeOfferModal() {
    if (customerOfferModalOverlay) customerOfferModalOverlay.classList.remove("active");
  }

  if (closeCustomerOfferModalBtn) closeCustomerOfferModalBtn.addEventListener("click", closeOfferModal);
  if (closeOfferModalDoneBtn) closeOfferModalDoneBtn.addEventListener("click", closeOfferModal);

  // Modal 2: OTP Verification Modal
  const otpModalOverlay = document.getElementById("otpModalOverlay");
  const closeOtpModalBtn = document.getElementById("closeOtpModalBtn");
  const confirmOtpBtn = document.getElementById("confirmOtpBtn");

  function openOtpModal() {
    if (otpModalOverlay) otpModalOverlay.classList.add("active");
  }
  function closeOtpModal() {
    if (otpModalOverlay) otpModalOverlay.classList.remove("active");
  }

  if (closeOtpModalBtn) closeOtpModalBtn.addEventListener("click", closeOtpModal);
  if (confirmOtpBtn) confirmOtpBtn.addEventListener("click", closeOtpModal);

  // Modal 3: Restock Request Modal
  const restockModalOverlay = document.getElementById("restockModalOverlay");
  const closeRestockModalBtn = document.getElementById("closeRestockModalBtn");
  const confirmRestockBtn = document.getElementById("confirmRestockBtn");

  function openRestockModal() {
    if (restockModalOverlay) restockModalOverlay.classList.add("active");
  }
  function closeRestockModal() {
    if (restockModalOverlay) restockModalOverlay.classList.remove("active");
  }

  if (closeRestockModalBtn) closeRestockModalBtn.addEventListener("click", closeRestockModal);
  if (confirmRestockBtn) confirmRestockBtn.addEventListener("click", closeRestockModal);

  // FAB Menu Triggers
  const fabBtnOfferModal = document.getElementById("fabBtnOfferModal");
  const fabBtnVerifyModal = document.getElementById("fabBtnVerifyModal");
  const fabBtnRestockModal = document.getElementById("fabBtnRestockModal");

  if (fabBtnOfferModal) {
    fabBtnOfferModal.addEventListener("click", () => {
      openOfferModal(initialCustomers[0]);
      if (fabMenu) fabMenu.classList.remove("active");
    });
  }

  if (fabBtnVerifyModal) {
    fabBtnVerifyModal.addEventListener("click", () => {
      openOtpModal();
      if (fabMenu) fabMenu.classList.remove("active");
    });
  }

  if (fabBtnRestockModal) {
    fabBtnRestockModal.addEventListener("click", () => {
      openRestockModal();
      if (fabMenu) fabMenu.classList.remove("active");
    });
  }
});
