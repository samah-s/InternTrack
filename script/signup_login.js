// Signup Logic
document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");

    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const name = document.getElementById("name").value;
            const registerNumber = document.getElementById("registerNumber").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;

            let users = JSON.parse(localStorage.getItem("users")) || [];
            const existingUser = users.find(user => user.email === email);

            if (existingUser) {
                alert("User already exists. Please log in.");
                return;
            }

            users.push({ name, registerNumber, email, password, role });
            localStorage.setItem("users", JSON.stringify(users));

            alert("Signup successful! Please log in.");
            window.location.href = "login.html";
        });
    }

    // Login Logic
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            // Fetch users from the JSON file
            const response = await fetch("../data/users.json");
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const users = await response.json();

            // Check if user exists
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
                localStorage.setItem("loggedInUser", JSON.stringify(user));
                alert("Login successful!");

                // Redirect based on role
                if (user.role === "student") {
                    window.location.href = "../pages/student_dashboard.html";
                } else if (user.role === "coordinator") {
                    window.location.href = "../pages/coordinator_dashboard.html";
                }
            } else {
                alert("Invalid email or password. Please try again.");
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            alert("An error occurred while logging in. Please try again.");
        }
    });
}

});
