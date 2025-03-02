// Toggle Hamburger Menu and Change Icon
function toggleMenu() {
    var sidebar = document.getElementById("sidebar");
    var hamburger = document.querySelector(".hamburger");

    sidebar.classList.toggle("active"); // Toggle menu visibility

    // Change ☰ to ✖ when open
    if (sidebar.classList.contains("active")) {
        hamburger.innerHTML = "✖"; 
    } else {
        hamburger.innerHTML = "☰";
    }
}

// Close the menu when clicking outside or clicking a link inside it
document.addEventListener("click", function(event) {
    var sidebar = document.getElementById("sidebar");
    var hamburger = document.querySelector(".hamburger");

    if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
        sidebar.classList.remove("active");
        hamburger.innerHTML = "☰"; // Reset icon
    }
});

// Ensure menu closes when clicking a link inside it
document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", () => {
        document.getElementById("sidebar").classList.remove("active");
        document.querySelector(".hamburger").innerHTML = "☰";
    });
});

// Form Validation for Krea Email
document.addEventListener("DOMContentLoaded", function () {
    var signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var emailInput = document.getElementById("email");
            var email = emailInput.value;
            var errorMsg = document.getElementById("error-message");

            if (!(email.endsWith("@krea.edu.in") || email.endsWith("@krea.ac.in"))) {
                errorMsg.textContent = "Please use a valid Krea email (example@krea.edu.in)";
                errorMsg.style.color = "red";
                emailInput.style.border = "2px solid red";
            } else {
                errorMsg.textContent = "";
                emailInput.style.border = "2px solid green";
                alert("✅ Signup successful! Welcome to the Cyber Club.");
                emailInput.value = "";
            }
        });
    }
});

// Dark Mode Toggle
document.addEventListener("DOMContentLoaded", function () {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;

    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
        darkModeToggle.innerHTML = "☀ Light Mode";
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", function () {
            body.classList.toggle("dark-mode");
            localStorage.setItem("darkMode", body.classList.contains("dark-mode") ? "enabled" : "disabled");
            darkModeToggle.innerHTML = body.classList.contains("dark-mode") ? "☀ Light Mode" : "🌙 Dark Mode";
        });
    }
});

// Hero Text Animation (Hacker Effect)
function hackerEffect(text, element, speed = 50) {
    if (!element) return;
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";
    let iterations = 0;
    let interval = setInterval(() => {
        element.innerText = text
            .split("")
            .map((letter, index) => {
                if (index < iterations) return text[index];
                return characters[Math.floor(Math.random() * characters.length)];
            })
            .join("");
        if (iterations >= text.length) clearInterval(interval);
        iterations += 1 / 3;
    }, speed);
}

document.addEventListener("DOMContentLoaded", function () {
    const heroHeading = document.getElementById("hero-heading");
    if (heroHeading) {
        hackerEffect("Welcome to the Cyber Club", heroHeading);
    }
});

// Back to Top Button
window.onscroll = function () {
    var button = document.getElementById("backToTop");
    if (button) {
        button.style.display = document.documentElement.scrollTop > 100 ? "block" : "none";
    }
};

document.addEventListener("DOMContentLoaded", function () {
    var backToTopBtn = document.getElementById("backToTop");
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});
