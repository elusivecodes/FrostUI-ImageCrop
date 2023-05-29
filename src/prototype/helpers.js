import $ from '@fr0st/query';

/**
 * Clamp the image offset.
 */
export function _clampOffset() {
    if (!this._options.enforceBoundary) {
        return;
    }

    const minX = this._previewWidth / (this._canvasWidth * this._zoom) * this._canvasWidth / 2;
    const minY = this._previewHeight / (this._canvasHeight * this._zoom) * this._canvasHeight / 2;

    this._offsetX = $._clamp(this._offsetX, minX, this._canvasWidth - minX);
    this._offsetY = $._clamp(this._offsetY, minY, this._canvasHeight - minY);
};

/**
 * Clamp the image zoom level.
 */
export function _clampZoom() {
    this._zoom = $._clamp(this._zoom, this._options.minZoom, this._options.maxZoom);

    if (!this._options.enforceBoundary) {
        return;
    }

    const minZoom = Math.max(this._previewWidth / this._canvasWidth, this._previewHeight / this._canvasHeight);
    this._zoom = Math.max(minZoom, this._zoom);
};

/**
 * Resize the image preview.
 * @param {number} width The preview width.
 * @param {number} height The preview height.
 */
export function _resizePreview(width, height) {
    if (this._options.maxPreviewWidth) {
        width = Math.min(width, this._options.maxPreviewWidth);
    }

    if (this._options.maxPreviewHeight) {
        height = Math.min(height, this._options.maxPreviewHeight);
    }

    if (this._options.enforceBoundary) {
        this._previewWidth = Math.min(width, this._canvasWidth * this._zoom);
        this._previewHeight = Math.min(height, this._canvasHeight * this._zoom);

        this._clampOffset();
    } else {
        this._offsetX += (width - this._previewWidth) / this._zoom / 2;
        this._offsetY -= (height - this._previewHeight) / this._zoom / 2;
        this._previewWidth = width;
        this._previewHeight = height;
    }

    $.setStyle(this._outerContainer, {
        width: `${this._previewWidth}px`,
        height: `${this._previewHeight}px`,
    });
};

/**
 * Update the preview.
 */
export function _updatePreview() {
    const x = ((-this._canvasWidth + this._offsetX) * this._zoom) + (this._previewWidth / 2);
    const y = ((-this._canvasHeight + this._offsetY) * this._zoom) + (this._previewHeight / 2);
    $.setStyle(this._canvas, {
        transform: `translate3d(${x}px, ${y}px, 0) scale(${this._zoom})`,
    });
};

/**
 * Update the preview canvas.
 */
export function _updatePreviewCanvas() {
    $.setAttribute(this._canvas, {
        width: this._canvasWidth,
        height: this._canvasHeight,
    });

    this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);

    this._context.save();
    this._context.translate(this._canvasWidth / 2, this._canvasHeight / 2);
    this._context.rotate(this._rotation * Math.PI / 180);

    if (this._flipped) {
        this._context.scale(-1, 1);
    }

    this._context.drawImage(this._img, -this._img.width / 2, -this._img.height / 2, this._img.width, this._img.height);
    this._context.restore();
};

/**
 * Adjust the rotation by an amount.
 * @param {number} amount The amount.
 */
export function _updateRotation(amount) {
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
};
