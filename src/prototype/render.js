import $ from '@fr0st/query';

/**
 * Render the ImageCrop.
 */
export function _render() {
    this._outerContainer = $.create('div', {
        class: this.constructor.classes.outerContainer,
    });

    this._container = $.create('div', {
        class: this.constructor.classes.container,
        style: {
            boxSizing: 'content-box',
        },
    });

    if (this._options.circle) {
        $.addClass(this._container, this.constructor.classes.circle);
    }

    if (this._options.resize) {
        this._resize = $.create('div', {
            class: this.constructor.classes.resize,
            style: {
                width: '5px',
                height: '5px',
                backgroundColor: 'black',
                cursor: 'nwse-resize',
                zIndex: 1,
            },
        });
        $.append(this._outerContainer, this._resize);
    }

    this._canvas = $.create('canvas', {
        class: this.constructor.classes.preview,
        style: {
            transformOrigin: '0 0',
        },
    });

    this._context = this._canvas.getContext('2d');

    $.append(this._container, this._canvas);
    $.append(this._outerContainer, this._container);
    $.append(this._node, this._outerContainer);
};
