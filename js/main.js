document.addEventListener("DOMContentLoaded", function () {
  initWhatsAppPopup();
  initLanguageSwitcher();
  // Future: initNavbarToggle(), initFormValidation(), etc.
});

/**
 * WhatsApp popup module
 */
function initWhatsAppPopup() {
  const whatsappButton = document.getElementById("whatsapp-button");
  const whatsappPopup = document.getElementById("whatsapp-popup");
  const whatsappPopupClose = document.querySelector(".whatsapp-popup-close");

  if (!whatsappButton || !whatsappPopup || !whatsappPopupClose) return;

  let hasPopupAutoOpened = false;
  const showPopupAtY = 500;

  // Auto-show on scroll
  window.addEventListener("scroll", function () {
    const currentScrollY = window.scrollY;

    if (currentScrollY >= showPopupAtY && !hasPopupAutoOpened) {
      whatsappPopup.classList.add("whatsapp-popup-show");
      whatsappButton.classList.remove("show");
      hasPopupAutoOpened = true;
    } else if (currentScrollY < showPopupAtY && !hasPopupAutoOpened) {
      whatsappButton.classList.remove("show");
    }
  });

  // Initial visibility
  if (window.innerWidth <= 768) {
    whatsappButton.classList.add("show");
  }

  // Click to toggle popup
  whatsappButton.addEventListener("click", function () {
    whatsappPopup.classList.toggle("whatsapp-popup-show");
    if (whatsappPopup.classList.contains("whatsapp-popup-show")) {
      hasPopupAutoOpened = true;
      whatsappButton.classList.remove("show");
    } else {
      whatsappButton.classList.add("show");
    }
  });

  // Close button
  whatsappPopupClose.addEventListener("click", function () {
    whatsappPopup.classList.remove("whatsapp-popup-show");
    whatsappButton.classList.add("show");
  });

  // Click outside to close
  window.addEventListener("click", function (event) {
    if (
      !whatsappPopup.contains(event.target) &&
      !whatsappButton.contains(event.target) &&
      whatsappPopup.classList.contains("whatsapp-popup-show")
    ) {
      whatsappPopup.classList.remove("whatsapp-popup-show");
      whatsappButton.classList.add("show");
    }
  });

  // Check on load if scroll position already passed
  if (window.scrollY >= showPopupAtY && !hasPopupAutoOpened) {
    whatsappPopup.classList.add("whatsapp-popup-show");
    whatsappButton.classList.remove("show");
    hasPopupAutoOpened = true;
  } else {
    whatsappButton.classList.remove("show");
  }
}

/**
 * Language switcher module
 */
function initLanguageSwitcher() {
  // Detect language from URL path
  const langMatch = window.location.pathname.match(/^\/(az|en|ru)(\/|$)/);
  const currentLang = langMatch ? langMatch[1] : "az"; // default to AZ

  // Update visible label
  document.querySelectorAll(".language-current").forEach((el) => {
    el.textContent = currentLang.charAt(0).toUpperCase() + currentLang.slice(1);
  });

  // Handle click on language links
  document.querySelectorAll(".language-options a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const selectedLang = this.dataset.lang;
      const path = window.location.pathname;

      // Strip current lang prefix
      const cleanPath = path.replace(/^\/(az|en|ru)(\/|$)/, "/");

      // Construct new path
      const newPath =
        selectedLang === "az" ? cleanPath : `/${selectedLang}${cleanPath}`;

      // Redirect
      window.location.href = newPath;
    });
  });
}
