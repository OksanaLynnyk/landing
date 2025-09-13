document.addEventListener("DOMContentLoaded", () => {
  const popup = document.querySelector(".cookie-popup");
  const cookieStatus = localStorage.getItem("cookieConsent");

  if (!cookieStatus) {
    setTimeout(() => {
      popup.classList.add("show-popup");
    }, 5000);
  }

  document.querySelector(".accept-btn").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    closePopup();
  });

  document.querySelector(".decline-btn").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "declined");
    closePopup();
  });

  function closePopup() {
    popup.classList.remove("show-popup");
  }
});