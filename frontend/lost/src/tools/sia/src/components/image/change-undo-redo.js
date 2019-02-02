import { keyboard, state } from "l3p-frontend"


function undo($event){
    if(keyboard.isShortcutHit($event, {
        mod: "Control",
        key: "Z",
    })){
        $event.preventDefault()
        state.undo()
    }
}
function redo($event){
    if(keyboard.isShortcutHit($event, {
        mod: ["Control", "Shift"],
        key: "Z",
    })){
        $event.preventDefault()
        state.redo()
    }
}

export function enableUndoRedo(config){
	disableUndoRedo()
	if(config.actions.drawing || config.actions.edit.bounds || config.actions.edit.delete){
		$(window).on("keydown.undo", undo)
		$(window).on("keydown.redo", redo)
	}
}
export function disableUndoRedo(){
	$(window).off("keydown.undo", undo)
	$(window).off("keydown.redo", redo)
}