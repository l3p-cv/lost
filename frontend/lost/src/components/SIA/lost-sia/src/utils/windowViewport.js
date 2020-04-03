export function getViewportCoordinates(wX, wY, svg){
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

    const vX = viewport.xMin + (wX - window.xMin) * scaleX
    const vY = viewport.yMin + (wY - window.yMin) * scaleY
    // console.log('window_viewport: window, viewport', window, viewport)

    return {window, viewport, vX, vY, scaleX, scaleY}
}