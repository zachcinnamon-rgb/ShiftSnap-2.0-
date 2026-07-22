/*
==========================================
ShiftSnap
gridDetector.js
Version 0.3
==========================================

Responsibilities
----------------
• Detect horizontal grid lines
• Detect vertical grid lines
• Combine line masks
• Find largest schedule rectangle
• Crop schedule
• Draw debugging rectangle

Returns:
{
    original,
    gray,
    enhanced,
    binary,
    grid,
    rect,
    crop
}
==========================================
*/

class GridDetector {

    constructor() {

        this.MIN_AREA = 100000;

    }

    detect(imageData) {

        const horizontal = this.detectHorizontal(imageData.binary);

        const vertical = this.detectVertical(imageData.binary);

        const grid = new cv.Mat();

        cv.add(horizontal, vertical, grid);

        const rect = this.findLargestRectangle(grid);

        horizontal.delete();
        vertical.delete();

        if (!rect) {

            grid.delete();

            return null;

        }

        const crop = this.crop(imageData.original, rect);

        return {

            ...imageData,

            grid,

            rect,

            crop

        };

    }

    detectHorizontal(binary) {

        const result = binary.clone();

        const kernelWidth = Math.max(
            40,
            Math.floor(binary.cols / 18)
        );

        const kernel = cv.getStructuringElement(
            cv.MORPH_RECT,
            new cv.Size(kernelWidth, 1)
        );

        cv.erode(result, result, kernel);
        cv.dilate(result, result, kernel);

        kernel.delete();

        return result;

    }

    detectVertical(binary) {

        const result = binary.clone();

        const kernelHeight = Math.max(
            40,
            Math.floor(binary.rows / 18)
        );

        const kernel = cv.getStructuringElement(
            cv.MORPH_RECT,
            new cv.Size(1, kernelHeight)
        );

        cv.erode(result, result, kernel);
        cv.dilate(result, result, kernel);

        kernel.delete();

        return result;

    }

    findLargestRectangle(grid) {

        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();

        cv.findContours(

            grid,

            contours,

            hierarchy,

            cv.RETR_EXTERNAL,

            cv.CHAIN_APPROX_SIMPLE

        );

        let largestRect = null;
        let largestArea = 0;

        for (let i = 0; i < contours.size(); i++) {

            const contour = contours.get(i);

            const rect = cv.boundingRect(contour);

            const area = rect.width * rect.height;

            if (
                area > this.MIN_AREA &&
                area > largestArea
            ) {

                largestArea = area;

                largestRect = {

                    x: rect.x,

                    y: rect.y,

                    width: rect.width,

                    height: rect.height

                };

            }

            contour.delete();

        }

        contours.delete();
        hierarchy.delete();

        return largestRect;

    }

    crop(mat, rect) {

        const roi = new cv.Rect(

            rect.x,

            rect.y,

            rect.width,

            rect.height

        );

        return mat.roi(roi).clone();

    }

    drawRectangle(mat, rect) {

        cv.rectangle(

            mat,

            new cv.Point(rect.x, rect.y),

            new cv.Point(

                rect.x + rect.width,

                rect.y + rect.height

            ),

            new cv.Scalar(0, 255, 0, 255),

            5

        );

    }

    drawGrid(mat, grid) {

        cv.cvtColor(

            grid,

            grid,

            cv.COLOR_GRAY2RGBA

        );

        cv.addWeighted(

            mat,

            0.8,

            grid,

            0.5,

            0,

            mat

        );

    }

    cleanup(...mats) {

        mats.forEach(mat => {

            if (mat instanceof cv.Mat) {

                mat.delete();

            }

        });

    }

}

window.GridDetector = GridDetector;
