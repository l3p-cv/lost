import * as math from "shared/math"


export const drawable = undefined
// drawable.instance = undefined
// drawable.padding = 
export const display = {
    label: true,
    bar: true,
}
export const bar = {}
bar.width = 100
bar.height = 20
bar.minWidth = math.floorEven(50) 
// @rename: 'borderThickness'
bar.borderWidth = math.floorEven(2)
bar.position = { x: 0, y: 0 } 
bar.iconSize = bar.height
bar.labelHideThreshold = bar.width - bar.iconSize - (2 * bar.borderWidth) 
bar.label = {}
bar.label.text = ""
bar.label.padding = 4
bar.label.fontSize = bar.height - bar.label.padding - 2
export const label = {}
label.text = ""
label.fontSize = 12
// @rename: 'drawableMargin'
label.barMargin = 6
label.padding = 2
label.position = { x: 0, y: 0 }
// label.color
// label.backgroundColor