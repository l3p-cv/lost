export function getViewportCoordinates(w, svg){
    const window = {
        xMin:-1*svg.translateX,
        xMax: -1*svg.translateX + (svg.width)/svg.scale,
        yMin: -1*svg.translateY,
        yMax: -1*svg.translateY + (svg.height)/svg.scale

    }
    const viewport = {
        xMin: 0,
        xMax: svg.width,
        yMin: 0,
        yMax: svg.height
    }
    const scaleX = (viewport.xMax - viewport.xMin)/ (window.xMax - window.xMin)
    const scaleY = (viewport.yMax - viewport.yMin)/ (window.yMax - window.yMin)

    const vX = viewport.xMin + (w.x - window.xMin) * scaleX
    const vY = viewport.yMin + (w.y - window.yMin) * scaleY
    return {window, viewport, vX, vY, scaleX, scaleY}
}

/**
 * 
 * @param {*} w0 Point in image coordinate system
 * @param {*} svg Svg with old translation values and old scales
 * @param {*} s1 New scale/zoom
 */
export function getZoomTranslation(w0, svg, s1){
    const s0 = svg.scale
    let translation = {x:0,y:0}
    translation.x = (s0/s1) * (w0.x + svg.translateX) - w0.x 
    translation.y = (s0/s1) * (w0.y + svg.translateY) - w0.y 
    return translation
}