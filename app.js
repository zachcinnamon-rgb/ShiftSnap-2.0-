/*
==========================================
ShiftSnap
app.js
Version 0.3
==========================================
*/

const uploadButton = document.getElementById("uploadButton");
const imageInput = document.getElementById("imageInput");

const previewImage = document.getElementById("previewImage");

const processedCanvas = document.getElementById("processedCanvas");
const cropCanvas = document.getElementById("cropCanvas");

const statusText = document.getElementById("statusText");

let processor = null;
let detector = null;

let cvReady = false;

/*
==========================================
Wait for OpenCV
==========================================
*/

function initializeOpenCV() {

    if (typeof cv === "undefined") {

        setTimeout(initializeOpenCV, 100);

        return;

    }

    if (cv.Mat) {

        processor = new ImageProcessor();
        detector = new GridDetector();

        cvReady = true;

        statusText.textContent = "Ready";

        console.log("OpenCV Ready");

        return;

    }

    setTimeout(initializeOpenCV, 100);

}

initializeOpenCV();

/*
==========================================
Upload Button
==========================================
*/

uploadButton.addEventListener("click", () => {

    imageInput.click();

});

imageInput.addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file)
        return;

    processScreenshot(file);

});

/*
==========================================
Drag & Drop
==========================================
*/

document.body.addEventListener("dragover", e => {

    e.preventDefault();

});

document.body.addEventListener("drop", e => {

    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (!file)
        return;

    processScreenshot(file);

});

/*
==========================================
Main Pipeline
==========================================
*/

async function processScreenshot(file) {

    if (!cvReady) {

        alert("OpenCV is still loading.");

        return;

    }

    try {

        statusText.textContent = "Loading Screenshot...";

        previewImage.src = URL.createObjectURL(file);

        const originalMat = await processor.load(file);

        statusText.textContent = "Enhancing Image...";

        const imageData = processor.process(originalMat);

        statusText.textContent = "Detecting Schedule...";

        const detection = detector.detect(imageData);

        if (!detection) {

            processor.cleanup(
                imageData.gray,
                imageData.enhanced,
                imageData.binary,
                imageData.original
            );

            statusText.textContent = "Schedule Not Found";

            return;

        }

        detector.drawRectangle(
            detection.original,
            detection.rect
        );

        cv.imshow(
            processedCanvas,
            detection.original
        );

        cv.imshow(
            cropCanvas,
            detection.crop
        );

        statusText.textContent =
            "Schedule Found ✓";

        processor.cleanup(

            detection.gray,
            detection.enhanced,
            detection.binary,
            detection.grid,
            detection.crop,
            detection.original

        );

    }

    catch (error) {

        console.error(error);

        statusText.textContent = "Processing Failed";

    }

}