document.addEventListener("DOMContentLoaded", function() {
  var whatsappButton = document.getElementById("whatsapp-button");
  var whatsappPopup = document.getElementById("whatsapp-popup");
  var whatsappPopupClose = document.querySelector(".whatsapp-popup-close");

  // Function to show/hide WhatsApp button on scroll
  window.addEventListener("scroll", function() {
      if (window.scrollY > 100) { // Adjust scroll threshold as needed
          whatsappButton.classList.add("show");
      } else {
          whatsappButton.classList.remove("show");
          // Optionally hide popup if button hides
          whatsappPopup.classList.remove("whatsapp-popup-show");
      }
  });

  // On mobile, ensure the WhatsApp button is always visible on page load
  if (window.innerWidth <= 768) {
      whatsappButton.classList.add("show");
  }

  // Toggle WhatsApp popup when the button is clicked
  whatsappButton.addEventListener("click", function() {
      whatsappPopup.classList.toggle("whatsapp-popup-show");
  });

  // Hide WhatsApp popup when the close button is clicked
  whatsappPopupClose.addEventListener("click", function() {
      whatsappPopup.classList.remove("whatsapp-popup-show");
  });

  // Hide WhatsApp popup when clicking outside of it
  window.addEventListener("click", function(event) {
      if (!whatsappPopup.contains(event.target) && !whatsappButton.contains(event.target) && whatsappPopup.classList.contains("whatsapp-popup-show")) {
          whatsappPopup.classList.remove("whatsapp-popup-show");
      }
  });
});