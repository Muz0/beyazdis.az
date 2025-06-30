const API_BASE = "https://faodhpwvhonpyxlughls.supabase.co/rest/v1";
const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb2RocHd2aG9ucHl4bHVnaGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTI5MTEsImV4cCI6MjA2NDI2ODkxMX0.2yXQKif90Arr1yjVohA8PXj1zJ4Kxn3tj8aJtae3yic";

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderMainBlog(blog) {
  const headerTitle = document.querySelector("#subheader h2");
  if (headerTitle) headerTitle.textContent = blog.title;

  const postTextDiv = document.querySelector(".blog-read .post-text");
  if (!postTextDiv) return;

  let mediaHTML = "";

  if (blog.video_url) {
    const videoUrl = blog.video_url;
    const videoPosterUrl =
      blog.thumbnail_url || blog.cover_image_url || "images/blog/default.webp";

    if (videoUrl.match(/\.(mp4|webm|ogg|mov)$/i)) {
      // For direct video files, create a wrapper and custom controls
      mediaHTML = `
        <div class="video-container-custom mb-4 rounded-1">
          <video class="blog-video-player w-100 h-100" ${
            videoPosterUrl ? `poster="${videoPosterUrl}"` : ""
          }>
              <source src="${videoUrl}" type="video/mp4">
              Your browser does not support the video tag.
          </video>
          ${
            videoPosterUrl
              ? `<div class="play-button-overlay"><i class="icofont-play"></i></div>`
              : ""
          }
          <div class="pause-button-overlay" style="display: none;"><i class="icofont-pause"></i></div>
        </div>
      `;
    } else {
      // For iframes (YouTube/Vimeo), use the existing iframe structure
      mediaHTML = `
        <div class="video-container mb-4 rounded-1">
            <iframe src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-100 h-100"></iframe>
        </div>
      `;
    }
  } else {
    // If no video, display the blog's cover image
    mediaHTML = `
      <img src="${
        blog.cover_image_url || "images/blog/default.webp"
      }" class="w-100 mb-4 rounded-1" alt="${blog.title}">
    `;
  }

  postTextDiv.innerHTML = `
    <p>${blog.excerpt || ""}</p>
    ${mediaHTML}
    <p>${blog.content || ""}</p>
  `;

  // Attach event listener for custom play/pause buttons AFTER the HTML is rendered
  if (blog.video_url && blog.video_url.match(/\.(mp4|webm|ogg|mov)$/i)) {
    const videoContainer = postTextDiv.querySelector(".video-container-custom");
    const videoPlayer = videoContainer.querySelector(".blog-video-player");
    const playButton = videoContainer.querySelector(".play-button-overlay");
    const pauseButton = videoContainer.querySelector(".pause-button-overlay");

    if (playButton && pauseButton && videoPlayer) {
      // Function to show play button and hide pause button
      const showPlayButton = () => {
        playButton.style.opacity = "1";
        playButton.style.pointerEvents = "auto";
        pauseButton.style.display = "none";
      };

      // Function to show pause button and hide play button
      const showPauseButton = () => {
        playButton.style.opacity = "0";
        playButton.style.pointerEvents = "none";
        pauseButton.style.display = "flex"; // Use flex to center the icon
      };

      // Initial state: show play button if video is paused/not started
      if (videoPlayer.paused || videoPlayer.ended) {
        showPlayButton();
      } else {
        showPauseButton();
      }

      playButton.addEventListener("click", () => {
        if (videoPlayer.paused) {
          videoPlayer.play();
          showPauseButton();
        }
      });

      pauseButton.addEventListener("click", () => {
        if (!videoPlayer.paused) {
          videoPlayer.pause();
          showPlayButton();
        }
      });

      videoPlayer.addEventListener("play", () => {
        showPauseButton();
      });

      videoPlayer.addEventListener("pause", () => {
        showPlayButton();
      });

      videoPlayer.addEventListener("ended", () => {
        showPlayButton();
      });

      // Handle hover for desktop for pause button
      if (window.matchMedia("(min-width: 768px)").matches) { // Desktop breakpoint
        videoContainer.addEventListener("mouseenter", () => {
          if (!videoPlayer.paused) {
            pauseButton.style.opacity = "1";
            pauseButton.style.pointerEvents = "auto";
          }
        });

        videoContainer.addEventListener("mouseleave", () => {
          if (!videoPlayer.paused) {
            pauseButton.style.opacity = "0";
            pauseButton.style.pointerEvents = "none";
          }
        });
      } else { // Mobile: pause button visible on click only
        // The click handler for pauseButton already covers mobile behavior
      }
    }
  }
}

