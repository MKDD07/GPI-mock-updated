/* ============================================================
   UNIVERSAL FLOATING ACTION MENU (nav-fab.js)
   Dynamically injects universal navigation FAB across all pages
   ============================================================ */

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // Avoid duplicate injection
    if (document.getElementById("universalFabContainer")) return;

    // Create container
    const fabContainer = document.createElement("div");
    fabContainer.id = "universalFabContainer";
    fabContainer.className = "dash-fab-container";

    fabContainer.innerHTML = `
      <button type="button" id="universalFabMainBtn" class="dash-fab-main" title="Navigate Pages">
        <i class="fa-solid fa-layer-group"></i>
      </button>
      <div class="dash-fab-menu" id="universalFabMenu">
        <a href="index.html" class="dash-fab-item">
          <i class="fa-solid fa-house"></i>
          <span>Customer Portal</span>
        </a>
        <a href="retailer.html" class="dash-fab-item">
          <i class="fa-solid fa-chart-line"></i>
          <span>Full Retailer Dashboard</span>
        </a>
        <a href="retailer-basic.html" class="dash-fab-item">
          <i class="fa-solid fa-store"></i>
          <span>Basic Retailer Dashboard</span>
        </a>
      </div>
    `;

    document.body.appendChild(fabContainer);

    // Toggle menu visibility
    const mainBtn = document.getElementById("universalFabMainBtn");
    const menu = document.getElementById("universalFabMenu");

    if (mainBtn && menu) {
      mainBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isActive = menu.classList.toggle("active");
        menu.style.display = isActive ? "flex" : "none";
      });

      document.addEventListener("click", (e) => {
        if (!fabContainer.contains(e.target)) {
          menu.classList.remove("active");
          menu.style.display = "none";
        }
      });
    }
  });
})();
