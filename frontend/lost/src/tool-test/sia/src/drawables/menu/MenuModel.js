import * as DEFAULTS from "./menu.defaults"
import * as math from "shared/math"
import * as objectAssignDeep from "@cartok/object-assign-deep"
if(Object.assignDeep === undefined){
    Object.defineProperty(Object, "assignDeep", {
        value: objectAssignDeep,            
        enumerable: false,
        writable: false,
    })
}


const that = {
    drawable: new WeakMap(),
    label: {
        text: new WeakMap(),
        fontSize: new WeakMap(),
        padding: new WeakMap(),
        barMargin: new WeakMap(),
        position: new WeakMap(),
        relativePosition: new WeakMap(),    // calculated
    },
    bar: {
        width: new WeakMap(),               // cropped
        height: new WeakMap(),
        minWidth: new WeakMap(),
        borderWidth: new WeakMap(),
        position: new WeakMap(),
        relativePosition: new WeakMap(),    // calculated
        iconSize: new WeakMap(),            // private, calculated
        labelHideThreshold: new WeakMap(),  // private, calculated
        label: {
            text: new WeakMap(),
            padding: new WeakMap(),
        }
    },
}

export default class MenuModel {
    constructor(config = {}){
        config = Object.assignDeep({}, DEFAULTS, config)
        const { drawable, display, label, bar } = config
        this.display = display
        this.drawable = drawable
        if(display.bar){
            this.bar = bar
        }
        if(display.label){
            // label property relative position depends on bar properties
            this.label = label
        }
        // inverse all values so presenter can handle init? got refactoring todo.
        this.state = {
            bar: {
                // @rename: barIsDocked
                docked: !(this.bar.width <= this.bar.minWidth),
            },
            label: {
                // @rename: labelIsVisible
                small: !(this.bar.width <= this.bar.labelHideThreshold),
            }
        }
    }
    // set display()
    // get display()
    set drawable(drawable: DrawablePresenter){
        that.drawable.set(this, drawable)
    }
    set label(values: any){
        const { text, fontSize, padding, barMargin, position } = values
        if(text !== undefined) {
            that.label.text.set(this, text)
        }
        if(fontSize !== undefined){ 
            that.label.fontSize.set(this, fontSize)
        }
        if(barMargin !== undefined){
            that.label.barMargin.set(this, barMargin)
        }
        if(padding !== undefined){
            that.label.padding.set(this, padding)
        }
        // assign object keys to "position" to allow easy / distinct usage
        if(position !== undefined){
            const currentPosition = that.label.position.get(this)
            if(currentPosition){
                that.label.position.set(this, Object.assign(currentPosition, position))
            } else {
                that.label.position.set(this, position)
            }
            // calculate relative position (depends on view)
            that.label.relativePosition.set(this, {
                x: that.label.position.get(this).x,
                y: that.label.position.get(this).y - that.label.fontSize.get(this) - that.label.barMargin.get(this) - 1 * that.label.padding.get(this),
            })
        }
    }
    set bar(values: any){
        const { label, width, height, position, borderWidth, minWidth } = values
        if(borderWidth !== undefined){
            that.bar.borderWidth.set(this, borderWidth)
        }
        if(minWidth !== undefined){
            that.bar.minWidth.set(this, math.floorEven(minWidth))
        }
        if(height !== undefined){
            that.bar.height.set(this, height)
            that.bar.iconSize.set(this, height)
        }
        // override "width" with "minWidth" if given value is less
        if(width !== undefined){
            that.bar.width.set(this, 
                (width < that.bar.minWidth.get(this))
                    ? that.bar.minWidth.get(this) 
                    : width
            )
        }
        // recalculate "labelHideThreshold" if needed
        if(height !== undefined || borderWidth !== undefined || width !== undefined || minWidth !== undefined){
            that.bar.labelHideThreshold.set(this, that.bar.minWidth.get(this) + that.bar.iconSize.get(this))
        }
        // assign object keys to "position" to allow easy / distinct usage
        if(position !== undefined){
            const currentPosition = that.bar.position.get(this)
            if(currentPosition){
                that.bar.position.set(this, Object.assign(currentPosition, position))
            } else {
                that.bar.position.set(this, position)
            }
            // calculate relative position (depends on view)
            that.bar.relativePosition.set(this, {
                x: that.bar.position.get(this).x,
                y: that.bar.position.get(this).y - that.bar.height.get(this),
            })
        }
        // label font size depends on bar height update.
        if(label !== undefined){
            const { text, padding, fontSize } = label
            if(text !== undefined){
                that.bar.label.text.set(this, text)   
            }
            if(padding !== undefined){
                that.bar.label.padding.set(this, padding)   
            }
            if(fontSize !== undefined){
                that.bar.label.fontSize = that.bar.height.get(this) - that.bar.label.padding.get(this) - 2
            }
        }
    }
    get drawable(){
        return that.drawable.get(this)
    }
    get label(){
        return {
            text: that.label.text.get(this),
            fontSize: that.label.fontSize.get(this),
            padding: that.label.padding.get(this),
            barMargin: that.label.barMargin.get(this),
            position: that.label.position.get(this),
            relativePosition: that.label.relativePosition.get(this),
        }
    }
    get bar(){
        return {
            width: that.bar.width.get(this),
            height: that.bar.height.get(this),
            borderWidth: that.bar.borderWidth.get(this),
            minWidth: that.bar.minWidth.get(this),
            labelHideThreshold: that.bar.labelHideThreshold.get(this),
            iconSize: that.bar.iconSize.get(this),
            position: that.bar.position.get(this),
            relativePosition: that.bar.relativePosition.get(this),
            label: {
                text: that.bar.label.text.get(this),
                padding: that.bar.label.padding.get(this),
            }
        }
    }
}
