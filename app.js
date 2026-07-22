// ShiftSnap app.js

window.addEventListener("DOMContentLoaded", () => {

    const uploadButton = document.getElementById("uploadButton");
    const imageInput = document.getElementById("imageInput");

    const previewImage = document.getElementById("previewImage");

    const processedCanvas = document.getElementById("processedCanvas");
    const cropCanvas = document.getElementById("cropCanvas");

    const statusText = document.getElementById("statusText");

    uploadButton.addEventListener("click", () => {
        imageInput.click();
    });

    imageInput.addEventListener("change", (e) => {

        const file = e.target.files[0];

        if (!file)
            return;

        const reader = new FileReader();

        reader.onload = function (event) {

            previewImage.onload = function () {

                if (!window.cvReady) {
                    statusText.textContent = "OpenCV is not ready.";
                    return;
                }

                try {

                    statusText.textContent = "Reading image...";

                    const processor = new ImageProcessor();

                    const detector = new GridDetector();

                    const imageData = processor.process(previewImage);

                    // Display binary image for debugging
                    cv.imshow(processedCanvas, imageData.binary);

                    statusText.textContent = "Searching for schedule...";

                    const result = detector.detect(imageData);

                    if (!result) {

                        statusText.textContent = "Schedule not found.";

                        return;

                    }

                    cv.imshow(cropCanvas, result.crop);

                    statusText.textContent = "Schedule detected successfully.";

                }
                catch (err) {

                    console.error(err);

                    statusText.textContent =
                        "Error: " + err.message;

                }

            };

            previewImage.src = event.target.result;

            previewImage.style.display = "block";

        };

        reader.readAsDataURL(file);

    });

});