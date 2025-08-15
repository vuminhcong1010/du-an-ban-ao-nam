<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container hero-content">
        <h1>Just landed.</h1>
        <h2>The New Year Collection</h2>
        <p>Our latest collection is here. Discover the latest trends and styles for the new year.</p>
        <button class="shop-now-btn">Shop now</button>
      </div>
      <div class="hero-image">
        <img :src="heroBgImage" alt="New Year Collection" />
      </div>
    </section>


    <section class="brand-logos">
      <div class="container logos-grid">
        <img :src="logo1" alt="Logo 1" />
        <img :src="logo2" alt="Logo 2" />
        <img :src="logo3" alt="Logo 3" />
        <img :src="logo4" alt="Logo 4" />
        <img :src="logo5" alt="Logo 5" />
        <img :src="logo6" alt="Logo 6" />
      </div>
    </section>


    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">Shop by Category</h2>
        <div class="categories-grid">
          <div v-for="category in categories" :key="category.name" class="category-card">
            <img :src="category.image" :alt="category.name" class="category-image" />
            <h3 class="category-name">{{ category.name }}</h3>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>


<script setup>
import { onMounted } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';


// --- IMPORT HÌNH ẢNH SỬ DỤNG CÚ PHÁP ES MODULES ---
// Đảm bảo các tệp ảnh này tồn tại trong thư mục src/assets/


// For Hero Section
import heroBgImage from '@/assets/anh1.jpg';


// For Brand Logos (using placeholders as in your code)
import logoPlaceholder1 from '@/assets/anh1.jpg';
import logoPlaceholder2 from '@/assets/anh1.jpg';
import logoPlaceholder3 from '@/assets/anh1.jpg';
import logoPlaceholder4 from '@/assets/anh1.jpg';
import logoPlaceholder5 from '@/assets/anh1.jpg';
import logoPlaceholder6 from '@/assets/logo.png'; // Assuming this is your actual logo


// For Product Categories (using placeholders as in your code)
import clothingImage from '@/assets/anh1.jpg';
import tshirtsImage from '@/assets/anh2.jpg';
import hoodiesImage from '@/assets/anh1.jpg';
import musicImage from '@/assets/anh2.jpg';
import albumsImage from '@/assets/anh1.jpg';
import postersImage from '@/assets/anh2.jpg';
import accessoriesImage from '@/assets/anh1.jpg';
import decorImage from '@/assets/anh2.jpg';


// --- Reactive Variables / Constants (using ref() if mutable, else plain const) ---
// Assign imported images to constants for use in template




const logo1 = logoPlaceholder1;
const logo2 = logoPlaceholder2;
const logo3 = logoPlaceholder3;
const logo4 = logoPlaceholder4;
const logo5 = logoPlaceholder5;
const logo6 = logoPlaceholder6;


const categories = [
  { name: 'Clothing', image: clothingImage },
  { name: 'T-Shirts', image: tshirtsImage },
  { name: 'Hoodies', image: hoodiesImage },
  { name: 'Music', image: musicImage },
  { name: 'Albums', image: albumsImage },
  { name: 'Posters', image: postersImage },
  { name: 'Accessories', image: accessoriesImage },
  { name: 'Decor', image: decorImage },
];


// --- User Data Fetching Logic ---
onMounted(async () => {
  // Try to get email from localStorage first, as it's more common for user data after login
  // If your login flow sets 'email' in a cookie, it's fine.
  const loggedInUser = localStorage.getItem('loggedInUser');
  let userEmail = null;


  if (loggedInUser) {
    try {
      const userData = JSON.parse(loggedInUser);
      // Assuming your loggedInUser object has an 'email' property
      if (userData && userData.email) {
        userEmail = userData.email;
      }
    } catch (e) {
      console.error("Failed to parse loggedInUser from localStorage:", e);
    }
  }


  // Fallback to cookie if localStorage doesn't have it or parsing failed
  if (!userEmail) {
    userEmail = Cookies.get('email'); // This cookie might not be consistently set by login
  }


  if (userEmail) {
    try {
      const response = await axios.get(`http://localhost:8080/find-by-email/${userEmail}`);
      if (response.data) {
        // Update both localStorage and cookie with fresh data
        localStorage.setItem("loggedInUser", JSON.stringify(response.data));
        Cookies.set("thongTinKhachHang", JSON.stringify(response.data), { expires: 0.3 }); // Adjust expiry as needed
        console.log("Updated user information:", response.data);
      } else {
        console.warn("API returned no data for email:", userEmail);
      }
    } catch (err) {
      console.error('Error calling API /find-by-email:', err);
      // Handle specific error types, e.g., if user not found (404)
      if (err.response && err.response.status === 404) {
        console.log(`User with email ${userEmail} not found on backend.`);
        // Optionally, clear local user data if they don't exist on backend anymore
        // localStorage.removeItem('loggedInUser');
        // Cookies.remove('thongTinKhachHang');
      }
    }
  } else {
    console.log("No user email found in localStorage or cookies to fetch info.");
  }
});
</script>


