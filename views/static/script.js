function toggleMenu() {
    var menu = document.getElementById("menu"); // Get the menu
    menu.classList.toggle("active"); // Add or remove "active" class
}

// Close the menu when clicking outside of it
document.addEventListener("click", function(event) {
    var menu = document.getElementById("menu");
    var menuToggle = document.querySelector(".menu-toggle");

    if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
        menu.classList.remove("active"); // Close the menu
    }
});

// Form Validation for Krea Email
document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent page reload

    var emailInput = document.getElementById("email");
    var email = emailInput.value;
    var errorMsg = document.getElementById("error-message");

    if (!(email.endsWith("@krea.edu.in") || email.endsWith("@krea.ac.in"))) {
        errorMsg.textContent = "Please use a valid Krea email (example@krea.edu.in)";
        errorMsg.style.color = "red";
    } else {
        alert("Signup successful!"); // Replace with actual signup logic
        errorMsg.textContent = ""; // Clear error message
        emailInput.value = ""; // Clear input field
    }
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

// Check if Dark Mode was previously enabled
if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
}

// Toggle Dark Mode
darkModeToggle.addEventListener("click", function () {
    body.classList.toggle("dark-mode");

    // Save user preference
    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
});
