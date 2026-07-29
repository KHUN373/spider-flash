const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");

const app = express();

app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

// Static files
app.use(express.static(__dirname));

// Upload folder
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 500 * 1024 * 1024
    }
});


// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// Upload + Compress
app.post("/upload", upload.single("video"), (req, res) => {

    console.log("Upload started");

    if (!req.file) {
        return res.json({
            message: "No video uploaded"
        });
    }

    const input = req.file.path;
    const output = "compressed.mp4";


    ffmpeg(input)
        .outputOptions([
            "-c:v libx264",
            "-crf 28",
            "-preset fast",
            "-c:a aac"
        ])
        .save(output)

        .on("end", () => {

            console.log("Compression complete");

            res.json({
                message: "Compression Complete!",
                file: "/compressed.mp4"
            });

        })

        .on("error", (err) => {

            console.log(err);

            res.status(500).json({
                message: "Compression failed"
            });

        });

});


// Download compressed file
app.get("/compressed.mp4", (req, res) => {

    res.download(
        path.join(__dirname, "compressed.mp4")
    );

});


// Render port
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});


server.timeout = 10 * 60 * 1000;