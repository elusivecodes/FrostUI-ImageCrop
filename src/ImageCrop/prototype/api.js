/**
 * ImageCrop API
 */

Object.assign(ImageCrop.prototype, {

    /**
     * Get the image bounds.
     * @returns {Array} The image bounds.
     */
    getBounds() {
        const width = this._previewWidth / this._zoom;
        const height = this._previewHeight / this._zoom;
        const x = (this._canvasWidth - this._offsetX) - (width / 2);
        const y = (this._canvasHeight - this._offsetY) - (height / 2);

        return [x, y, x + width, y + height];
    },

    /**
     * Get the image offset.
     * @returns {Array} The image offset.
     */
    getOffset() {
        return [this._offsetX, this._offsetY];
    },

    /**
     * Get the image zoom level.
     * @returns {number} The zoom level.
     */
    getZoom() {
        return this._zoom;
    },

    /**
     * Rotate the image (in degrees).
     * @param {number} [amount=90] The rotation amount (in degrees).
     * @returns {ImageCrop} The ImageCrop object.
     */
    rotate(amount = 90) {
        if (!this._settings.rotate || amount === 0) {
            return this;
        }

        this._updateRotation(amount);
        this._clampZoom();
        this._updatePreviewCanvas();
        this._updatePreview();

        dom.triggerEvent(this._node, 'update.ui.imagecrop');

        return this;
    },

    /**
     * Set the image bounds.
     * @param {number} x1 The first image x offset.
     * @param {number} y1 The first image y offset.
     * @param {number} x2 The second image x offset.
     * @param {number} y2 The second image y offset.
     * @returns {ImageCrop} The ImageCrop object.
     */
    setBounds(x1, y1, x2, y2) {
        const width = x2 - x1;
        const height = y2 - y1;

        if (this._settings.resize) {
            this._resizePreview(width * this._zoom, width * this._zoom);
        } else if (this._settings.zoom) {
            this._zoom = Math.max(this._previewWidth / width, this._previewHeight / height);
        }

        this._offsetX = this._canvasWidth - (x1 + (width / 2));
        this._offsetY = this._canvasHeight - (y1 + (height / 2));

        this._clampZoom();
        this._clampOffset();
        this._updatePreview();

        dom.triggerEvent(this._node, 'update.ui.imagecrop');

        return this;
    },

    /**
     * Set the image offset.
     * @param {number} x The image x offset.
     * @param {number} y The image y offset.
     * @returns {ImageCrop} The ImageCrop object.
     */
    setOffset(x, y) {
        if (x === this._offsetX && y === this.offsetY) {
            return this;
        }

        this._offsetX = x;
        this._offsetY = y;

        this._clampOffset();
        this._updatePreview();

        dom.triggerEvent(this._node, 'update.ui.imagecrop');

        return this;
    },

    /**
     * Set the image zoom level.
     * @param {number} zoom The image zoom level.
     * @returns {ImageCrop} The ImageCrop object.
     */
    setZoom(zoom) {
        if (!this._settings.zoom || zoom === this._zoom) {
            return this;
        }

        this._zoom = zoom;

        this._clampZoom();
        this._clampOffset();
        this._updatePreview();

        dom.triggerEvent(this._node, 'update.ui.imagecrop');

        return this;
    }

});
