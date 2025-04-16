import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC-Ml4IeQVIBdfj-iLm3RgeEtOaqkJWpMQ",
    authDomain: "yunexa-763ea.firebaseapp.com",
    projectId: "yunexa-763ea",
    storageBucket: "yunexa-763ea.firebasestorage.app",
    messagingSenderId: "906380286164",
    appId: "1:906380286164:web:5ae4ba57b134a18d58c341",
    measurementId: "G-CFSD0B49S8"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


document.addEventListener("DOMContentLoaded", () => {
    const googleBtn = document.getElementById("google-btn");
    const loginBtn = document.getElementById("login-btn");
    const userProfile = document.getElementById("user-profile");
    const userImg = document.getElementById("user-img");

  
    if (googleBtn) {
        googleBtn.addEventListener("click", async () => {
            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                console.log("User Info:", user);
                updateUI(user);
                alert(`Welcome ${user.displayName}`);
                window.location.href = "/"; 
            } catch (error) {
                console.error("Login Error:", error);
                alert("Google sign-in failed ");
            }
        });
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateUI(user);
        }
    });

    function updateUI(user) {
        if (loginBtn) loginBtn.style.display = "none";
        if (userProfile) userProfile.classList.remove("hidden");

        if (userImg) {
            userImg.src = user.photoURL || "default-avatar.png";
            userImg.alt = `${user.displayName || "User"}'s profile picture`;
        }
    }
});
