document.addEventListener("DOMContentLoaded", function () {
  var whatsappButton = document.getElementById("whatsapp-button");
  var whatsappPopup = document.getElementById("whatsapp-popup");
  var whatsappPopupClose = document.querySelector(".whatsapp-popup-close");

  var hasPopupAutoOpened = false;

  var showPopupAtY = 500;

  window.addEventListener("scroll", function () {
    var currentScrollY = window.scrollY;

    if (currentScrollY >= showPopupAtY && !hasPopupAutoOpened) {
      whatsappPopup.classList.add("whatsapp-popup-show");
      whatsappButton.classList.remove("show");
      hasPopupAutoOpened = true;
    } else if (currentScrollY < showPopupAtY && !hasPopupAutoOpened) {
      whatsappButton.classList.remove("show");
    }
  });

  if (window.innerWidth <= 768) {
    whatsappButton.classList.add("show");
  }

  whatsappButton.addEventListener("click", function () {
    whatsappPopup.classList.toggle("whatsapp-popup-show");
    if (whatsappPopup.classList.contains("whatsapp-popup-show")) {
      hasPopupAutoOpened = true;
      whatsappButton.classList.remove("show");
    } else {
      whatsappButton.classList.add("show");
    }
  });

  whatsappPopupClose.addEventListener("click", function () {
    whatsappPopup.classList.remove("whatsapp-popup-show");
    whatsappButton.classList.add("show");
  });

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

  var initialScrollY = window.scrollY;
  if (initialScrollY >= showPopupAtY && !hasPopupAutoOpened) {
    whatsappPopup.classList.add("whatsapp-popup-show");
    whatsappButton.classList.remove("show");
    hasPopupAutoOpened = true;
  } else {
    whatsappButton.classList.remove("show");
  }
});
