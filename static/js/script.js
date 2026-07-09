        const menuToggle = document.getElementById("menuToggle");
        const navMenu = document.getElementById("navMenu");

        menuToggle.onclick = function() {
            navMenu.classList.toggle("active");
        };

        // Smooth header blur interaction shift on down-scroll events
        window.addEventListener("scroll", () => {
            const header = document.getElementById("header");
            if (window.scrollY > 50) {
                header.style.background = "rgba(11, 15, 25, 0.85)";
            } else {
                header.style.background = "rgba(15, 23, 42, 0.65)";
            }
        });