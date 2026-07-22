/*
==========================================
ShiftSnap
imageProcessor.js
Version 0.3
==========================================

Responsibilities
----------------
• Load uploaded image
• Resize to standard width
• Convert to grayscale
• Enhance contrast
• Reduce noise
• Adaptive threshold
• Invert image
• Return all processing stages

No OCR
No grid detection
No schedule parsing

==========================================
*/

class ImageProcessor {

    constructor() {
        this.STANDARD_WIDTH = 1800;
    }

    /*
    --------------------------------------
    Load image from upload
    --------------------------------------
    */

    async load(file) {

        const image = await this.loadImage(file);

        const canvas = document.createElement("canvas");

        const scale = this.STANDARD_WIDTH / image.width;

        canvas.width = this.STANDARD_WIDTH;
        canvas.height = Math.round(image.height * scale);

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return cv.imread(canvas);

    }

    /*
    --------------------------------------
    Load HTML Image
    --------------------------------------
    */

    loadImage(file) {

        return new Promise((resolve, reject) => {

            const image = new Image();

            image.onload = () => resolve(image);

            image.onerror = reject;

            if (typeof file === "string") {
                image.src = file;
            } else {
                image.src = URL.createObjectURL(file);
            }

        });

    }

    /*
    --------------------------------------
    Convert to Grayscale
    --------------------------------------
    */

    grayscale(src) {

        const gray = new cv.Mat();

        cv.cvtColor(
            src,
            gray,
            cv.COLOR_RGBA2GRAY
        );

        return gray;

    }

    /*
    --------------------------------------
    Histogram Equalization
    --------------------------------------
    */

    increaseContrast(gray) {

        const enhanced = new cv.Mat();

        cv.equalizeHist(
            gray,
            enhanced
        );

        return enhanced;

    }

    /*
    --------------------------------------
    Gaussian Blur
    --------------------------------------
    */

    blur(src) {

        const blurred = new cv.Mat();

        cv.GaussianBlur(
            src,
            blurred,
            new cv.Size(3, 3),
            0
        );

        return blurred;

    }

    /*
    --------------------------------------
    Adaptive Threshold
    --------------------------------------
    */

    adaptiveThreshold(src) {

        const binary = new cv.Mat();

        cv.adaptiveThreshold(
            src,
            binary,
            255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY,
            31,
            15
        );

        return binary;

    }

    /*
    --------------------------------------
    Invert Image
    --------------------------------------
    */

    invert(src) {

        const inverted = new cv.Mat();

        cv.bitwise_not(
            src,
            inverted
        );

        return inverted;

    }

    /*
    --------------------------------------
    Main Processing Pipeline
    --------------------------------------
    */

    process(originalMat) {

        const gray = this.grayscale(originalMat);

        const enhanced = this.increaseContrast(gray);

        const blurred = this.blur(enhanced);

        const threshold = this.adaptiveThreshold(blurred);

        const binary = this.invert(threshold);

        // No longer needed after inversion
        blurred.delete();
        threshold.delete();

        return {

            original: originalMat,

            gray: gray,

            enhanced: enhanced,

            binary: binary

        };

    }

    /*
    --------------------------------------
    Convert Mat -> Canvas
    --------------------------------------
    */

    matToCanvas(mat) {

        const canvas = document.createElement("canvas");

        cv.imshow(canvas, mat);

        return canvas;

    }

    /*
    --------------------------------------
    Convert Mat -> Image URL
    --------------------------------------
    */

    matToImage(mat) {

        const canvas = this.matToCanvas(mat);

        return canvas.toDataURL("image/png");

    }

    /*
    --------------------------------------
    Cleanup Mats
    --------------------------------------
    */

    cleanup(...mats) {

        mats.forEach(mat => {

            if (mat instanceof cv.Mat) {
                mat.delete();
            }

        });

    }

}

window.ImageProcessor = ImageProcessor;