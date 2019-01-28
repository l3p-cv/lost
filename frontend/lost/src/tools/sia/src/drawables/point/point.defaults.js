import appModel from "siaRoot/appModel"

export default {
	minRadius: 1,
	maxRadius: 3,
	getRadius(isNoAnnotation){
		let radius = appModel.ui.zoom.value * this.maxRadius
		radius = radius < this.minRadius ? this.minRadius : radius
		radius = radius > this.maxRadius ? this.maxRadius : radius
		return radius
	},
	getOutlineRadius(isNoAnnotation){
		const minOffset = 1.5
		const maxOffset = 4
		
		let offset = appModel.ui.zoom.value * maxOffset
		offset = offset < minOffset ? minOffset : offset
		offset = offset > maxOffset ? maxOffset : offset

		let radius = this.getRadius()
		
		return radius + offset
	},
	getStrokeWidth(){
		const min = 1
		const max = 4
		let width = appModel.ui.zoom.value * max
		width = width < min ? min : width
		width = width > max ? max : width
		return width
	},
	opacity: {
		selected: {
			fill: 0,
			stroke: 1,
		},
		notSelected: {
			fill: 0.8,
			stroke: 0.6,
		}
	}
}
