import $ from '@fr0st/query';
import { getPosition, getTouchPositions } from '@fr0st/ui';

/**
 * Attach events for the ImageCrop.
 */
export function _events() {
    let lastPos;

    const downEvent = (e) => {
        if (e.button) {
            return false;
        }

        e.preventDefault();

        lastPos = getPosition(e);
    };

    const moveEvent = (e) => {
        const newPos = getPosition(e);
        this._offsetX += ((newPos.x - lastPos.x) / this._zoom);
        this._offsetY += ((newPos.y - lastPos.y) / this._zoom);
        lastPos = newPos;

        this._clampOffset();
        this._updatePreview();

        $.triggerEvent(this._node, 'update.ui.imagecrop');
    };

    const dragEvent = $.mouseDragFactory(downEvent, moveEvent);

    $.addEvent(this._container, 'mousedown.ui.imagecrop touchstart.ui.imagecrop', dragEvent);

    if (this._options.resize) {
        this._eventsResize();
    }

    if (this._options.zoom) {
        this._eventsZoom();
    }
};

/**
 * Attach resize events.
 */
export function _eventsResize() {
    let lastPos;

    const downEvent = (e) => {
        e.preventDefault();
        e.stopPropagation();

        lastPos = getPosition(e);
    };

    const moveEvent = (e) => {
        const newPos = getPosition(e);
        this._previewWidth += newPos.x - lastPos.x;
        this._previewHeight += newPos.y - lastPos.y;
        lastPos = newPos;

        this._resizePreview(this._previewWidth, this._previewHeight);
        this._updatePreview();

        $.triggerEvent(this._node, 'update.ui.imagecrop');
    };

    const dragEvent = $.mouseDragFactory(downEvent, moveEvent);

    $.addEvent(this._resize, 'mousedown.ui.imagecrop', dragEvent, { passive: true });
};

/**
 * Attach zoom events.
 */
export function _eventsZoom() {
    let lastDist;

    const getTouchDistance = (e) => {
        const touches = getTouchPositions(e);
        return $._dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    };

    const downEvent = (e) => {
        lastDist = getTouchDistance(e);
    };

    const moveEvent = (e) => {
        const newDist = getTouchDistance(e);
        const diff = newDist - lastDist;
        lastDist = newDist;

        this._zoom += diff / $._dist(0, 0, this._previewWidth, this._previewHeight);

        this._clampZoom();
        this._clampOffset();
        this._updatePreview();

        $.triggerEvent(this._node, 'update.ui.imagecrop');
    };

    const dragEvent = $.mouseDragFactory(downEvent, moveEvent, null, { touches: 2 });

    $.addEvent(this._container, 'touchstart.ui.imagecrop', dragEvent, { passive: true });

    $.addEvent(this._container, 'wheel.ui.imagecrop', (e) => {
        e.preventDefault();

        if (e.deltaY > 0) {
            this._zoom -= this._options.zoomAmount;
        } else if (e.deltaY < 0) {
            this._zoom += this._options.zoomAmount;
        }

        this._clampZoom();
        this._clampOffset();
        this._updatePreview();

        $.triggerEvent(this._node, 'update.ui.imagecrop');
    });
};
