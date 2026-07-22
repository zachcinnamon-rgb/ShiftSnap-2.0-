/*
==========================================
ShiftSnap
gridDetector.js
Version 0.2
==========================================

Responsibilities

• Detect horizontal lines
• Detect vertical lines
• Combine them
• Find the largest schedule rectangle
• Draw a box around it
• Return crop coordinates

==========================================
*/

class GridDetector {

    constructor() {

        this.MIN_AREA = 100000;

    }

    detect(processedMat) {

        const horizontal =
            this.detectHorizontal(processedMat);

        const vertical =
            this.detectVertical(processedMat);

        const grid = new cv.Mat();

        cv.add(horizontal, vertical, grid);

        const contourResult =
            this.findLargestRectangle(grid);

        horizontal.delete();
        vertical.delete();
        grid.delete();

        return contourResult;

    }

    detectHorizontal(src) {

        const horizontal = src.clone();

        const size = Math.max(
            25,
            Math.floor(src.cols / 20)
        );

        const structure =
            cv.getStructuringElement(

                cv.MORPH_RECT,

                new cv.Size(size,1)

            );

        cv.erode(
            horizontal,
            horizontal,
            structure
        );

        cv.dilate(
            horizontal,
            horizontal,
            structure
        );

        structure.delete();

        return horizontal;

    }

    detectVertical(src){

        const vertical = src.clone();

        const size = Math.max(
            25,
            Math.floor(src.rows / 20)
        );

        const structure =
            cv.getStructuringElement(

                cv.MORPH_RECT,

                new cv.Size(1,size)

            );

        cv.erode(
            vertical,
            vertical,
            structure
        );

        cv.dilate(
            vertical,
            vertical,
            structure
        );

        structure.delete();

        return vertical;

    }

    findLargestRectangle(grid){

        const contours =
            new cv.MatVector();

        const hierarchy =
            new cv.Mat();

        cv.findContours(

            grid,

            contours,

            hierarchy,

            cv.RETR_EXTERNAL,

            cv.CHAIN_APPROX_SIMPLE

        );

        let bestRect = null;

        let bestArea = 0;

        for(let i=0;i<contours.size();i++){

            const contour =
                contours.get(i);

            const rect =
                cv.boundingRect(contour);

            const area =
                rect.width * rect.height;

            if(area < this.MIN_AREA){

                contour.delete();

                continue;

            }

            if(area > bestArea){

                bestArea = area;

                bestRect = {

                    x:rect.x,

                    y:rect.y,

                    width:rect.width,

                    height:rect.height

                };

            }

            contour.delete();

        }

        contours.delete();
        hierarchy.delete();

        return bestRect;

    }

    drawRectangle(mat,rect){

        if(!rect)
            return;

        cv.rectangle(

            mat,

            new cv.Point(rect.x,rect.y),

            new cv.Point(

                rect.x+rect.width,

                rect.y+rect.height

            ),

            new cv.Scalar(0,255,0,255),

            6

        );

    }

    crop(mat,rect){

        return mat.roi(

            new cv.Rect(

                rect.x,

                rect.y,

                rect.width,

                rect.height

            )

        );

    }

}

window.GridDetector = GridDetector;