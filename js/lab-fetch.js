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
//   Headers for Supabase REST calls
// ─────────────────────────────────────────────────────────────────────────────
const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ─────────────────────────────────────────────────────────────────────────────
//   Grab target container from the DOM
// ─────────────────────────────────────────────────────────────────────────────
const galleryContainer = document.getElementById("gallery");
const filtersContainer = document.getElementById("filters");

// --- Loader and main content elements ---
const loaderWrapper = document.getElementById("loader-wrapper");
const mainContent = document.getElementById("main-content");
// -----------------------------------------------------

// Global IntersectionObserver instance for lazy loading
let lazyImageObserver;

// ─────────────────────────────────────────────────────────────────────────────
//   1) Fetch fresh data from Supabase on every page load
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
//   2) Render the Gallery Grid (Bootstrap columns + cards)
//      Each outer <div> gets “item” + its type (“image”, “video”, or “pdf”).
// ─────────────────────────────────────────────────────────────────────────────
function renderGallery(dataArray) {
  galleryContainer.innerHTML = ""; // Clear existing content

  if (!dataArray.length) {
    galleryContainer.innerHTML =
      '<div class="col-12 text-center"><p class="text-muted">No media found.</p></div>';
    return;
  }

  const fragment = document.createDocumentFragment(); // Use DocumentFragment for optimization

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
      link.classList.add("glightbox");
      link.setAttribute("data-gallery", "gallery");
      // link.setAttribute("data-title", item.title || "Image");

      const img = document.createElement("img");
      img.dataset.src = item.url;
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
      img.classList.add("card-img-top", "lazy-load");
      // img.alt = item.title || "Image";

      link.appendChild(img);
      card.appendChild(link);

      // ───── Title for IMAGE (commented out) ─────
      /*
      if (item.title) {
        const body = document.createElement("div");
        body.classList.add("card-body", "py-2", "px-2");
        const title = document.createElement("h6");
        title.classList.add("card-title", "mb-0", "text-center");
        title.innerText = item.title;
        body.appendChild(title);
        card.appendChild(body);
      }
      */
    } else if (item.type === "video") {
      const videoWrapper = document.createElement("div");
      videoWrapper.style.position = "relative";
      videoWrapper.style.paddingTop = "75%"; // 16:9 aspect ratio

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

      // ───── Title for VIDEO (commented out) ─────
      /*
      if (item.title) {
        const body = document.createElement("div");
        body.classList.add("card-body", "py-2", "px-2");
        const title = document.createElement("h6");
        title.classList.add("card-title", "mb-0", "text-center");
        title.innerText = item.title;
        body.appendChild(title);
        card.appendChild(body);
      }
      */
    } else if (item.type === "pdf") {
      const pdfWrapper = document.createElement("div");
      pdfWrapper.classList.add(
        "d-flex",
        "flex-column",
        "align-items-center",
        "justify-content-center",
        "p-4",
        "h-100"
      );
      pdfWrapper.style.minHeight = "150px";

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
//   3) Initialize Glightbox
// ─────────────────────────────────────────────────────────────────────────────
function initializeLightbox() {
  // GLightbox should be initialized AFTER all .glightbox elements are in the DOM
  // Disconnect existing GLightbox instance if re-initializing to avoid duplicates
  if (window.GLightboxInstance) {
    window.GLightboxInstance.destroy();
  }
  window.GLightboxInstance = GLightbox({
    selector: ".glightbox",
    // Add other GLightbox options here if needed
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//   4) Setup Filtering Logic
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
          item.style.display = ""; // Show all
        } else {
          if (item.classList.contains(filterValue.substring(1))) {
            item.style.display = ""; // Show matching type
          } else {
            item.style.display = "none"; // Hide non-matching
          }
        }
      });
      // IMPORTANT: Re-run lazy loading after filtering if new images become visible
      // AND you are re-using previously observed elements.
      // If filtering simply hides/shows existing DOM elements,
      // and they are still the same objects observed by IO, it might not be needed.
      // However, if your filtering recreates elements or loads new ones, re-init.
      // For this simple hide/show, it's generally not required to re-initialize the observer,
      // but it doesn't hurt to ensure newly visible images (if they were never observed before) get picked up.
      // However, the current setup observes ALL .lazy-load elements once.
      // If elements are just hidden/shown, the observer *still observes them*.
      // So, you don't need to call setupLazyLoading() again here.
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//   NEW: Setup Lazy Loading for images using Intersection Observer
// ─────────────────────────────────────────────────────────────────────────────
function setupLazyLoading() {
  // Disconnect existing observer if it was previously set up
  if (lazyImageObserver) {
    lazyImageObserver.disconnect();
  }

  const lazyImages = document.querySelectorAll(".lazy-load");

  if ("IntersectionObserver" in window) {
    lazyImageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let lazyImage = entry.target;
            // Load the actual image
            lazyImage.src = lazyImage.dataset.src;
            // Optional: Add a class for loaded state (e.g., to fade in)
            // lazyImage.classList.add("loaded");
            lazyImage.classList.remove("lazy-load"); // Remove lazy-load class
            observer.unobserve(lazyImage); // Stop observing once loaded
          }
        });
      },
      {
        rootMargin: "0px 0px 200px 0px", // Load images when they are 200px from the bottom/top of the viewport
      }
    );

    lazyImages.forEach((lazyImage) => {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Fallback for browsers that do not support Intersection Observer (older browsers)
    // In this case, load all images immediately.
    console.warn(
      "IntersectionObserver not supported. Loading all images immediately."
    );
    lazyImages.forEach((lazyImage) => {
      lazyImage.src = lazyImage.dataset.src;
      lazyImage.classList.remove("lazy-load");
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//   5) Load Gallery ONLY after the entire page (including images, CSS, other scripts) has loaded
// ─────────────────────────────────────────────────────────────────────────────
window.addEventListener("load", async () => {
  try {
    const galleryData = await fetchGalleryData();
    renderGallery(galleryData);
    initializeLightbox(); // Re-initialize GLightbox after new elements are in DOM
    setupFilters();
    setupLazyLoading(); // --- Call the new lazy loading setup here ---
  } catch (error) {
    if (galleryContainer) {
      galleryContainer.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-danger">Error loading gallery: ${error.message}</p>
        </div>`;
    }
    console.error("Error loading gallery:", error);
  } finally {
    // --- The 2-second delay for the loader ---
    setTimeout(() => {
      if (loaderWrapper) {
        loaderWrapper.classList.add("hidden");
        // Remove loader from DOM after transition to avoid interference
        loaderWrapper.addEventListener(
          "transitionend",
          () => {
            loaderWrapper.style.display = "none";
          },
          { once: true }
        );
      }
      if (mainContent) {
        mainContent.style.display = ""; // Revert to its original display property
      }
    }, 1000); // 1000 milliseconds = 1 second
  }
});
