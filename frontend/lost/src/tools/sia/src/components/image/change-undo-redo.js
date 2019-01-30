import { keyboard, state } from "l3p-frontend"


export function undo($event){
    if(keyboard.isShortcutHit($event, {
        mod: "Control",
        key: "Z",
    })){
        $event.preventDefault()
        state.undo()
    }
}
export function redo($event){
    if(keyboard.isShortcutHit($event, {
        mod: ["Control", "Shift"],
        key: "Z",
    })){
        $event.preventDefault()
        state.redo()
    }
}