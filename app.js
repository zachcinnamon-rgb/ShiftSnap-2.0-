/*
==========================================
ShiftSnap
app.js
Version 0.2
==========================================
*/

const uploadButton = document.getElementById("uploadButton");
const imageInput = document.getElementById("imageInput");

const previewImage = document.getElementById("previewImage");
const processedCanvas = document.getElementById("processedCanvas");

const statusText = document.getElementById("statusText");

let processor;
let detector;

let cvReady = false;

/*----------------------------------
Wait for OpenCV
----------------------------------*/

function waitForOpenCV() {

    if (typeof cv === "undefined") {

        setTimeout(waitForOpenCV, 100);

        return;

    }

    if (cv.Mat) {

        cvReady = true;

        processor = new ImageProcessor();

        detector = new GridDetector();

        statusText.innerHTML = "Ready";

        console.log("OpenCV Ready");

        return;

    }

    setTimeout(waitForOpenCV, 100);

}

waitForOpenCV();

/*----------------------------------
Upload Button
----------------------------------*/

uploadButton.onclick = () => {

    imageInput.click();

};

/*----------------------------------
File Selected
----------------------------------*/

imageInput.onchange = (e) => {

    const file = e.target.files[0];

    if (!file)
        return;

    loadScreenshot(file);

};

/*----------------------------------
Drag and Drop
----------------------------------*/

document.body.addEventListener("dragover", (e) => {

    e.preventDefault();

});

document.body.addEventListener("drop", (e) => {

    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (!file)
        return;

    loadScreenshot(file);

});

/*----------------------------------
Main Pipeline
----------------------------------*/

async function loadScreenshot(file) {

    if (!cvReady) {

        alert("OpenCV is still loading.");

        return;

    }

    statusText.innerHTML = "Loading Screenshot...";

    previewImage.src = URL.createObjectURL(file);

    previewImage.style.display = "block";

    previewImage.onload = async () => {

        try {

            statusText.innerHTML = "Processing Image...";

            const src = await processor.load(file);

            const result = processor.process(src);

            statusText.innerHTML = "Finding Schedule...";

            const rect = detector.detect(result.processed);

            if (!rect) {

                statusText.innerHTML =
                    "Schedule Not Found";

                processor.cleanup(
                    src,
                    result.processed
                );

                return;

            }

            detector.drawRectangle(
                src,
                rect
            );

            cv.imshow(
                processedCanvas,
                src
            );

            const crop =
                detector.crop(
                    result.original,
                    rect
                );

            showCrop(crop);

            processor.cleanup(
                src,
                result.processed,
                crop
            );

            statusText.innerHTML =
                "Schedule Found ✓";

        }

        catch (err) {

            console.error(err);

            statusText.innerHTML =
                "Processing Failed";

        }

    };

}

/*----------------------------------
Display Crop
----------------------------------*/

function showCrop(mat) {

    let cropCanvas =
        document.getElementById("cropCanvas");

    if (!cropCanvas) {

        cropCanvas =
            document.createElement("canvas");

        cropCanvas.id =
            "cropCanvas";

        cropCanvas.style.marginTop =
            "25px";

        cropCanvas.style.maxWidth =
            "100%";

        document
            .getElementById("processedContainer")
            .appendChild(cropCanvas);

    }

    cv.imshow(
        cropCanvas,
        mat
    );

}