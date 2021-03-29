export function getMousePosition(e, svg){
  const absPos = getMousePositionAbs(e, svg)
  return {
      x: (absPos.x )/svg.scale - svg.translateX,
      y: (absPos.y )/svg.scale - svg.translateY
  }
}

export function getMousePositionAbs(e, svg){
  return {
      x: (e.pageX - svg.left),
      y: (e.pageY - svg.top)
  }
}