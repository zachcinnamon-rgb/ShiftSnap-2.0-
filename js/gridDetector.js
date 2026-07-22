/*
==========================================
ShiftSnap
gridDetector.js
Version 2.0
FAA WMT Detector
==========================================
*/

class GridDetector {

    detect(imageData) {

        const binary = imageData.binary;

        // Find bright card instead of thin grid lines
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();

        cv.findContours(
            binary,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE
        );

        let bestRect = null;
        let bestArea = 0;

        for (let i = 0; i < contours.size(); i++) {

            const contour = contours.get(i);
            const rect = cv.boundingRect(contour);

            const area = rect.width * rect.height;

            // Ignore tiny contours
            if (area < 200000) {
                contour.delete();
                continue;
            }

            // WMT schedule is much wider than tall
            const ratio = rect.width / rect.height;

            if (
                ratio > 0.8 &&
                ratio < 3.5 &&
                area > bestArea
            ) {

                bestArea = area;
                bestRect = rect;

            }

            contour.delete();

        }

        contours.delete();
        hierarchy.delete();

        if (!bestRect)
            return null;

        // Remove padding around the card
        const margin = 20;

        const x = Math.max(0, bestRect.x + margin);
        const y = Math.max(0, bestRect.y + margin);

        const width = Math.min(
            imageData.original.cols - x,
            bestRect.width - margin * 2
        );

        const height = Math.min(
            imageData.original.rows - y,
            bestRect.height - margin * 2
        );

        const rect = new cv.Rect(
            x,
            y,
            width,
            height
        );

        const crop =
            imageData.original.roi(rect).clone();

        return {

            ...imageData,

            rect,

            crop

        };

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

}

window.GridDetector = GridDetector;