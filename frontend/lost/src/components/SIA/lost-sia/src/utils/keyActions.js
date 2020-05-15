export const EDIT_LABEL='editLabel'
export const DELETE_ANNO='deleteAnno'
export const ENTER_ANNO_ADD_MODE='enterAnnoAddMode'
export const LEAVE_ANNO_ADD_MODE='leaveAnnoAddMode'
export const UNDO='undo'
export const REDO='redo'
export const TRAVERSE_ANNOS='traverseAnnos'

class KeyMapper{
    constructor(keyActionHandler=undefined){
        this.controlDown = false
        this.keyActionHandler = keyActionHandler
    }

    keyDown(key){
        switch (key){
            case 'Enter':
                this.triggerKeyAction(EDIT_LABEL)
                break
            case 'Delete':
                this.triggerKeyAction(DELETE_ANNO)
                break
            case 'Backspace':
                this.triggerKeyAction(DELETE_ANNO)
                break
            case 'Control':
                this.controlDown = true
                this.triggerKeyAction(ENTER_ANNO_ADD_MODE)
                break
            case 'z':
                if (this.controlDown){
                    this.triggerKeyAction(UNDO)
                }
                break
            case 'r':
                if (this.controlDown){
                    this.triggerKeyAction(REDO)
                }
                break
            case 'Tab':
                this.triggerKeyAction(TRAVERSE_ANNOS)
                break
            default:
                break
        }
    }

    keyUp(key){
        switch (key){
            case 'Control':
                this.controlDown = false
                this.triggerKeyAction(LEAVE_ANNO_ADD_MODE)
                break
            default:
                break
        }
    }

    triggerKeyAction(keyAction){
        if (this.keyActionHandler){
            this.keyActionHandler(keyAction)
        }
    }

}

export default KeyMapper