const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkqHZfzCeEXw4JRN9UdW01pMkE_eJSW-lE2vqkpFfc5_5-2bGqJ8Wrcjp0hEyCdqvLY9azZqzigqId/pub?output=csv";
let tableData = [];
let currentIndex = 1; // Skip header row

// Fetch Data from Google Sheets
function fetchSheetData() {
    fetch(sheetURL)
        .then(response => response.text())
        .then(csvText => {
            let rows = csvText.split("\n").map(row => row.split(","));
            tableData = rows;
            renderTable(rows);
            showRecord(currentIndex);
        })
        .catch(error => console.error("Error fetching data:", error));
}

// Render Table
function renderTable(data) {
    let table = "<table><tr>";
    table += data[0].map(header => `<th onclick="sortTable('${header}')">${header}</th>`).join("");
    table += "</tr>";

    for (let i = 1; i < data.length; i++) {
        table += "<tr><td>" + data[i].join("</td><td>") + "</td></tr>";
    }
    table += "</table>";

    document.getElementById("profile-data").innerHTML = table;
}

// Filter Table
function filterTable() {
    let searchText = document.getElementById("search").value.toLowerCase();
    let filteredData = tableData.filter(row => row.join(" ").toLowerCase().includes(searchText));
    renderTable([tableData[0], ...filteredData]); // Include header
}

// Sort Table
function sortTable(columnName) {
    let columnIndex = tableData[0].indexOf(columnName);
    if (columnIndex === -1) return;

    let sortedData = [...tableData.slice(1)].sort((a, b) => a[columnIndex].localeCompare(b[columnIndex]));
    renderTable([tableData[0], ...sortedData]);
}

// Show Individual Record
function showRecord(index) {
    if (index >= tableData.length || index < 1) return;

    let record = tableData[index];
    let details = "<h3>Student Details</h3><p><strong>Name:</strong> " + record[0] + "</p>";
    details += "<p><strong>Internship:</strong> " + record[1] + "</p>";
    document.getElementById("record-view").innerHTML = details;
}

// Next/Previous Navigation
function nextRecord() {
    if (currentIndex < tableData.length - 1) {
        currentIndex++;
        showRecord(currentIndex);
    }
}

function prevRecord() {
    if (currentIndex > 1) {
        currentIndex--;
        showRecord(currentIndex);
    }
}

// Edit Student Data
function saveEdit() {
    let newName = document.getElementById("edit-name").value;
    let newInternship = document.getElementById("edit-internship").value;
    
    if (newName && newInternship && currentIndex > 0) {
        tableData[currentIndex][0] = newName;
        tableData[currentIndex][1] = newInternship;
        renderTable(tableData);
        showRecord(currentIndex);
    }
}

// Load Data on Page Load
fetchSheetData();
