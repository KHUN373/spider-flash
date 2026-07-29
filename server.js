const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const app = express();


// Timeout Setting
app.use(express.json());

app.use((req, res, next) => {
    req.setTimeout(10 * 60 * 1000);
    next();
});


// Upload Setting
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 500 * 1024 * 1024
    }
});


app.use(express.static("."));


// Upload + Compress
app.post("/upload", upload.single("video"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "No video selected"
        });
    }


    const inputPath = req.file.path;
    const outputPath = "compressed/" + req.file.filename + ".mp4";


    console.log("Video uploaded:");
    console.log(req.file);



    ffmpeg.ffprobe(inputPath, (err, metadata) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Video read error"
            });

        }


        const duration = metadata.format.duration;


        // Target 50MB
        const targetSize = 50 * 1024 * 1024;


        const totalBitrate = Math.floor(
            (targetSize * 8) / duration / 1000
        );


        const audioBitrate = 128;
        const videoBitrate = totalBitrate - audioBitrate;



        console.log(
            "Video bitrate:",
            videoBitrate + "k"
        );



        ffmpeg(inputPath)

            .videoCodec("libx264")

            .videoBitrate(videoBitrate + "k")

            .audioCodec("aac")

            .audioBitrate("128k")

            .outputOptions([
                "-preset fast",
                "-movflags +faststart"
            ])


            .save(outputPath)



            .on("progress", (progress) => {

                console.log(
                    "Processing:",
                    progress.percent
                );

            })


            .on("end", () => {


                console.log(
                    "Compression Complete"
                );


                fs.unlinkSync(inputPath);


                res.json({

                    message:
                    "50MB Compression Complete",

                    file:
                    outputPath

                });


            })



            .on("error", (error) => {


                console.log(error);


                res.status(500).json({

                    message:
                    "Compression Failed"

                });


            });



    });


});



// Server Start
const server = app.listen(3000, () => {

    console.log(
        "Server running on port 3000"
    );

});


server.timeout = 10 * 60 * 1000;