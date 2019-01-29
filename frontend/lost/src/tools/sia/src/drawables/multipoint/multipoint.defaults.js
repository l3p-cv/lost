import appModel from "siaRoot/appModel"

export default {
	getStrokeWidth(){
		const min = 1
		const max = 4
		let width = appModel.ui.zoom.value * max
		width = width < min ? min : width
		width = width > max ? max : width
		return width
	},
	getCursorPadding(){
		const min = 4
		const max = 14
		let padding = appModel.ui.zoom.value * max
		padding = padding < min ? min : padding
		padding = padding > max ? max : padding
		return padding
	},
}
