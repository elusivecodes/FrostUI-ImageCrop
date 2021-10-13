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
