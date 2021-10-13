/**
 * FrostUI-ImageCrop v1.0
 * https://github.com/elusivecodes/FrostUI-ImageCrop
 */
(function(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory;
    } else {
        factory(global);
    }

})(window, function(window) {
    'use strict';

    if (!window) {
        throw new Error('FrostUI-AuthCode requires a Window.');
    }

    if (!('UI' in window)) {
        throw new Error('FrostUI-AuthCode requires FrostUI.');
    }

    const Core = window.Core;
    const dom = window.dom;
    const UI = window.UI;

    /**
     * ImageCrop Class
     * @class
     */
    class ImageCrop extends UI.BaseComponent {

        /**
         * New ImageCrop constructor.
         * @param {HTMLElement} node The input node.
         * @param {object} [settings] The options to create the ImageCrop with.
         * @returns {ImageCrop} A new ImageCrop object.
         */
        constructor(node, settings) {
            super(node, settings);

            this._render();
            this._events();

            this._img = new Image();
            this._reader = new FileReader();
        }

        /**
         * Dispose the ImageCrop.
         */
        dispose() {
            dom.remove(this._outerContainer);

            this._outerContainer = null;
            this._container = null;
            this._resize = null;
            this._canvas = null;
            this._context = null;
            this._img = null;

            super.dispose();
        }

    }


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


    /**
     * ImageCrop Events
     */

    Object.assign(ImageCrop.prototype, {

        /**
         * Attach events for the ImageCrop.
         */
        _events() {
            let dragPos;
            dom.addEvent(this._container, 'mousedown.ui.imagecrop touchstart.ui.imagecrop', dom.mouseDragFactory(
                e => {
                    if (e.button) {
                        return false;
                    }

                    e.preventDefault();

                    dragPos = UI.getPosition(e);
                },
                e => {
                    const newPos = UI.getPosition(e);
                    this._offsetX += ((newPos.x - dragPos.x) / this._zoom);
                    this._offsetY += ((newPos.y - dragPos.y) / this._zoom);
                    dragPos = newPos;

                    this._clampOffset();
                    this._updatePreview();

                    dom.triggerEvent(this._node, 'update.ui.imagecrop');
                }
            ));

            if (this._settings.resize) {
                this._eventsResize();
            }

            if (this._settings.zoom) {
                this._eventsZoom();
            }
        },

        /**
         * Attach resize events.
         */
        _eventsResize() {
            let resizePos;
            dom.addEvent(this._resize, 'mousedown.ui.imagecrop', dom.mouseDragFactory(
                e => {
                    e.preventDefault();
                    e.stopPropagation();

                    resizePos = UI.getPosition(e);
                },
                e => {
                    const newPos = UI.getPosition(e);
                    this._previewWidth += newPos.x - resizePos.x;
                    this._previewHeight += newPos.y - resizePos.y;
                    resizePos = newPos;

                    this._resizePreview(this._previewWidth, this._previewHeight);
                    this._updatePreview();

                    dom.triggerEvent(this._node, 'update.ui.imagecrop');
                }
            ));
        },

        /**
         * Attach zoom events.
         */
        _eventsZoom() {
            const getTouchDistance = e => {
                const touches = UI.getTouchPositions(e);
                return Core.dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
            };

            let touchDist;
            dom.addEvent(this._container, 'touchstart.ui.imagecrop', dom.mouseDragFactory(
                e => {
                    touchDist = getTouchDistance(e);
                },
                e => {
                    const newDist = getTouchDistance(e);
                    const diff = newDist - touchDist;
                    touchDist = newDist;

                    this._zoom += diff / Core.dist(0, 0, this._previewWidth, this._previewHeight);

                    this._clampZoom();
                    this._clampOffset();
                    this._updatePreview();

                    dom.triggerEvent(this._node, 'update.ui.imagecrop');
                },
                null,
                { touches: 2 }
            ));

            dom.addEvent(this._container, 'wheel.ui.imagecrop', e => {
                e.preventDefault();

                if (e.deltaY > 0) {
                    this._zoom -= this._settings.zoomAmount;
                } else if (e.deltaY < 0) {
                    this._zoom += this._settings.zoomAmount;
                }

                this._clampZoom();
                this._clampOffset();
                this._updatePreview();

                dom.triggerEvent(this._node, 'update.ui.imagecrop');
            });
        }

    });


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


    /**
     * ImageCrop Load
     */

    Object.assign(ImageCrop.prototype, {

        /**
         * Load a file.
         * @param {Blob} file The file.
         * @param {object} [options] Options for loading the file.
         * @param {number} [options.x] The initial x offset.
         * @param {number} [options.y] The initial y offset.
         * @param {number} [options.zoom] The initial zoom.
         * @returns {ImageCrop} The ImageCrop object.
         */
        load(file, options = {}) {
            const { x = null, y = null, zoom = null } = options;

            this._rotation = 0;
            this._offsetX = x;
            this._offsetY = y;
            this._zoom = zoom;

            return new Promise((resolve, reject) => {
                this._reader.onerror = reject;
                this._img.onerror = reject;

                this._img.onload = _ => {
                    this._previewWidth = this._settings.previewWidth;
                    this._previewHeight = this._settings.previewHeight;

                    dom.setStyle(this._outerContainer, {
                        width: `${this._previewWidth}px`,
                        height: `${this._previewHeight}px`
                    });

                    this._canvasWidth = this._img.width;
                    this._canvasHeight = this._img.height;

                    if (this._offsetX === null) {
                        this._offsetX = this._canvasWidth / 2;
                    }

                    if (this._offsetY === null) {
                        this._offsetY = this._canvasHeight / 2;
                    }

                    if (this._zoom === null) {
                        this._zoom = Math.min(this._previewWidth / this._canvasWidth, this._previewHeight / this._canvasHeight);
                    }

                    let rotation;
                    switch (this._orientation) {
                        case 2:
                            this._flipped = true;
                            break;
                        case 3:
                            rotation = 180;
                            break;
                        case 4:
                            this._flipped = true;
                            rotation = 180;
                            break;
                        case 5:
                            this._flipped = true;
                            rotation = 270;
                            break;
                        case 6:
                            rotation = 270;
                            break;
                        case 7:
                            this._flipped = true;
                            rotation = 90;
                            break;
                        case 8:
                            rotation = 90;
                            break;
                    }

                    if (rotation) {
                        this._updateRotation(rotation);
                    }

                    this._clampZoom();
                    this._clampOffset();
                    this._updatePreviewCanvas();
                    this._updatePreview();

                    resolve();
                };

                const loadImg = _ => {
                    this._reader.onload = _ => {
                        this._img.src = this._reader.result;
                    };

                    this._reader.readAsDataURL(file);
                };

                if (this._settings.exifOrientation) {
                    this._reader.onload = _ => {
                        this._orientation = this.constructor._getOrientation(this._reader.result);

                        loadImg();
                    };

                    this._reader.readAsArrayBuffer(file);
                } else {
                    loadImg();
                }
            });
        }

    });


    /**
     * ImageCrop Render
     */

    Object.assign(ImageCrop.prototype, {

        /**
         * Render the ImageCrop.
         */
        _render() {
            this._outerContainer = dom.create('div', {
                class: this.constructor.classes.outerContainer
            });

            this._container = dom.create('div', {
                class: this.constructor.classes.container
            });

            if (this._settings.circle) {
                dom.addClass(this._container, this.constructor.classes.circle);
            }

            if (this._settings.resize) {
                this._resize = dom.create('div', {
                    class: this.constructor.classes.resize,
                    style: {
                        width: '5px',
                        height: '5px',
                        backgroundColor: 'black',
                        cursor: 'nwse-resize',
                        zIndex: 1
                    }
                });
                dom.append(this._outerContainer, this._resize);
            }

            this._canvas = dom.create('canvas', {
                class: this.constructor.classes.preview,
                style: {
                    transformOrigin: '0 0'
                }
            });

            this._context = this._canvas.getContext('2d');

            dom.append(this._container, this._canvas);
            dom.append(this._outerContainer, this._container);
            dom.append(this._node, this._outerContainer);
        }

    });


    /**
     * ImageCrop Result
     */

    Object.assign(ImageCrop.prototype, {

        /**
         * Get the rendered image.
         * @param {object} [options] Options for rendering the image.
         * @param {string} [options.type=base64] The type of image to render.
         * @param {string} [options.format=png] The image format to render.
         * @param {string|object} [options.size=viewport] The size to render the image.
         * @param {number} [options.quality=1] The image quality to render.
         * @param {Boolean} [circle] Whether to render the image as a circle.
         * @param {string} [background] The background color to render the image with.
         * @returns {Promise} A promise that resolves with the rendered image.
         */
        result(options = {}) {
            const { type = 'base64', format = 'png', size = 'viewport', quality = 1, circle = false, background = null } = options;

            const canvas = dom.create('canvas');
            const context = canvas.getContext('2d');

            let width = this._previewWidth;
            let height = this._previewHeight;
            if (size === 'original') {
                width /= this._zoom;
                height /= this._zoom;
            } else if (Core.isObject(size)) {
                if (size.width && size.height) {
                    width = size.width;
                    height = size.height;
                } else {
                    const ratio = width / height;
                    if (size.width) {
                        width = size.width;
                        height = width / ratio;
                    } else if (size.height) {
                        height = size.height;
                        width = height * ratio;
                    }
                }
            }

            const ratio = width / height;

            if (this._settings.maxWidth) {
                width = Math.min(width, this._settings.maxWidth);
                height = width / ratio;
            }

            if (this._settings.maxHeight) {
                height = Math.min(height, this._settings.maxHeight);
                width = height * ratio;
            }

            dom.setAttribute(canvas, 'width', `${width}px`);
            dom.setAttribute(canvas, 'height', `${height}px`);

            const [x1, y1, x2, y2] = this.getBounds();
            context.drawImage(this._canvas, x1, y1, x2 - x1, y2 - y1, 0, 0, width, height);

            if (circle || this._settings.circle) {
                context.globalCompositeOperation = 'destination-in';
                context.beginPath();
                context.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
                context.closePath();
                context.fill();
            }

            if (background) {
                context.globalCompositeOperation = 'destination-over';
                context.fillStyle = background;
                context.rect(0, 0, width, height);
                context.fill();
                context.fillStyle = '#000';
            }

            context.globalCompositeOperation = 'source-over';

            return new Promise(resolve => {
                switch (type) {
                    case 'base64':
                        const result = canvas.toDataURL(`image/${format}`, quality);
                        resolve(result);
                        break;
                    case 'blob':
                        canvas.toBlob(resolve, `image/${format}`, quality);
                        break;
                    default:
                        resolve(canvas);
                        break;
                }
            });
        }

    });


    /**
     * ImageCrop Helpers (Static)
     */

    Object.assign(ImageCrop, {

        /**
         * Get the EXIF orientation.
         * @param {ArrayBuffer} data The file data.
         * @returns {number} The EXIF orientation.
         */
        _getOrientation(data) {
            const view = new DataView(data);
            const getInt16 = (offset, littleEndian = false) => view.getUint16(offset, littleEndian);
            const getInt32 = (offset, littleEndian = false) => view.getUint32(offset, littleEndian);

            if (getInt16(0) != 0xffd8) {
                return -2;
            }

            let offset = 2;
            while (offset < view.byteLength) {
                if (getInt16(offset + 2) <= 8) {
                    return -1;
                }

                const marker = getInt16(offset);
                offset += 2;

                if ((marker & 0xff00) != 0xff00) {
                    break;
                }

                if (marker != 0xffe1) {
                    offset += getInt16(offset);
                    continue;
                }

                offset += 2;
                if (getInt32(offset) != 0x45786966) {
                    return -1;
                }

                offset += 6;
                const little = getInt16(offset) == 0x4949;
                offset += getInt32(offset + 4, little);
                const tags = getInt16(offset, little) * 12;
                offset += 2;

                for (let i = 0; i < tags; i += 12) {
                    if (getInt16(offset + i, little) == 0x0112) {
                        return getInt16(offset + i + 8, little);
                    }
                }
            }

            return -1;
        }

    });


    // ImageCrop default options
    ImageCrop.defaults = {
        previewWidth: 300,
        previewHeight: 300,
        maxPreviewWidth: null,
        maxPreviewHeight: null,
        maxWidth: null,
        maxHeight: null,
        minZoom: .1,
        maxZoom: 10,
        zoomAmount: .1,
        circle: false,
        exifOrientation: true,
        zoom: true,
        resize: false,
        rotate: true,
        enforceBoundary: true
    };

    // ImageCrop classes
    ImageCrop.classes = {
        circle: 'rounded-circle',
        container: 'position-relative w-100 h-100 overflow-hidden border',
        outerContainer: 'position-relative',
        preview: 'position-absolute top-0 left-0',
        resize: 'position-absolute top-100 start-100 translate-middle'
    };

    UI.initComponent('imagecrop', ImageCrop);

    UI.ImageCrop = ImageCrop;

});