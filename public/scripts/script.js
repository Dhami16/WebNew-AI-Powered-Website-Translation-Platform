// Hamburger menu functionality
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const mobileNav = document.querySelector(".mobile-nav");

  // Toggle mobile menu
  hamburger.addEventListener("click", function () {
    this.classList.toggle("active");
    mobileNav.classList.toggle("active");

    // Toggle body scroll when menu is open
    if (mobileNav.classList.contains("active")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });

  // Close menu when clicking on links
  document.querySelectorAll(".mobile-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      mobileNav.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Close menu when clicking on login button
  document
    .querySelector(".mobile-nav .cta-button")
    .addEventListener("click", () => {
      hamburger.classList.remove("active");
      mobileNav.classList.remove("active");
      document.body.style.overflow = "";
    });

  // Demo window interactions
  document
    .querySelector(".translate-btn")
    .addEventListener("click", function () {
      const originalText = this.textContent;

      this.textContent = "Translating...";
      this.style.background = "linear-gradient(45deg, #28ca42, #22a83a)";

      setTimeout(() => {
        this.textContent = "Complete!";
        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = "";
        }, 1500);
      }, 1000);
    });

  // Language selector interaction
  document.querySelectorAll(".lang-box").forEach((box) => {
    box.addEventListener("click", function () {
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
    });
  });

  // Tab navigation
  document.querySelectorAll(".nav-tabs span").forEach((tab) => {
    tab.addEventListener("click", function () {
      document
        .querySelectorAll(".nav-tabs span")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
    });
  });

});

// ===== Global: Copy embed snippet =====
function copyEmbedSnippet(containerId) {
  try {
    const container = document.getElementById(containerId);
    if (!container) return;
    const code = container.querySelector("code");
    if (!code) return;
    const text = code.textContent;
    navigator.clipboard.writeText(text).then(() => {
      // Try to show notification if available
      if (typeof showNotification === "function") {
        showNotification("Embed snippet copied!", "success");
      }
    }).catch(() => {
      alert("Copy failed. Please copy manually.");
    });
  } catch (e) {
    alert("Copy failed. Please copy manually.");
  }
}