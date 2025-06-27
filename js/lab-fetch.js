/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 */
const API_BASE = "https://faodhpwvhonpyxlughls.supabase.co/rest/v1";
const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb2RocHd2aG9ucHl4bHVnaGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTI5MTEsImV4cCI6MjA2NDI2ODkxMX0.2yXQKif90Arr1yjVohA8PXj1zJ4Kxn3tj8aJtae3yic";
const TABLE_NAME = "laboratory";

// ─────────────────────────────────────────────────────────────────────────────
//  Headers for Supabase REST calls
// ─────────────────────────────────────────────────────────────────────────────
const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ─────────────────────────────────────────────────────────────────────────────
//  Grab target container from the DOM
// ─────────────────────────────────────────────────────────────────────────────
const galleryContainer = document.getElementById("gallery");
const filtersContainer = document.getElementById("filters");

// --- Новые элементы для лоадера и основного контента ---
const loaderWrapper = document.getElementById("loader-wrapper");
const mainContent = document.getElementById("main-content");
// -----------------------------------------------------

// ─────────────────────────────────────────────────────────────────────────────
//  1) Fetch fresh data from Supabase on every page load
// ─────────────────────────────────────────────────────────────────────────────
async function fetchGalleryData() {
  const url = `${API_BASE}/${TABLE_NAME}?select=*`;
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch gallery data (${response.status}).`);
  }
  const data = await response.json();
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
//  2) Render the Gallery Grid (Bootstrap columns + cards)
//     Each outer <div> gets “item” + its type (“image”, “video”, or “pdf”).
// ─────────────────────────────────────────────────────────────────────────────
function renderGallery(dataArray) {
  galleryContainer.innerHTML = ""; // Clear existing content

  if (!dataArray.length) {
    galleryContainer.innerHTML =
      '<div class="col-12 text-center"><p class="text-muted">No media found.</p></div>';
    return;
  }

  const fragment = document.createDocumentFragment(); // Используем DocumentFragment для оптимизации

  dataArray.forEach((item) => {
    const col = document.createElement("div");
    col.classList.add(
      "col-lg-3",
      "col-md-4",
      "col-sm-6",
      "col-12",
      "item",
      item.type
    );

    const card = document.createElement("div");
    card.classList.add("card", "h-100", "shadow-sm", "overflow-hidden");

    if (item.type === "image") {
      const link = document.createElement("a");
      link.href = item.url;
      link.classList.add("glightbox"); // Make sure this class is present for GLightbox
      link.setAttribute("data-gallery", "gallery");
      link.setAttribute("data-title", item.title || "Image");

      const img = document.createElement("img");
      img.src = item.url;
      img.classList.add("card-img-top");
      img.alt = item.title || "Image";

      link.appendChild(img);
      card.appendChild(link);

      if (item.title) {
        const body = document.createElement("div");
        body.classList.add("card-body", "py-2", "px-2");
        const title = document.createElement("h6");
        title.classList.add("card-title", "mb-0", "text-center");
        title.innerText = item.title;
        body.appendChild(title);
        card.appendChild(body);
      }
    } else if (item.type === "video") {
      const videoWrapper = document.createElement("div");
      videoWrapper.style.position = "relative";
      videoWrapper.style.paddingTop = "56.25%"; // 16:9

      const video = document.createElement("video");
      video.setAttribute("controls", "controls");
      video.style.position = "absolute";
      video.style.top = "0";
      video.style.left = "0";
      video.style.width = "100%";
      video.style.height = "100%";

      const source = document.createElement("source");
      source.src = item.url;
      source.type = "video/mp4";
      video.appendChild(source);

      videoWrapper.appendChild(video);
      card.appendChild(videoWrapper);

      if (item.title) {
        const body = document.createElement("div");
        body.classList.add("card-body", "py-2", "px-2");
        const title = document.createElement("h6");
        title.classList.add("card-title", "mb-0", "text-center");
        title.innerText = item.title;
        body.appendChild(title);
        card.appendChild(body);
      }
    } else if (item.type === "pdf") {
      const pdfWrapper = document.createElement("div");
      pdfWrapper.classList.add(
        "d-flex",
        "flex-column",
        "align-items-center",
        "justify-content-center",
        "p-4"
      );

      const icon = document.createElement("i");
      icon.classList.add("fas", "fa-file-pdf", "fa-3x", "text-danger");
      icon.style.marginBottom = "0.5rem";

      const title = document.createElement("p");
      title.classList.add("mb-0", "text-center");
      title.innerText = item.title || "PDF Document";

      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.classList.add("stretched-link");

      pdfWrapper.appendChild(icon);
      pdfWrapper.appendChild(title);

      card.appendChild(pdfWrapper);
      card.appendChild(link);
    }

    col.appendChild(card);
    fragment.appendChild(col);
  });

  galleryContainer.appendChild(fragment);
}

// ─────────────────────────────────────────────────────────────────────────────
//  3) Initialize Glightbox
// ─────────────────────────────────────────────────────────────────────────────
function initializeLightbox() {
  // GLightbox should be initialized AFTER all .glightbox elements are in the DOM
  GLightbox({
    selector: ".glightbox",
    // Add other GLightbox options here if needed
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  4) Setup Filtering Logic
// ─────────────────────────────────────────────────────────────────────────────
function setupFilters() {
  if (!filtersContainer) return;

  filtersContainer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      filtersContainer.querySelectorAll("a").forEach((el) => {
        el.classList.remove("selected");
      });
      link.classList.add("selected");

      const filterValue = link.dataset.filter;

      document.querySelectorAll("#gallery .item").forEach((item) => {
        if (filterValue === "*") {
          item.style.display = "";
        } else {
          if (item.classList.contains(filterValue.substring(1))) {
            item.style.display = "";
          } else {
            item.style.display = "none";
          }
        }
      });
      // Re-initialize GLightbox if filtering breaks its functionality (e.g., if it loses track of hidden elements)
      // If GLightbox works fine after filtering, keep this commented out for performance.
      // initializeLightbox();
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  5) Load Gallery ONLY after the entire page (including images, CSS, other scripts) has loaded
// ─────────────────────────────────────────────────────────────────────────────
window.addEventListener("load", async () => {
  try {
    const galleryData = await fetchGalleryData();
    renderGallery(galleryData);
    initializeLightbox();
    setupFilters();
  } catch (error) {
    if (galleryContainer) {
      galleryContainer.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-danger">Error loading gallery: ${error.message}</p>
        </div>`;
    }
    console.error("Error loading gallery:", error);
  } finally {
    // --- Добавляем задержку в 1 секунду перед скрытием лоадера ---
    setTimeout(() => {
      if (loaderWrapper) {
        loaderWrapper.classList.add("hidden");
        // Remove loader from DOM after transition to avoid interference
        loaderWrapper.addEventListener('transitionend', () => {
            loaderWrapper.style.display = 'none';
        }, { once: true });
      }
      if (mainContent) {
        mainContent.style.display = ""; // Revert to its original display property (block, flex, etc.)
      }
    }, 2000); // 1000 миллисекунд = 1 секунда
    // -------------------------------------------------------------------------
  }
});