/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 */
const API_BASE = "https://faodhpwvhonpyxlughls.supabase.co/rest/v1";
const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb2RocHd2aG9ucHl4bHVnaGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTI5MTEsImV4cCI6MjA2NDI2ODkxMX0.2yXQKif90Arr1yjVohA8PXj1zJ4Kxn3tj8aJtae3yic";
const TABLE_NAME = "laboratory";

// ─────────────────────────────────────────────────────────────────────────────
//  Headers for Supabase REST calls
// ─────────────────────────────────────────────────────────────────────────────
const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ─────────────────────────────────────────────────────────────────────────────
//  Grab target container from the DOM
// ─────────────────────────────────────────────────────────────────────────────
const galleryContainer = document.getElementById("gallery");
const filtersContainer = document.getElementById("filters");

// ─────────────────────────────────────────────────────────────────────────────
//  1) Fetch fresh data from Supabase on every page load
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
//  2) Render the Gallery Grid (Bootstrap columns + cards)
//     Each outer <div> gets “item” + its type (“image”, “video”, or “pdf”).
// ─────────────────────────────────────────────────────────────────────────────
function renderGallery(dataArray) {
  galleryContainer.innerHTML = ""; // Clear existing content

  if (!dataArray.length) {
    galleryContainer.innerHTML =
      '<div class="col-12 text-center"><p class="text-muted">No media found.</p></div>';
    return;
  }

  dataArray.forEach((item) => {
    // Outer <div class="col-lg-3 col-md-4 col-sm-6 col-12 item image|video|pdf">
    const col = document.createElement("div");
    col.classList.add(
      "col-lg-3",
      "col-md-4",
      "col-sm-6",
      "col-12",
      "item",
      item.type // “image”, “video”, or “pdf”
    );
    col.style.minHeight = "1px";

    // Card wrapper
    const card = document.createElement("div");
    card.classList.add("card", "h-100", "shadow-sm", "overflow-hidden");

    if (item.type === "image") {
      // ─── IMAGE CARD ────────────────────────────────────────
      const link = document.createElement("a");
      link.href = item.url;
      link.classList.add("image-popup"); // Magnific Popup will catch clicks

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
      // ─── VIDEO CARD ────────────────────────────────────────
      const videoWrapper = document.createElement("div");
      videoWrapper.style.position = "relative";
      videoWrapper.style.paddingTop = "56.25%"; // 16:9
      // videoWrapper.style.overflow = "hidden";

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
      // ─── PDF CARD ─────────────────────────────────────────
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
    galleryContainer.appendChild(col);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  3) Initialize Magnific Popup
// ─────────────────────────────────────────────────────────────────────────────
function initializeLightbox() {
  $(".image-popup").magnificPopup({
    type: "image",
    gallery: {
      enabled: true,
    },
    image: {
      titleSrc: "title",
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  4) Setup Filtering Logic
// ─────────────────────────────────────────────────────────────────────────────
function setupFilters() {
  if (!filtersContainer) return; // Exit if filters container not found

  filtersContainer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Update active class for filters
      filtersContainer.querySelectorAll("a").forEach((el) => {
        el.classList.remove("selected");
      });
      link.classList.add("selected");

      const filterValue = link.dataset.filter; // "*", ".image", ".video", or ".pdf"

      document.querySelectorAll("#gallery .item").forEach((item) => {
        if (filterValue === "*") {
          item.style.display = ""; // Show all
        } else {
          if (item.classList.contains(filterValue.substring(1))) {
            item.style.display = ""; // Show if matches filter
          } else {
            item.style.display = "none"; // Hide if doesn't match
          }
        }
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  5) Load Gallery on DOMContentLoaded
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const galleryData = await fetchGalleryData();
    renderGallery(galleryData);
    initializeLightbox(); // Initialize after rendering all elements
    setupFilters(); // Set up filters after the gallery is rendered
  } catch (error) {
    galleryContainer.innerHTML = `
            <div class="col-12 text-center">
              <p class="text-danger">Error loading gallery: ${error.message}</p>
            </div>`;
    console.error("Error loading gallery:", error);
  }
});
