/*
==========================================
ShiftSnap
app.js
Version 1.0
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

/*
==========================================
Initialize App
==========================================
*/

function initializeApp() {

    if (!window.cvReady) {

        setTimeout(initializeApp, 100);

        return;

    }

    processor = new ImageProcessor();
    detector = new GridDetector();

    statusText.textContent = "Ready";

    console.log("ShiftSnap Ready");

}

initializeApp();

/*
==========================================
Upload Button
==========================================
*/

uploadButton.addEventListener("click", () => {

    imageInput.click();

});

/*
==========================================
Image Selected
==========================================
*/

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

document.addEventListener("dragover", e => {

    e.preventDefault();

});

document.addEventListener("drop", e => {

    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (!file)
        return;

    processScreenshot(file);

});

/*
==========================================
Main Processing Pipeline
==========================================
*/

async function processScreenshot(file) {

    if (!window.cvReady) {

        alert("OpenCV has not finished loading.");

        return;

    }

    try {

        statusText.textContent = "Loading Image...";

        previewImage.src = URL.createObjectURL(file);

        previewImage.style.display = "block";

        const source = await processor.load(file);

        statusText.textContent = "Processing...";

        const imageData = processor.process(source);

        statusText.textContent = "Finding Schedule...";

        const detection = detector.detect(imageData);

        if (!detection) {

            statusText.textContent = "Schedule Not Found";

            processor.cleanup(

                imageData.gray,
                imageData.enhanced,
                imageData.binary,
                imageData.original

            );

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

        statusText.textContent = "Schedule Found";

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

        statusText.textContent = "Error";

        alert(error.message);

    }

}