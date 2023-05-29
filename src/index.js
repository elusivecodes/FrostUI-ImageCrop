import { initComponent } from '@fr0st/ui';
import ImageCrop from './image-crop.js';
import { _events, _eventsResize, _eventsZoom } from './prototype/events.js';
import { _clampOffset, _clampZoom, _resizePreview, _updatePreview, _updatePreviewCanvas, _updateRotation } from './prototype/helpers.js';
import { load } from './prototype/load.js';
import { _render } from './prototype/render.js';
import { result } from './prototype/result.js';

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
    enforceBoundary: true,
};

// ImageCrop classes
ImageCrop.classes = {
    circle: 'rounded-circle',
    container: 'position-relative w-100 h-100 overflow-hidden border',
    outerContainer: 'position-relative',
    preview: 'position-absolute top-0 left-0',
    resize: 'position-absolute top-100 start-100',
};

// ImageCrop prototype
const proto = ImageCrop.prototype;

proto.load = load;
proto.result = result;
proto._clampOffset = _clampOffset;
proto._clampZoom = _clampZoom;
proto._events = _events;
proto._eventsResize = _eventsResize;
proto._eventsZoom = _eventsZoom;
proto._render = _render;
proto._resizePreview = _resizePreview;
proto._updatePreview = _updatePreview;
proto._updatePreviewCanvas = _updatePreviewCanvas;
proto._updateRotation = _updateRotation;

// ImageCrop init
initComponent('imagecrop', ImageCrop);

export default ImageCrop;
