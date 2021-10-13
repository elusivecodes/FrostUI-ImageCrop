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
