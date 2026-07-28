const videoInput = document.getElementById("videoInput");
const button = document.querySelector("button");
const fileInfo = document.getElementById("fileInfo");
const downloadLink = document.getElementById("downloadLink");

let selectedFile = null;


// Video ရွေးတဲ့အခါ
videoInput.addEventListener("change", () => {

    selectedFile = videoInput.files[0];

    if (selectedFile) {

        fileInfo.innerHTML =
        `
        File: ${selectedFile.name}<br>
        Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB
        `;

    }

});


// Compress Button
button.addEventListener("click", async () => {

    if (!selectedFile) {

        alert("Please select a video first");
        return;

    }


    const formData = new FormData();

    formData.append("video", selectedFile);


    button.innerText = "Uploading...";


    try {

        const response = await fetch("http://localhost:3000/upload", {

            method: "POST",
            body: formData

        });


        const result = await response.json();


        alert(result.message);


        if (result.file) {

            downloadLink.href = result.file;
            downloadLink.download = "compressed.mp4";
            downloadLink.style.display = "block";
            downloadLink.innerHTML = "Download Compressed Video";

        }


        button.innerText = "Compress Video";


    } catch (error) {

        console.log(error);

        alert("Something went wrong");

        button.innerText = "Compress Video";

    }


});