// @move: to l3p-core.svg


export function getTranslation(node: SVGElement, axis: String){
    axis = axis !== undefined ? axis.toLowerCase() : undefined
    if(axis === "x"){
        return parseInt(node.getAttribute("transform").replace(/[^\(]+\(\s*?(\-?)\s*?(\d+)\s*?\,\s*?(\-?)\s*?(\d+)\s*?\)/, `$1$2`))
    } 
    else if(axis === "y"){
        return parseInt(node.getAttribute("transform").replace(/[^\(]+\(\s*?(\-?)\s*?(\d+)\s*?\,\s*?(\-?)\s*?(\d+)\s*?\)/, `$3$4`))
    } else if(!axis){
        return {
            x: parseInt(node.getAttribute("transform").replace(/[^\(]+\(\s*?(\-?)\s*?(\d+)\s*?\,\s*?(\-?)\s*?(\d+)\s*?\)/, `$1$2`)),
            y: parseInt(node.getAttribute("transform").replace(/[^\(]+\(\s*?(\-?)\s*?(\d+)\s*?\,\s*?(\-?)\s*?(\d+)\s*?\)/, `$3$4`)), 
        }
    }
}


export function getBBox(node: SVGGraphicsElement){
    let bbox = undefined
    try {
        bbox = node.getBBox()
    } catch(e){
        // console.log("Tried to get the BBox of a SVGGraphicsElement...")
        bbox = { x: 0, y: 0, width: 0, height: 0 }
    }
    return bbox
}
// @todo: change translation not found behaviour
export function getTranslationX(node: SVGElement){
    const transform = node.getAttribute("transform")
    if(transform !== null){
        return getTranslation(node, "x")
    } else {
        node.setAttribute("transform", "translate(0,0)")
        return 0
    }
}
// @todo: change translation not found behaviour
export function getTranslationY(node: SVGElement){
    const transform = node.getAttribute("transform")
    if(transform !== null){
        return getTranslation(node, "y")
    } else {
        node.setAttribute("transform", "translate(0,0)")
        return 0
    }
}
export function setTranslation(node: SVGElement, coordinate: any){
    let { x, y } = coordinate
    x = x !== undefined ? x : getTranslationX(node)
    y = y !== undefined ? y : getTranslationY(node)
    node.setAttribute("transform", `translate(${x},${y})`)
}

export function setViewBox(node: SVGElement, attribute: String | any, value: Number){
    const vbString = node.getAttribute("viewBox")
    if(vbString){
        if(typeof attribute === "string"){
            const vbArray = vbString.split(" ")
            switch(attribute.toLocaleLowerCase()){
                case "x":
                    vbArray[0] = value
                    break
                case "y":
                    vbArray[1] = value
                    break
                case "w":
                case "width":
                    vbArray[2] = value
                    break
                case "h":
                case "height":
                    vbArray[3] = value
                    break
            }
            node.setAttribute("viewBox", vbArray.join(" "))
        } else if(typeof attribute === "object"){
            const vbArray = vbString.split(" ")
            const { x, y, w, h } = attribute
            if(x !== undefined){
                vbArray[0] = x
            }
            if(y !== undefined){
                vbArray[1] = y
            }
            if(w !== undefined){
                vbArray[2] = w
            }
            if(h !== undefined){
                vbArray[3] = h
            }
            node.setAttribute("viewBox", vbArray.join(" "))
        } else {
            throw new Error("the attribute parameter must be string or object")
        }
    } else {
        throw new Error("the svg does not have the viewbox attribute set.")
    }
}

export function getViewBoxX(node: SVGElement){
    const vbString = node.getAttribute("viewBox")
    if(vbString){
        return parseInt(vbString.split(" ")[0])
    } else {
        throw new Error("the svg does not have the viewbox attribute set.")
    }
}
export function getViewBoxY(node: SVGElement){
    const vbString = node.getAttribute("viewBox")
    if(vbString){
        return parseInt(vbString.split(" ")[1])
    } else {
        throw new Error("the svg does not have the viewbox attribute set.")
    }
}
export function getViewBoxPosition(node: SVGElement){
    return {
        x: getViewBoxX(node),
        y: getViewBoxY(node),
    }
}
export function getViewBoxWidth(node: SVGElement){
    const vbString = node.getAttribute("viewBox")
    if(vbString){
        return parseInt(vbString.split(" ")[2])
    } else {
        throw new Error("the svg does not have the viewbox attribute set.")
    }
}
export function getViewBoxHeight(node: SVGElement){
    const vbString = node.getAttribute("viewBox")
    if(vbString){
        return parseInt(vbString.split(" ")[3])
    } else {
        throw new Error("the svg does not have the viewbox attribute set.")
    }
}
export function getViewBoxScale(node: SVGElement){
    return {
        w: getViewBoxWidth(node),
        h: getViewBoxHeight(node),
    }
}