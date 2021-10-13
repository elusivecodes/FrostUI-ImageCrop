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
