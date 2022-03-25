export const EDIT_LABEL='editLabel'
export const DELETE_ANNO='deleteAnno'
export const ENTER_ANNO_ADD_MODE='enterAnnoAddMode'
export const LEAVE_ANNO_ADD_MODE='leaveAnnoAddMode'
export const UNDO='undo'
export const REDO='redo'
export const TRAVERSE_ANNOS='traverseAnnos'
export const CAM_MOVE_UP='camMoveUp'
export const CAM_MOVE_DOWN='camMoveDown'
export const CAM_MOVE_LEFT='camMoveLeft'
export const CAM_MOVE_RIGHT='camMoveRight'
export const CAM_MOVE_STOP='camMoveStop'
export const COPY_ANNOTATION='copyAnnotation'
export const PASTE_ANNOTATION='pasteAnnotation'
export const RECREATE_ANNO='recreateAnnotation'
export const DELETE_ANNO_IN_CREATION='deleteAnnoInCreation'
export const TOGGLE_ANNO_COMMENT_INPUT='toggleAnnoCommentInput'

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
            case 'w':
                this.triggerKeyAction(CAM_MOVE_UP)
                break
            case 's':
                this.triggerKeyAction(CAM_MOVE_DOWN)
                break
            case 'a':
                this.triggerKeyAction(CAM_MOVE_LEFT)
                break
            case 'd':
                this.triggerKeyAction(CAM_MOVE_RIGHT)
                break
            case 'e':
                this.triggerKeyAction(RECREATE_ANNO)
                break
            case 'c':
                if (this.controlDown){
                    this.triggerKeyAction(COPY_ANNOTATION)
                } else {
                    this.triggerKeyAction(TOGGLE_ANNO_COMMENT_INPUT)
                }
                break
            case 'v':
                if (this.controlDown){
                    this.triggerKeyAction(PASTE_ANNOTATION)
                }
                break
            case 'Escape':
                this.triggerKeyAction(DELETE_ANNO_IN_CREATION)
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