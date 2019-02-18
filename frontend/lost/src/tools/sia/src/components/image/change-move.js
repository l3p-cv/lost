import { mouse, keyboard } from "l3p-frontend"

import appModel from "siaRoot/appModel"


let frameRequestDrawableMove = undefined
export function keyMoveDrawable($event, drawable){
	if(frameRequestDrawableMove !== undefined) cancelAnimationFrame(frameRequestDrawableMove)

	// @QUICKFIX: don't move if switching to next or prev image via keyboard shortcut.
	if(keyboard.isModifierHit($event, ["Ctrl", "Alt"])){
		return
	}

	// prevent browser from scrolling if using arrow keys.
	if(keyboard.isKeyHit($event, ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"])){
		$event.preventDefault()
	}

	let moveStep = undefined
	if(keyboard.isModifierHit($event, "Shift", { strict: false })){
		moveStep = appModel.controls.moveStepFast
		appModel.controls.currentMoveStep = moveStep
	} else {
		moveStep = appModel.controls.moveStep
		appModel.controls.currentMoveStep = moveStep
	}
	
	// execute move, direction depends on key.
	try {
		frameRequestDrawableMove = requestAnimationFrame(()=>{
			// hide cursor while moving and reset it afterwards
			mouse.setGlobalCursor(mouse.CURSORS.NONE.class, {
				noPointerEvents: true,
				noSelection: true,
			})
			// hide multipoint drawable point while moving it
			if(drawable.parent){
				drawable.hide()
			}
			switch ($event.key) {
				case "w":
				case "W":
				case "ArrowUp":
					drawable.move({ y: -moveStep })
					break
				case "s":
				case "S":
				case "ArrowDown":
					drawable.move({ y: moveStep })
					break
				case "d":
				case "D":
				case "ArrowRight":
					drawable.move({ x: moveStep })
					break
				case "a":
				case "A":
				case "ArrowLeft":
					drawable.move({ x: -moveStep })
					break
				default: 
					frameRequestDrawableMove = undefined
					return
			}
			drawable.setChanged()
			$(window).one("keyup", () => {
				mouse.unsetGlobalCursor()
				// show multipoint drawable point after moving it
				if(drawable.parent){
					drawable.show()
				}
			})
		})
	} catch(error) {
		console.error(error.message)
		throw error
	} finally {
		frameRequestDrawableMove = undefined
	}
}