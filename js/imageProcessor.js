/*
==========================================
ShiftSnap
imageProcessor.js
Version 0.2
==========================================

Responsibilities

• Load image
• Resize to standard width
• Convert to grayscale
• Improve contrast
• Adaptive threshold
• Return OpenCV Mats

No OCR
No grid detection
No schedule logic
==========================================
*/

class ImageProcessor {

    constructor() {
        this.STANDARD_WIDTH = 1800;
    }

    async load(file) {

        const img = await this.loadImage(file);

        const canvas = document.createElement("canvas");

        const scale =
            this.STANDARD_WIDTH / img.width;

        canvas.width = this.STANDARD_WIDTH;
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return cv.imread(canvas);

    }

    loadImage(file) {

        return new Promise((resolve) => {

            const image = new Image();

            image.onload = () => resolve(image);

            if (typeof file === "string") {

                image.src = file;

            } else {

                image.src =
                    URL.createObjectURL(file);

            }

        });

    }

    grayscale(src) {

        const gray = new cv.Mat();

        cv.cvtColor(
            src,
            gray,
            cv.COLOR_RGBA2GRAY
        );

        return gray;

    }

    increaseContrast(gray) {

        const result = new cv.Mat();

        cv.equalizeHist(
            gray,
            result
        );

        return result;

    }

    adaptiveThreshold(gray) {

        const result = new cv.Mat();

        cv.adaptiveThreshold(

            gray,

            result,

            255,

            cv.ADAPTIVE_THRESH_GAUSSIAN_C,

            cv.THRESH_BINARY,

            31,

            15

        );

        return result;

    }

    blur(gray) {

        const result = new cv.Mat();

        cv.GaussianBlur(

            gray,

            result,

            new cv.Size(3,3),

            0

        );

        return result;

    }

    invert(binary){

        const result = new cv.Mat();

        cv.bitwise_not(

            binary,

            result

        );

        return result;

    }

    process(src){

        const gray =
            this.grayscale(src);

        const contrast =
            this.increaseContrast(gray);

        const blur =
            this.blur(contrast);

        const threshold =
            this.adaptiveThreshold(blur);

        const inverted =
            this.invert(threshold);

        gray.delete();
        contrast.delete();
        blur.delete();
        threshold.delete();

        return {

            original: src,

            processed: inverted

        };

    }

    matToCanvas(mat){

        const canvas =
            document.createElement("canvas");

        cv.imshow(canvas, mat);

        return canvas;

    }

    matToImage(mat){

        const canvas =
            this.matToCanvas(mat);

        return canvas.toDataURL();

    }

    cleanup(...mats){

        mats.forEach(m=>{

            if(m)
                m.delete();

        });

    }

}

window.ImageProcessor = ImageProcessor;