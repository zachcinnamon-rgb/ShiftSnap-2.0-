process(originalMat) {

    const gray =
        this.grayscale(originalMat);

    const enhanced =
        this.increaseContrast(gray);

    const blurred =
        this.blur(enhanced);

    const binary =
        this.adaptiveThreshold(blurred);

    const inverted =
        this.invert(binary);

    blurred.delete();
    binary.delete();

    return {

        original: originalMat,

        gray: gray,

        enhanced: enhanced,

        binary: inverted

    };

}