const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzL_FMAlmv0bo9YmatuNiC3IgJvepGlIMcyrYCSPd4fazot78e5sWMrRkW3ehu7hite/exec";

document.addEventListener("DOMContentLoaded", function () {
    const internshipForm = document.getElementById("internship-form");
    const messageBox = document.getElementById("message-box");
    const profileData = document.getElementById("profile-data");
    const loadingIndicator = document.getElementById("loading");

    if (internshipForm) {
        internshipForm.addEventListener("submit", function (event) {
            event.preventDefault();
            messageBox.innerHTML = ""; // Clear previous messages

            const user = JSON.parse(localStorage.getItem("loggedInUser"));
            if (!user) {
                showMessage("User not logged in!", "error");
                return;
            }

            const mobile = document.getElementById("mobile").value;
            const stipend = document.getElementById("stipend").value;

            // Mobile number validation
            if (!/^\d{10}$/.test(mobile)) {
                showMessage("Invalid mobile number. Enter a 10-digit number.", "error");
                return;
            }

            // Stipend validation (optional, but must be a valid number if entered)
            if (stipend && (!/^\d+$/.test(stipend) || parseInt(stipend) < 0)) {
                showMessage("Invalid stipend amount. Enter a positive number.", "error");
                return;
            }

            const formData = {
                registerNumber: user.registerNumber,
                name: user.name,
                title: document.getElementById("title").value,
                company: document.getElementById("company").value,
                mobile: mobile,
                startDate: document.getElementById("startDate").value,
                endDate: document.getElementById("endDate").value,
                placement: document.getElementById("placement").value,
                stipend: stipend || "0",
                industry: document.getElementById("industry").value,
                location: document.getElementById("location").value,
                permissionLetter: document.getElementById("permissionLetter").value,
                completionCertificate: "No",
                internshipReport: "No",
                studentFeedback: "No",
                employerFeedback: "No"
            };

            fetch(GOOGLE_SHEET_WEB_APP_URL, {
                redirect: "follow",
                method: "POST",
                body: JSON.stringify(formData),
                headers: { "Content-Type": "application/json" }
            })
            .then(response => response.text())
            .then(data => {
                showMessage("Internship details submitted successfully!", "success");
                internshipForm.reset();
            })
            .catch(error => showMessage("Error submitting details. Try again!", "error"));
        });
    }
});

// function fetchStudentDetails() {
//     const user = JSON.parse(localStorage.getItem("loggedInUser"));
//     if (!user) {
//         showMessage("User not logged in!", "error");
//         return;
//     }

//     const loadingIndicator = document.getElementById("loading");
//     loadingIndicator.style.display = "block"; // Show loading indicator

//     fetch(`${GOOGLE_SHEET_WEB_APP_URL}?registerNumber=${user.registerNumber}`)
//         .then(response => response.json())
//         .then(data => {
//             loadingIndicator.style.display = "none"; // Hide loading

//             if (data === "Not Found") {
//                 profileData.innerHTML = "<p>No records found.</p>";
//             } else {
//                 profileData.innerHTML = `
//                     <p><strong>Register Number:</strong> ${data[1]}</p>
//                     <p><strong>Name:</strong> ${data[2]}</p>
//                     <p><strong>Title:</strong> ${data[3]}</p>
//                     <p><strong>Company:</strong> ${data[7]}</p>
//                     <p><strong>Start Date:</strong> ${data[5]}</p>
//                     <p><strong>End Date:</strong> ${data[6]}</p>
//                     <p><strong>Placement:</strong> ${data[8]}</p>
//                     <p><strong>Stipend:</strong> ${data[9]}</p>
//                     <p><strong>Research/Industry:</strong> ${data[10]}</p>
//                     <p><strong>Abroad/India:</strong> ${data[11]}</p>
//                 `;
//             }
//         })
//         .catch(error => {
//             loadingIndicator.style.display = "none"; // Hide loading
//             showMessage("Error fetching profile details. Try again!", "error");
//         });
// }

function fetchStudentDetails() {
    window.location.href = "../pages/profile.html"; // Redirect to the profile page
}


function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

// Show messages dynamically
function showMessage(message, type) {
    const messageBox = document.getElementById("message-box");
    messageBox.innerHTML = `<p class="${type}">${message}</p>`;
    setTimeout(() => { messageBox.innerHTML = ""; }, 4000); // Hide after 4 seconds
}
