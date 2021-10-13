/**
 * ImageCrop Helpers
 */

Object.assign(ImageCrop.prototype, {

    /**
     * Clamp the image offset.
     */
    _clampOffset() {
        if (!this._settings.enforceBoundary) {
            return;
        }

        const minX = this._previewWidth / (this._canvasWidth * this._zoom) * this._canvasWidth / 2;
        const minY = this._previewHeight / (this._canvasHeight * this._zoom) * this._canvasHeight / 2;

        this._offsetX = Core.clamp(this._offsetX, minX, this._canvasWidth - minX);
        this._offsetY = Core.clamp(this._offsetY, minY, this._canvasHeight - minY);
    },

    /**
     * Clamp the image zoom level.
     */
    _clampZoom() {
        this._zoom = Core.clamp(this._zoom, this._settings.minZoom, this._settings.maxZoom);

        if (!this._settings.enforceBoundary) {
            return;
        }

        const minZoom = Math.max(this._previewWidth / this._canvasWidth, this._previewHeight / this._canvasHeight);
        this._zoom = Math.max(minZoom, this._zoom);
    },

    /**
     * Resize the image preview.
     * @param {number} width The preview width.
     * @param {number} height The preview height.
     */
    _resizePreview(width, height) {
        if (this._settings.maxPreviewWidth) {
            width = Math.min(width, this._settings.maxPreviewWidth);
        }

        if (this._settings.maxPreviewHeight) {
            height = Math.min(height, this._settings.maxPreviewHeight);
        }

        if (this._settings.enforceBoundary) {
            this._previewWidth = Math.min(width, this._canvasWidth * this._zoom);
            this._previewHeight = Math.min(height, this._canvasHeight * this._zoom);

            this._clampOffset();
        } else {
            this._offsetX += (width - this._previewWidth) / this._zoom / 2;
            this._offsetY -= (height - this._previewHeight) / this._zoom / 2;
            this._previewWidth = width;
            this._previewHeight = height;
        }

        dom.setStyle(this._outerContainer, {
            width: `${this._previewWidth}px`,
            height: `${this._previewHeight}px`
        });
    },

    /**
     * Update the preview.
     */
    _updatePreview() {
        const x = ((-this._canvasWidth + this._offsetX) * this._zoom) + (this._previewWidth / 2);
        const y = ((-this._canvasHeight + this._offsetY) * this._zoom) + (this._previewHeight / 2);
        dom.setStyle(this._canvas, 'transform', `translate3d(${x}px, ${y}px, 0) scale(${this._zoom})`);
    },

    /**
     * Update the preview canvas.
     */
    _updatePreviewCanvas() {
        dom.setAttribute(this._canvas, 'width', this._canvasWidth);
        dom.setAttribute(this._canvas, 'height', this._canvasHeight);

        this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);

        this._context.save();
        this._context.translate(this._canvasWidth / 2, this._canvasHeight / 2);
        this._context.rotate(this._rotation * Math.PI / 180);

        if (this._flipped) {
            this._context.scale(-1, 1);
        }

        this._context.drawImage(this._img, -this._img.width / 2, -this._img.height / 2, this._img.width, this._img.height);
        this._context.restore();
    },

    _updateRotation(amount) {
        const rotation = (this._rotation + amount) % 360;

        if (rotation % 180 === 0) {
            this._canvasWidth = this._img.width;
            this._canvasHeight = this._img.height;
        } else {
            this._canvasWidth = this._img.height;
            this._canvasHeight = this._img.width;
        }

        const newRotation = rotation >= this._rotation ?
            rotation :
            rotation + 360;

        while (this._rotation < newRotation) {
            const offsetX = this._offsetX;
            const offsetY = this._offsetY;

            if (this._rotation % 180 === 0) {
                this._offsetX = this._img.height - offsetY;
            } else {
                this._offsetX = this._img.width - offsetY;
            }
            this._offsetY = offsetX;

            this._rotation += 90;
        }

        this._rotation %= 360;
    }

});
