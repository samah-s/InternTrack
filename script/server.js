const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();

// ✅ CORS Configuration (Allow frontend requests)
app.use(cors({
    origin: "*",  // Allow all origins (set specific origin in production)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"]
}));

// ✅ Handle preflight requests
app.options("*", (req, res) => {
    console.log("Handling OPTIONS request for:", req.path);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
    return res.sendStatus(204); // No Content
});

// ✅ Google Drive Setup
const KEYFILE_PATH = "data/ip-student-internship-key.json";  // Make sure this path is correct
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

// ✅ Multer Setup (Temp Storage)
const upload = multer({ dest: "uploads/" });

// ✅ Upload Route
app.post("/uploadBonafide", upload.single("bonafideLetter"), async (req, res) => {
    console.log("Received POST request to /uploadBonafide"); // Debugging: Prints to terminal
    res.setHeader("Access-Control-Allow-Origin", "*"); // Ensure CORS headers are set

    try {
        // Check if the file and register number are provided
        if (!req.body.registerNumber) {
            console.log("No register number provided");
            return res.status(400).json({ error: "No register number provided" });
        }

        if (!req.file) {
            console.log("No file uploaded");
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("Register Number:", req.body.registerNumber);
        console.log("Uploaded file:", req.file); // Debugging: Prints file info to terminal

        // ✅ Google Drive Upload Logic
        const filePath = req.file.path;
        const fileMetadata = {
            name: `${req.body.registerNumber}_${req.file.originalname}`,
            parents: ["0ABEzpEgfWkfaUk9PVA"],  // Update this with the correct folder ID
        };

        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(filePath),
        };

        // Wait for the file to upload to Google Drive
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id",
            supportsAllDrives: true, // ✅ Required for Shared Drive
        });

        console.log("File uploaded to Google Drive with ID:", file.data.id);  // Debugging: Prints uploaded file ID to terminal

        // fs.unlinkSync(filePath); // Delete temp file after upload
        // console.log("Temp file deleted after upload");

        res.json({
            success: true,
            message: "File uploaded successfully to Google Drive!",
            fileId: file.data.id,
        });

    } catch (error) {
        console.error("Upload Error:", error);  // Prints error to terminal if something goes wrong
        res.status(500).json({ error: error.message });
    }
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  // Prints this to terminal when server starts
