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