<style scoped>
/* --- Global Container --- */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}


/* --- Home Page Layout --- */
.home-page {
  /* No need for padding top/bottom here as layout elements manage their own spacing */
}


/* --- Hero Section --- */
.hero-section {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f7f7f7; /* Light background for the hero section */
  padding: 60px 0; /* Top and bottom padding */
  min-height: 450px; /* Minimum height */
  overflow: hidden; /* Ensure background image doesn't overflow */
}


.hero-content {
  flex: 1;
  max-width: 500px;
  z-index: 1; /* Ensure content is above the background image */
  text-align: left;
}


.hero-content h1 {
  font-size: 3.5em;
  color: #333;
  margin-bottom: 10px;
  font-weight: 800;
}


.hero-content h2 {
  font-size: 2.5em;
  color: #555;
  margin-bottom: 20px;
  font-weight: 600;
}


.hero-content p {
  font-size: 1.1em;
  color: #777;
  line-height: 1.6;
  margin-bottom: 30px;
}


.shop-now-btn {
  background-color: #007bff;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}


.shop-now-btn:hover {
  background-color: #0056b3;
}


.hero-image {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 55%; /* Occupies 55% of the right width */
  display: flex;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
}


.hero-image img {
  height: 100%;
  width: auto;
  object-fit: cover;
  object-position: right center; /* Align image to the right */
}


/* --- Brand Logos Section --- */
.brand-logos {
  padding: 40px 0;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}


.logos-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap; /* Allows wrapping on smaller screens */
  gap: 30px; /* Space between logos */
}


.logos-grid img {
  max-height: 40px;
  filter: grayscale(100%); /* Grayscale effect */
  opacity: 0.6;
  transition: opacity 0.3s ease, filter 0.3s ease;
}


.logos-grid img:hover {
  filter: grayscale(0%);
  opacity: 1;
}


/* --- Categories Section --- */
.categories-section {
  padding: 60px 0;
  background-color: #f7f7f7;
}


.section-title {
  text-align: center;
  font-size: 2.2em;
  color: #333;
  margin-bottom: 40px;
  font-weight: bold;
}


.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  justify-content: center;
}


.category-card {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}


.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}


.category-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}


.category-name {
  font-size: 1.4em;
  color: #333;
  margin: 15px 0 20px;
  font-weight: 600;
}


/* --- Responsive Adjustments --- */
@media (max-width: 1200px) {
  .hero-content {
    max-width: 450px;
  }
}


@media (max-width: 992px) {
  .hero-section {
    flex-direction: column; /* Stack vertically */
    padding: 40px 0;
    min-height: auto;
  }
  .hero-content {
    max-width: 90%;
    text-align: center;
    margin-bottom: 30px;
  }
  .hero-image {
    position: relative;
    width: 100%;
    height: 300px; /* Fixed height for image on mobile */
    justify-content: center;
  }
  .hero-image img {
    width: 100%;
    height: 100%;
    object-position: center;
  }


  .section-title {
    font-size: 2em;
  }
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}


@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.8em;
  }
  .hero-content h2 {
    font-size: 2em;
  }
  .hero-content p {
    font-size: 1em;
  }
  .shop-now-btn {
    padding: 12px 25px;
    font-size: 1em;
  }


  .section-title {
    font-size: 1.8em;
    margin-bottom: 30px;
  }
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  .category-image {
    height: 200px;
  }
  .category-name {
    font-size: 1.2em;
    margin: 10px 0 15px;
  }
  .logos-grid {
    gap: 20px;
  }
}


@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 2.2em;
  }
  .hero-content h2 {
    font-size: 1.6em;
  }
  .hero-image {
    height: 250px;
  }


  .section-title {
    font-size: 1.5em;
    margin-bottom: 25px;
  }
  .categories-grid {
    grid-template-columns: 1fr; /* Single column on smaller screens */
    gap: 15px;
  }
  .category-image {
    height: 180px;
  }
}
</style>