function renderPopularPosts(blogs, currentSlug) {
  const popularList = document.querySelector(
    ".widget-post ul.de-bloglist-type-1"
  );
  if (!popularList) return;

  popularList.innerHTML = "";

  const popularBlogs = blogs.filter((b) => b.slug !== currentSlug).slice(0, 4);

  if (popularBlogs.length === 0) {
    popularList.innerHTML = `<li class="text-muted">No other posts found.</li>`;
    return;
  }

  popularBlogs.forEach((blog) => {
    const postDate = formatDate(blog.created_at);
    const cover = blog.cover_image_url || "images/blog-thumbnail/default.webp";

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="d-image">
        <img src="${cover}" alt="${blog.title}" />
      </div>
      <div class="d-content">
        <a href="blog-single.html?slug=${encodeURIComponent(blog.slug)}">
          <h4>${blog.title}</h4>
        </a>
        <div class="d-date">${postDate}</div>
      </div>
    `;
    popularList.appendChild(li);
  });
}

function showError(message) {
  const postTextDiv = document.querySelector(".blog-read .post-text");
  if (postTextDiv) {
    postTextDiv.innerHTML = `<p class="text-danger">${message}</p>`;
  }
}

async function fetchBlogBySlug(slug) {
  try {
    const response = await fetch(`${API_BASE}/blogs?select=*&slug=eq.${slug}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch blog by slug: ${response.status} ${response.statusText}`
      );
    }

    const blogs = await response.json();
    return blogs.length > 0 ? blogs[0] : null;
  } catch (error) {
    console.error(`Error fetching blog by slug ${slug}:`, error);
    return null;
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const slug = getQueryParam("slug");
  if (!slug) {
    showError("No blog specified.");
    return;
  }

  let blog = null;
  let blogsForPopularPosts = [];

  try {
    blog = await fetchBlogBySlug(slug);
  } catch (error) {
    console.error("Error fetching main blog content:", error);
    showError("Failed to load blog content. Please try again later.");
    return;
  }

  if (!blog) {
    showError("Blog not found.");
    return;
  }

  const blogsJSON = localStorage.getItem("blogsData");
  if (blogsJSON) {
    try {
      blogsForPopularPosts = JSON.parse(blogsJSON);
    } catch (e) {
      console.error("Failed to parse blogsData from local storage:", e);
    }
  }

  if (blogsForPopularPosts.length === 0) {
    console.warn(
      "blogsData not found in local storage or failed to parse. Fetching all blogs from Supabase for 'Other posts'."
    );
    try {
      const allBlogsResponse = await fetch(`${API_BASE}/blogs?select=*`, {
        headers,
      });
      if (allBlogsResponse.ok) {
        blogsForPopularPosts = await allBlogsResponse.json();
        localStorage.setItem("blogsData", JSON.stringify(blogsForPopularPosts));
      } else {
        console.error("Failed to fetch all blogs for 'Other posts'.");
      }
    } catch (error) {
      console.error("Error fetching all blogs for 'Other posts':", error);
    }
  }

  renderMainBlog(blog);
  renderPopularPosts(blogsForPopularPosts, slug);
});