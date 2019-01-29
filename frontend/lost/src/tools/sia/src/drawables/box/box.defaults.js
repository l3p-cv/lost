import appModel from "siaRoot/appModel"

export default {
    bounds: {
        x: 0,
        y: 0,
    },
    border: {
        colorActiveEdge: "#fff",
    },
	getStrokeWidth(){
		const min = 1
		const max = 4
		let width = appModel.ui.zoom.value * max
		width = width < min ? min : width
		width = width > max ? max : width
		return width
	},
}
