// function fetchSheetData() {
//     const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkqHZfzCeEXw4JRN9UdW01pMkE_eJSW-lE2vqkpFfc5_5-2bGqJ8Wrcjp0hEyCdqvLY9azZqzigqId/pub?output=csv";

//     fetch(sheetURL)
//         .then(response => response.text()) // Get CSV text
//         .then(csvText => {
//             let rows = csvText.split("\n").map(row => row.split(",")); // Split into rows and columns

//             let table = "<table border='1'>";
//             rows.forEach((row, index) => {
//                 table += index === 0 ? "<tr><th>" : "<tr><td>"; // Header for first row
//                 table += row.join(index === 0 ? "</th><th>" : "</td><td>"); // Join cells
//                 table += index === 0 ? "</th></tr>" : "</td></tr>";
//             });
//             table += "</table>";

//             document.getElementById("profile-data").innerHTML = table; // Show data in table
//         })
//         .catch(error => console.error("Error fetching data:", error));
// }


        function fetchSheetData() {
            const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkqHZfzCeEXw4JRN9UdW01pMkE_eJSW-lE2vqkpFfc5_5-2bGqJ8Wrcjp0hEyCdqvLY9azZqzigqId/pub?output=csv";

            // Get logged-in student's register number from localStorage
            const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
            if (!loggedInUser || !loggedInUser.registerNumber) {
                document.getElementById("profile-data").innerHTML = "No student logged in.";
                return;
            }
            const studentRegNo = loggedInUser.registerNumber;

            fetch(sheetURL)
                .then(response => response.text())
                .then(csvText => {
                    let rows = csvText.split("\n").map(row => row.split(","));
                    let headers = rows[0]; // Extract headers
                    let studentRecords = rows.filter(row => row[1] === studentRegNo); // Filter by Register Number

                    if (studentRecords.length === 0) {
                        document.getElementById("profile-data").innerHTML = "No records found for your Register Number.";
                        return;
                    }

                    // Build table
                    let table = "<table border='1'><tr><th>" + headers.join("</th><th>") + "</th></tr>";
                    studentRecords.forEach(row => {
                        table += "<tr><td>" + row.join("</td><td>") + "</td></tr>";
                    });
                    table += "</table>";

                    document.getElementById("profile-data").innerHTML = table;
                })
                .catch(error => console.error("Error fetching data:", error));
        }

