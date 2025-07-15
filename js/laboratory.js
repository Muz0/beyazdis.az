/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 */
const API_BASE = "https://faodhpwvhonpyxlughls.supabase.co/rest/v1";
// !! IMPORTANT: Replace with your actual Supabase 'anon' public key !!
const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb2RocHd2aG9ucHl4bHVnaGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTI5MTEsImV4cCI6MjA2NDI2ODkxMX0.2yXQKif90Arr1yjVohA8PXj1zJ4Kxn3tj8aJtae3yic"; // This key is from your previous provided code. Verify it's your actual 'anon' public key.
const TABLE_NAME = "cover_images"; // Corrected table name

// ─────────────────────────────────────────────────────────────────────────────
//  Headers for Supabase REST calls
// ─────────────────────────────────────────────────────────────────────────────
const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ─────────────────────────────────────────────────────────────────────────────
//  1) Fetch fresh data from Supabase
// ─────────────────────────────────────────────────────────────────────────────
async function fetchCoverImagesData() {
  const url = `${API_BASE}/${TABLE_NAME}?select=category,image_url`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch cover images data (${response.status}): ${errorText}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  2) Populate the HTML with fetched data
// ─────────────────────────────────────────────────────────────────────────────
async function populateGalleryCoverImages() {
  try {
    const coverImagesData = await fetchCoverImagesData();
    console.log("Fetched data from Supabase:", coverImagesData);

    const imageUrlsByCategory = {};
    coverImagesData.forEach((item) => {
      if (item.category && item.image_url) {
        imageUrlsByCategory[item.category] = item.image_url;
      }
    });
    console.log("Mapped Image URLs by category:", imageUrlsByCategory);

    // Select the image elements using their new IDs
    const photoCardImg = document.getElementById("gallery-photo-img");
    const videoCardImg = document.getElementById("gallery-video-img");
    const certificateCardImg = document.getElementById(
      "gallery-certificate-img"
    );

    // Update the src attribute for Card #1 (Images)
    if (photoCardImg && imageUrlsByCategory.image) {
      photoCardImg.src = imageUrlsByCategory.image;
      photoCardImg.alt = "Laboratoriya Şəkilləri";
      console.log("Updated photo card image:", photoCardImg.src);
    } else {
      console.warn(
        "Could not update photo card. Element found:",
        !!photoCardImg,
        "Image URL for 'image' category available:",
        !!imageUrlsByCategory.image
      );
    }

    // Update the src attribute for Card #2 (Videos)
    if (videoCardImg && imageUrlsByCategory.video) {
      videoCardImg.src = imageUrlsByCategory.video;
      videoCardImg.alt = "Laboratoriya Videoları";
      console.log("Updated video card image:", videoCardImg.src);
    } else {
      console.warn(
        "Could not update video card. Element found:",
        !!videoCardImg,
        "Image URL for 'video' category available:",
        !!imageUrlsByCategory.video
      );
    }

    // Update the src attribute for Card #3 (Certificates/PDFs)
    if (certificateCardImg && imageUrlsByCategory.pdf) {
      certificateCardImg.src = imageUrlsByCategory.pdf;
      certificateCardImg.alt = "Laboratoriya Sertifikatları";
      console.log("Updated certificate card image:", certificateCardImg.src);
    } else {
      console.warn(
        "Could not update certificate card. Element found:",
        !!certificateCardImg,
        "Image URL for 'pdf' category available:",
        !!imageUrlsByCategory.pdf
      );
    }
  } catch (error) {
    console.error("Error populating gallery cover images:", error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Execute the populate function when the DOM is fully loaded
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", populateGalleryCoverImages);
