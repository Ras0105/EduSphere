/* ==========================================================
   UNIVERSITY MANAGEMENT SYSTEM — register.js (Preserved Logic)
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("nav");
    const profileImage = document.getElementById("profileImage");
    const previewImage = document.getElementById("previewImage");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm_password");
    const togglePassword = document.getElementById("togglePassword");
    const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
    const strengthBar = document.getElementById("strengthBar");
    const strengthText = document.getElementById("strengthText");
    const emailInput = document.getElementById("email");
    const mobileInput = document.getElementById("mobile");
    const registerForm = document.querySelector("form");
    const fullNameInput = document.getElementById("full_name");
    const successMessage = document.getElementById("successMessage");
    const allInputs = document.querySelectorAll("input, textarea, select");

    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    // Menu toggle logic
    if (menuToggle && navigation) {
        menuToggle.addEventListener("click", () => navigation.classList.toggle("active"));
    }

    // Avatar configuration
    if (profileImage && previewImage) {
        profileImage.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => previewImage.src = ev.target.result;
                reader.readAsDataURL(file);
            }
        });
    }

    // Toggle Show Passwords
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            const isPass = passwordInput.type === "password";
            passwordInput.type = isPass ? "text" : "password";
            togglePassword.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
        });
    }

    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener("click", () => {
            const isPass = confirmPasswordInput.type === "password";
            confirmPasswordInput.type = isPass ? "text" : "password";
            toggleConfirmPassword.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
        });
    }

    // Strength check rules
    if (passwordInput) {
        passwordInput.addEventListener("keyup", () => {
            const pass = passwordInput.value;
            let strength = 0;

            if (pass.length >= 8) strength++;
            if (/[A-Z]/.test(pass)) strength++;
            if (/[a-z]/.test(pass)) strength++;
            if (/[0-9]/.test(pass)) strength++;
            if (/[@$!%*?&]/.test(pass)) strength++;

            if (!strengthBar || !strengthText) return;

            switch (strength) {
                case 0:
                case 1:
                    strengthBar.style.width = "25%";
                    strengthBar.style.background = "#ef4444";
                    strengthText.innerHTML = "Weak Password 🔴";
                    break;
                case 2:
                case 3:
                    strengthBar.style.width = "60%";
                    strengthBar.style.background = "#f59e0b";
                    strengthText.innerHTML = "Medium Password 🟡";
                    break;
                case 4:
                case 5:
                    strengthBar.style.width = "100%";
                    strengthBar.style.background = "#10b981";
                    strengthText.innerHTML = "Strong Security Level 🟢";
                    break;
            }
        });

        passwordInput.addEventListener("keyup", (e) => {
            if (e.getModifierState("CapsLock") && strengthText) {
                strengthText.innerHTML = "⚠ Caps Lock is Active";
            }
        });
    }

    // Individual standard inline validation bindings
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener("keyup", () => {
            if (confirmPasswordInput.value === "") {
                confirmPasswordInput.classList.remove("input-success", "input-error");
                return;
            }
            if (passwordInput.value === confirmPasswordInput.value) {
                confirmPasswordInput.classList.remove("input-error");
                confirmPasswordInput.classList.add("input-success");
            } else {
                confirmPasswordInput.classList.remove("input-success");
                confirmPasswordInput.classList.add("input-error");
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener("keyup", () => {
            if (emailInput.value === "") {
                emailInput.classList.remove("input-success", "input-error");
                return;
            }
            if (emailPattern.test(emailInput.value)) {
                emailInput.classList.remove("input-error");
                emailInput.classList.add("input-success");
            } else {
                emailInput.classList.remove("input-success");
                emailInput.classList.add("input-error");
            }
        });
        emailInput.addEventListener("keypress", (e) => { if (e.key === " ") e.preventDefault(); });
    }

    if (mobileInput) {
        mobileInput.addEventListener("input", () => {
            mobileInput.value = mobileInput.value.replace(/\D/g, "");
            if (mobileInput.value.length === 10) {
                mobileInput.classList.remove("input-error");
                mobileInput.classList.add("input-success");
            } else {
                mobileInput.classList.remove("input-success");
                mobileInput.classList.add("input-error");
            }
        });
        mobileInput.addEventListener("keypress", (e) => { if (mobileInput.value.length >= 10) e.preventDefault(); });
    }

    // Submit intercepts execution pipeline safely
    if (registerForm) {
        registerForm.addEventListener("submit", (event) => {
            let valid = true;

            if (fullNameInput.value.trim() === "") { fullNameInput.classList.add("input-error"); valid = false; }
            if (!emailPattern.test(emailInput.value)) { emailInput.classList.add("input-error"); valid = false; }
            if (passwordInput.value.length < 8) { passwordInput.classList.add("input-error"); valid = false; }
            if (passwordInput.value !== confirmPasswordInput.value) { confirmPasswordInput.classList.add("input-error"); valid = false; }
            if (mobileInput.value.length !== 10) { mobileInput.classList.add("input-error"); valid = false; }

            if (!valid) {
                event.preventDefault();
                return;
            }

        
        });
    }

    allInputs.forEach(item => {
        item.addEventListener("input", () => item.classList.remove("input-error"));
    });
});