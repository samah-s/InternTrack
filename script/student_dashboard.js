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


function uploadBonafideLetter() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const fileInput = document.getElementById("bonafideLetter");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append("bonafideLetter", file);

    // Add form details for verification
    const fields = ["title", "company", "mobile", "startDate", "endDate", "placement", "stipend", "industry", "location"];
    fields.forEach(field => {
        formData.append(field, document.getElementById(field).value);
    });

    // Step 1: Verify document details
    fetch("http://localhost:5001/verify", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Verification passed: " + JSON.stringify(data.mismatches) + data.message);
            console.log("Verification passed, proceeding to upload.");
            uploadToGoogleDrive(file, user.registerNumber);
        } else {
            alert("Verification failed: " + JSON.stringify(data.mismatches) + data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}



async function uploadToGoogleDrive(file, registerNumber) {
    const formData = new FormData();
    formData.append("bonafideLetter", file);
    formData.append("registerNumber", registerNumber);

    await fetch("http://127.0.0.1:5000/uploadBonafide", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json/pdf" },
        mode: "cors"
    })
    .then(response => response.json())
    .then(data => alert("Upload successful! File ID: " + data.fileId))
    .catch(error => console.error("Upload error:", error));
}


