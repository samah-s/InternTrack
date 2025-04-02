const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const KEYFILE_PATH = "data\\ip-student-internship-key.json";  // Update this
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

// ✅ Endpoint to fetch document by register number
app.get("/fetchBonafide/:registerNumber", async (req, res) => {
    const registerNumber = req.params.registerNumber.trim();
    console.log(`Fetching document for register number: '${registerNumber}' from Shared Drive`);

    try {
        const response = await drive.files.list({
            q: `name contains '${registerNumber}' and trashed = false`,
            fields: "files(id, name, webViewLink)",
            spaces: "drive",
            driveId: "0ABEzpEgfWkfaUk9PVA",  // ✅ Restrict search to this Shared Drive
            corpora: "drive",  // ✅ Required when searching inside a Shared Drive
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
        });

        console.log("Search results:", response.data.files);  // Debugging log

        if (response.data.files.length === 0) {
            return res.status(404).json({ error: `No document found for ${registerNumber}` });
        }

        const file = response.data.files[0];
        // res.json({ name: file.name, link: file.webViewLink });
        res.json({ name: file.name, fileId: file.id });


    } catch (error) {
        console.error("Google Drive API Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});


app.listen(5002, () => console.log("Server running on port 5002"));
