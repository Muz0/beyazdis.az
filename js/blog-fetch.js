// js/blog-fetch.js

const API_BASE = "https://faodhpwvhonpyxlughls.supabase.co/rest/v1";
const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb2RocHd2aG9ucHl4bHVnaGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTI5MTEsImV4cCI6MjA2NDI2ODkxMX0.2yXQKif90Arr1yjVohA8PXj1zJ4Kxn3tj8aJtae3yic";

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

const loaderWrapper = document.getElementById("loader-wrapper");
const mainContent = document.getElementById("main-content");

async function fetchBlogs() {
  const container = document.getElementById("blog-container");
  if (!container) {
    console.error('Error: "blog-container" element not found.');
    hideLoader();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/blogs?select=*`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch blogs: ${response.status} ${response.statusText}`
      );
    }

    const blogs = await response.json();

    blogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    localStorage.setItem("blogsData", JSON.stringify(blogs));

    renderBlogCards(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);

    const cachedBlogs = localStorage.getItem("blogsData");

    if (cachedBlogs) {
      const blogs = JSON.parse(cachedBlogs);
      renderBlogCards(blogs);
      if (container) {
        container.insertAdjacentHTML(
          "beforebegin",
          `<p class="text-warning text-center mt-3">Warning: Could not fetch new data. Showing cached content.</p>`
        );
      }
    } else {
      if (container) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Error loading blogs: ${error.message}</p>
            </div>
        `;
      }
    }
  } finally {
    hideLoader();
  }
}

function renderBlogCards(blogs) {
  const container = document.getElementById("blog-container");
  if (!container) {
    console.error('No container element found with id "blog-container"');
    return;
  }

  container.innerHTML = "";

  if (blogs.length === 0) {
    container.innerHTML = `
        <div class="col-12 text-center">
            <p class="text-muted">No blog posts found.</p>
        </div>
    `;
    return;
  }

  blogs.forEach((blog) => {
    const createdDate = new Date(blog.created_at);
    const day = createdDate.getDate();
    const month = createdDate.toLocaleString("en-US", { month: "short" });
    const year = createdDate.getFullYear();

    const tags =
      blog.tags && blog.tags.length ? blog.tags.join(", ") : "No tags";
    // *** IMPORTANT CHANGE HERE ***
    const coverImage = blog.cover_image_url || "images/blog/default.webp";

    const cardHTML = `
      <div class="col-lg-4 col-md-6 col-sm-12">
        <a href="blog-single.html?slug=${encodeURIComponent(
          blog.slug
        )}" class="blog-card-link">
          <div class="blog-card">
            <div class="image-wrapper">
              <img src="${coverImage}" alt="${blog.title}">
            </div>
            <div class="content">
              <h4>${blog.title}</h4>
              <div class="blog-meta">
                <img src="./android-chrome-192x192.png" class="w-20px me-2 circle" alt="Author">
                <span class="fs-14 me-3">Bəyaz Diş</span>
                <span class="fs-14 me-3"><i class="icofont-calendar id-color me-2"></i>${month} ${day}, ${year}</span>
                <span class="fs-14"><i class="icofont-tags id-color me-2"></i>${tags}</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", cardHTML);
  });
}

function hideLoader() {
  setTimeout(() => {
    if (loaderWrapper) {
      loaderWrapper.classList.add("hidden");
      loaderWrapper.addEventListener(
        "transitionend",
        () => {
          loaderWrapper.style.display = "none";
        },
        { once: true }
      );
    }
    if (mainContent) {
      mainContent.style.display = "";
    }
  }, 1000);
}

window.addEventListener("load", fetchBlogs);
