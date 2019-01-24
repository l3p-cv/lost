
// special layer, not using any other view imports.
// should rewrite this to match nodetemplate id or ref api.
let image = undefined
let svg = undefined
let drawableContainer = undefined
export default {
    getSVG(){
        if(svg === undefined){
            svg = document.getElementById("sia-imgview-svg")
        }
        if(svg === undefined || svg === null){
            throw new Error("Could not find svg element.")
        }
        return svg
    },
    getSVGEmbeddedImage(){
        if(image === undefined){
            image = document.getElementById("sia-imgview-svg-image")
        }
        if(image === undefined || image === null){
            throw new Error("Could not find svg image element.")
        }
        return image
    },
    getDrawableContainer(){
        if(drawableContainer === undefined){
            drawableContainer = document.getElementById("sia-imgview-svg")
            drawableContainer = drawableContainer.querySelector(`[data-ref="drawables"]`)
        }
        if(drawableContainer === undefined || drawableContainer === null){
            throw new Error("Could not find drawable container.")
        }
        return drawableContainer
    },
    getWidth(){
        return parseInt(this.getSVGEmbeddedImage().getAttribute("width"))
    },
    getHeight(){ 
        return parseInt(this.getSVGEmbeddedImage().getAttribute("height"))
    },
    // @thesis: snippet
    getDimensions(){
        // get current width and height (of image, or container)
        const dimensions = {
            imgW: this.getWidth(),
            imgH: this.getHeight(),
        }
        // check if every value is not undefined
        const valid = Object.values(dimensions).reduce((result, val) => result && (val !== undefined), true)
        if(!valid) { 
            throw new Error("image has bad dimensions.") 
        }
        return dimensions 
    }
}

/*
@ thesis?
let sia_imgview_svg = undefined
export default {
    "sia-imgview-svg": (()=>{
        if(sia_imgview_svg === undefined){
            sia_imgview_svg = document.getElementById("sia-imgview-svg")
        }
        if(sia_imgview_svg === undefined || sia_imgview_svg === null){
            throw new Error("Could not find element.")
        }
        return sia_imgview_svg
    })
}

*/

