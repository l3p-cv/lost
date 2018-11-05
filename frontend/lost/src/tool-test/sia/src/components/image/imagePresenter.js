import { keyboard, mouse, state, Observable } from "l3p-core"
// import { keyboard, state, Observable } from "l3p-core"
// import { keyboard, state } from "l3p-core"
// import * as mouse from "../../../../../../l3p-frontend-core/src/lib/input/mouse"
import * as SVG from "drawables/svg"
import * as color from "shared/color"

import { STATE } from "drawables/drawable.statics"
import BoxPresenter from "drawables/box/BoxPresenter"
import PointPresenter from "drawables/point/PointPresenter"
import MultipointPresenter from "drawables/multipoint/MultipointPresenter"
import DrawablePresenter from "drawables/DrawablePresenter"

import appModel from "../../appModel"
import * as imageView from "./imageView"

import objectAssignDeep from "@cartok/object-assign-deep"
import * as math from "shared/math"


appModel.config.on("update", config => {
    enableSelect()
    enableDelete()
    appModel.controls.creationEvent.on("change", (isActive) => {
        if(!isActive){
            enableSelect()
            enableDelete()
        } else {
            disableSelect()
            disableDelete()
        }
    })

    // if drawing is allowed new drawables may be created, changed, labeled, deleted
    // if previously (different annotation "session") created drawables exist editing change is only allowed if bounds is true (appmodel.config.value.actions.edit.bounds)
    // initially enable
    if(appModel.isADrawableSelected()){
        enableChange(appModel.getSelectedDrawable())
    }
    appModel.state.selectedDrawable.on("update", enableChange)
    appModel.state.selectedDrawable.on(["before-update", "reset"], disableChange)
    // enable redo and undo
    $(window).on("keydown.undo", undo)
    $(window).on("keydown.redo", redo)
    // toggle
    appModel.controls.creationEvent.on("change", (isActive) => {
        if(!isActive){
            // initially enable
            if(appModel.isADrawableSelected()){
                enableChange(appModel.getSelectedDrawable())
            }
            appModel.state.selectedDrawable.on("update", enableChange)
            appModel.state.selectedDrawable.on(["before-update", "reset"], disableChange)
            // enable redo and undo
            $(window).on("keydown.undo", undo)
            $(window).on("keydown.redo", redo)
        } else {
            // initially disable
            if(appModel.isADrawableSelected()){
                disableChange(appModel.getSelectedDrawable())
            }
            appModel.state.selectedDrawable.off("update", enableChange)
            appModel.state.selectedDrawable.off(["before-update", "reset"], disableChange)
            // disable redo and undo
            $(window).off("keydown.undo")
            $(window).off("keydown.redo")
        }
    })
})

appModel.data.image.url.on("update", (url) => imageView.updateImage(url))
appModel.data.image.info.on("update", (info) => imageView.updateInfo(info))
Object.values(appModel.state.drawables).forEach(observable => {
    observable.on("update", (drawables) => addDrawables(drawables))
    observable.on("reset", (drawables) => removeDrawables(drawables))
    observable.on("add", (drawable) => addDrawable(drawable))
    observable.on("remove", (drawable) => removeDrawable(drawable))
})

appModel.state.boxEventActive.on("update", boxEventInfo => {
    Object.values(appModel.state.drawables).forEach(list => {
        list.value.forEach(drawable => {
            // problem here is:
            // - if i have a drawable selected
            //   and i create a new drawable
            //   isActive gets triggered but the currently selected drawable stays the same
            // > but i need this rule to prevent "flickering" if a drawable is selected
            // => i could pass an object to boxEventActive with the info about the event
            //    or just pass the event name:
            //    1. { isActive: true, eventType: "create" }
            //    1. { isActive: true, eventType: "change" }
            const { isActive, eventType } = boxEventInfo
            if(drawable.model.isSelected === false || eventType === "create"){
                if(isActive === true){
                    $(drawable.view.rootNode).off("mouseenter")
                    $(drawable.view.rootNode).off("mouseleave")                        
                } else {
                    $(drawable.view.rootNode).on("mouseenter", () => drawable.hover())
                    $(drawable.view.rootNode).on("mouseleave", () => drawable.unhover())                        
                }
            }
        })   
    })
})


$(imageView.html.refs["sia-delete-junk-btn"]).on("click", $event => {
    alert("Function not completely implemented.")
})

export const image = imageView.image
appModel.ui.resized.on("update", () => {
    createDrawables(appModel.data.drawables.value)
})
imageView.image.addEventListener("load", () => {   
    const { colorMap } = color.getColorTable(
        imageView.image,
        appModel.data.labelList.value,
        { accuracy: 2 }
    )

    appModel.state.colorTable = colorMap
    
    // the default move step  is 1px, the fast move step depends on current image display size.
    appModel.controls.moveStepFast = Math.ceil(appModel.controls.moveStep * (imageView.getWidth() * imageView.getHeight() * 0.00001))
    if(JSON.parse(sessionStorage.getItem("sia-first-image-loaded"))){
        document.getElementById("sia-drawer-panel").scrollIntoView(true)
    } else {
        document.body.scrollIntoView(true)
        sessionStorage.setItem("sia-first-image-loaded", JSON.stringify(true))
    }
}, false)


// ZOOM
// =============================================================================================
const svg = imageView.html.ids["sia-imgview-svg"]
const zoomFactor = 0.05
const minZoom = 1
const maxZoom = 0.3
const minZoomLevel = 0
const maxZoomLevel = (minZoom / zoomFactor) - 1
let zoomLevel = 0
let oldZoom = 1
let newZoom = undefined
// reset zoom when switching between images (data updates), was needed for camera
appModel.data.drawables.on("update", () => {
    zoomLevel = 0
    oldZoom = 1
    newZoom = undefined
})

$(svg).on("wheel", $event => {
    $event.preventDefault()
    const up = $event.originalEvent.deltaY < 0
    const down = !up
    
    // varies with zoom
    const svgWidth = parseInt(svg.getAttribute("width"))
    const svgHeight = parseInt(svg.getAttribute("height"))

    let mousepos = mouse.getMousePosition($event, svg)
    if(up && (oldZoom <= maxZoom) || down && (zoomLevel <= minZoomLevel) || up && (zoomLevel >= maxZoomLevel)){
        // console.warn("NO EXEC")
        mousepos = undefined
        return
    }

    // in: decrease svg viewbox
    if(up){
        zoomLevel++
        // @deactivation: see comment in l3p-frontend-core/input/mouse unsetGlobalCursor()
        // mouse.setGlobalCursor(mouse.CURSORS.ZOOM_IN)
        // setTimeout(mouse.unsetGlobalCursor, 100)
    }
    // out: increase svg viewbox
    else if (down){
        zoomLevel--
        // @deactivation: see comment in l3p-frontend-core/input/mouse unsetGlobalCursor()
        // mouse.setGlobalCursor(mouse.CURSORS.ZOOM_OUT)
        // setTimeout(mouse.unsetGlobalCursor, 100)
    }
    newZoom = Math.ceil((1 - zoomFactor * zoomLevel) * 100) / 100
    appModel.ui.zoom.update(newZoom)
    mousepos = {
        x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / oldZoom)) * oldZoom,
        y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / oldZoom)) * oldZoom,
    }
    SVG.setViewBox(svg, {
        x: mousepos.x * (1 - newZoom),
        y: mousepos.y * (1 - newZoom),
        w: svgWidth * newZoom,
        h: svgHeight * newZoom,
    })
    oldZoom = newZoom
})
imageView.image.addEventListener("load", () => {
    appModel.data.image.rawLoadedImage.update(imageView.image)
})
// =============================================================================================

// CAMERA
// =============================================================================================
// initially enable camera feature
enableCamera()
// toggle camera feature
appModel.controls.creationEvent.on("update", creationActive => {
    if(creationActive){
        disableCamera()
    } else {
        enableCamera()
    }
})
function enableCamera(){
    const cameraEnabled = new Observable(false)
    // add cursors
    cameraEnabled.on("update", (enabled) => {
        if(enabled){
            // console.log("KEY: setting initial mousecursor")
            mouse.setGlobalCursor(mouse.CURSORS.ALL_SCROLL, {
                noPointerEvents: false,
                noSelection: true,
            })
        } else {
            // console.log("KEY: resetting initial mousecursor")
            mouse.unsetGlobalCursor()
        }
    })
    // enable camera
    $(window).on("keydown.camera", $event => {
        // dont use default browser behaviour on spacebar (scroll down)
        $event.preventDefault()
        // quickfixed. event still fireing unneded
        if(!cameraEnabled.value && keyboard.isKeyHit($event, "space")){
            // console.log("enable camera")
            disableChange()
            disableSelect()
            cameraEnabled.update(true)
        }
    })
    // disable camera
    $(window).on("keyup.camera", $event => {
        // quickfixed. event still fireing unneded (@cameraEnabled)
        if(cameraEnabled.value && keyboard.isKeyHit($event, "space")){
            // console.log("disable camera")
            if(appModel.config.value.actions.edit.bounds){
                enableChange()
            }
            enableSelect()
            cameraEnabled.update(false)
        }
    })
    // start
    let lastCameraUpdateCall = undefined
    $(svg).on("mousedown.camera", $event => {
        if(!mouse.button.isLeft($event.button)){
            return
        }
        // quickfixed. event still fireing unneded (@cameraEnabled)
        if(zoomLevel > 0 && (cameraEnabled.value || !$event.target.closest(".drawable"))){
            // console.log("enable")
            // console.log("MOUSE: setting initial mousecursor")
            mouse.setGlobalCursor(mouse.CURSORS.ALL_SCROLL, {
                noPointerEvents: true,
                noSelection: true,
            })

            let mousePrev = mouse.getMousePosition($event, svg)
            let mouseCurr = mouse.getMousePosition($event, svg)
            // move
            $(window).on("mousemove.camera", $event => {
                // console.log("move")
                mouseCurr = mouse.getMousePosition($event, svg)
                let distance = {
                    x: mousePrev.x - mouseCurr.x,
                    y: mousePrev.y - mouseCurr.y,
                }
                // smooth animation
                if(lastCameraUpdateCall !== undefined){
                    cancelAnimationFrame(lastCameraUpdateCall)
                }
                // execute
                if(distance.x !== 0 || distance.y !== 0){
                    lastCameraUpdateCall = requestAnimationFrame(() => {
                        const svgWidth = parseInt(svg.getAttribute("width"))
                        const svgHeight = parseInt(svg.getAttribute("height"))
                        const vbXMax = svgWidth * (1 - newZoom)
                        const vbYMax = svgHeight * (1 - newZoom)
                        const viewBox = svg.getAttribute("viewBox").split(" ")
                    
                        let xDest = parseInt(viewBox[0]) + (distance.x * (vbXMax/svgWidth) * newZoom)
                        let yDest = parseInt(viewBox[1]) + (distance.y * (vbYMax/svgHeight) * newZoom)
                    
                        xDest = xDest < 0 ? 0 : xDest
                        yDest = yDest < 0 ? 0 : yDest
                        xDest = xDest > vbXMax ? vbXMax : xDest
                        yDest = yDest > vbYMax ? vbYMax : yDest

                        SVG.setViewBox(svg, {
                            x: xDest,
                            y: yDest,
                        })
                        
                        mousePrev = mouseCurr
                    })
                }
            })
            // stop move
            $(window).one("mouseup", $event => {
                if(mouse.button.isLeft($event.button)){
                    // console.log("stop")
                    // console.log("MOUSE: resetting initial mousecursor")
                    mouse.unsetGlobalCursor()
                    $(window).off("mousemove.camera")
                }
            })
        }
    })
}
function disableCamera(){
    $(window).off("keydown.camera")
    $(window).off("keyup.camera")
    $(svg).off("mousedown.camera")
}


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
function enableSelect(){
    // console.warn("enable select")
    // mouse
    let unselect = false
    $(imageView.html.ids["sia-imgview-svg-container"]).on("click.selectDrawable", ($event) => {
        // return on right or middle mouse button, prevent context menu.
        if (!mouse.button.isLeft($event.button)) {
            $event.preventDefault()
            return
        }
        let drawable = $event.target.closest(".drawable")
        if(drawable){
            drawable = drawable.drawablePresenter
            if(drawable instanceof DrawablePresenter){
                selectDrawable(drawable)
            }
        }
    })
    $(imageView.html.ids["sia-imgview-svg-container"]).on("mousedown.resetSelectionStart", ($event) => {
        // return on right or middle mouse button, prevent context menu.
        if (!mouse.button.isLeft($event.button)) {
            $event.preventDefault()
            return
        }
        if(appModel.isADrawableSelected()){            
            let next = $event.target.closest(".drawable")
            next = (next !== null) ? next.drawablePresenter : undefined
            if (!next){
                unselect = true
            } else {
                unselect = false
            }
        }
    })
    $(window).on("mouseup.resetSelectionEnd", ($event) => {
        // return on right or middle mouse button, prevent context menu.
        if(!mouse.button.isLeft($event.button)) {
            $event.preventDefault()
            return
        }
        if(appModel.isADrawableSelected()){
            // @WORKAROUND: firefox bug? HTMLDocument does not inherit from HTMLElement (spec) => no closest() method. 
            let next = undefined
            try {
                next = $event.target.closest(".drawable")
            } catch(e){
                next = null
            }
            next = (next !== null) ? next.drawablePresenter : undefined
            if(unselect && !next){
                resetSelection()
            }
            unselect = false
        }
    })
    // key
    $(window).on("keydown.selectDrawable", ($event) => {
        // important:
        // we use the drawable index array instead of the raw data.
        // deleted drawables should not be selected.
        if(keyboard.isKeyHit($event, "Tab")) {
            $event.stopPropagation()
            $event.preventDefault()

            if(appModel.hasDrawables()){
                // a variable containing the index of the next drawable of 'drawableIds'.
                let nextIndex = -1

                // if a drawables is selected, select the next drawable.
                // if user pressed shift select the previous drawable if any.
                // unselect the selected drawable.
                if(appModel.isADrawableSelected()){
                    let selectedDrawable = appModel.getSelectedDrawable()
                    // just return if only one drawable exist and is allready selected.
                    if(appModel.state.drawableIdList.length === 1){
                        return
                    }
                    if(selectedDrawable.parent){
                        selectedDrawable = selectedDrawable.parent
                    }
                    let currentDrawableIndex = appModel.getDrawableIndex(selectedDrawable)
                    selectedDrawable.unselect()
                    if(keyboard.isModifierHit($event, "Shift")){
                        nextIndex = currentDrawableIndex >= 1
                            // the previous index
                            ? currentDrawableIndex - 1
                            // the last index
                            : appModel.state.drawableIdList.length - 1
                        nextIndex = nextIndex === -1 
                            ? 0
                            : nextIndex
                    } else {
                        // the next or first
                        nextIndex = (currentDrawableIndex + 1) % appModel.state.drawableIdList.length
                    }
                }
                // else if no drawable is selected
                else {
                    // if a drawable was selected before use its index.
                    if(appModel.state.selectedDrawableId){
                        nextIndex = appModel.state.drawableIdList.indexOf(appModel.state.selectedDrawableId)
                        nextIndex = nextIndex === -1 
                            ? 0
                            : nextIndex
                    }
                    // else no drawable was selected before, use index 0 to select the drawable that was added first.
                    else {
                        nextIndex = 0
                    }
                }
                // find the actual drawable in the model data by id, using the index, and execute selection.
                const nextId = appModel.state.drawableIdList[nextIndex]
                const next = appModel.getDrawableById(nextId)
                selectDrawable(next)

                // align browser view. 
                document.getElementById("sia-drawer-panel").scrollIntoView(true)
            }
        }
    })
    $(window).on("keydown.resetSelection", ($event) => {
        if (keyboard.isKeyHit($event, "Escape")){
            if(appModel.isADrawableSelected()){
                $event.preventDefault()
                resetSelection()
            }
        }
    })    
}
function disableSelect(){
    // console.warn("disable select")
    // mouse
    $(imageView.html.ids["sia-imgview-svg-container"]).off("click.selectDrawable")
    $(imageView.html.ids["sia-imgview-svg-container"]).off("mousedown.resetSelectionStart")
    $(window).off("mouseup.resetSelectionEnd")
    // Key
    $(window).off("keydown.selectDrawable")
    $(window).off("keydown.resetSelection")
}
function enableDelete(){
    $(window).on("keydown.drawableDelete", ($event) => {
        if(keyboard.isKeyHit($event, "Delete")) {
            if(appModel.isADrawableSelected()) {
                $event.preventDefault()
                const selectedDrawable = appModel.getSelectedDrawable()
                if(selectedDrawable.isDeletable()){
                    // console.warn("enabled mouse delete handler")
                    // for multipoint drawables:
                    if(selectedDrawable.parent){
                        if(selectedDrawable.parent.model.type === "line"){
                            if(selectedDrawable.parent.model.points.length <= 2) return
                        } else if(selectedDrawable.parent.model.type === "polygon"){
                            if(selectedDrawable.parent.model.points.length <= 3) return
                        }
                        /*
                            DEACTIVATED CAUSE NEEDED TO DEACTIVATE LINE POINT ADD/INSERT REDO UNDO:
                            state.add({
                                do: {
                                    data: {
                                        pointIndex: selectedDrawable.parent.model.points.indexOf(selectedDrawable),
                                        parent: selectedDrawable.parent,
                                    },
                                    fn: (data) => {
                                        const { pointIndex, parent } = data
                                        parent.removePoint(parent.model.points[pointIndex])
                                        const pointToSelect = parent.pointSelectionList.getTailNode().getData()
                                        selectDrawable(pointToSelect)
                                    }
                                }, 
                                undo: {
                                    data: {
                                        relPosition: {
                                            x: selectedDrawable.getX() / imageView.getWidth(),
                                            y: selectedDrawable.getY() / imageView.getHeight(),
                                        },
                                        parent: selectedDrawable.parent,
                                        action: selectedDrawable.parent.model.points.indexOf(selectedDrawable) === 0 
                                                || selectedDrawable.parent.model.points.indexOf(selectedDrawable) === selectedDrawable.parent.model.points.length - 1
                                                    ? "add"
                                                    : "insert"
                                    },
                                    fn: (data) => {
                                        const { relPosition, parent, action } = data
                                        const absPosition = {
                                            x: relPosition.x * imageView.getWidth(),
                                            y: relPosition.y * imageView.getHeight(),
                                        }
                                        const insertedPoint = parent.insertPoint(absPosition, action)
                                        selectDrawable(insertedPoint)
                                    }
                                }
                            })
                        */
                        selectedDrawable.parent.removePoint(selectedDrawable)
                        const pointToSelect = selectedDrawable.parent.pointSelectionList.getTailNode().getData()
                        selectDrawable(pointToSelect)
                    } 
                    // for drawables:
                    else {
                        // add redo and undo
                        state.add(new state.StateElement({
                            do: {
                                data: { drawable: selectedDrawable },
                                fn: (data) => {
                                    data.drawable.delete()
                                    appModel.deleteDrawable(data.drawable)
                                }
                            },
                            undo: {
                                data: { drawable: selectedDrawable },
                                fn: (data) => {
                                    appModel.addDrawable(data.drawable)
                                    selectDrawable(data.drawable)
                                }
                            }
                        }))
                        selectedDrawable.delete()
                        appModel.deleteDrawable(selectedDrawable)
                    }
                }
            }
        }
    })
}
function disableDelete(){
    $(window).off("keydown.drawableDelete")
}

export function enableChange(drawable: DrawablePresenter){
    drawable = drawable === undefined ? appModel.getSelectedDrawable() : drawable
    if(drawable instanceof DrawablePresenter){
        if(drawable.isChangable()){
            // console.warn("enabled change handlers")
            let frameRequestDrawableMove = undefined
            const keyMoveDrawable = ($event, drawable) => {
                if (frameRequestDrawableMove !== undefined) cancelAnimationFrame(frameRequestDrawableMove)

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
                        console.log("EXEC",moveStep)
                        $(window).one("keyup", () => mouse.unsetGlobalCursor())
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
                    })
                } catch(error) {
                    console.error(error.message)
                    throw error
                } finally {
                    frameRequestDrawableMove = undefined
                }
                // mouse.unsetGlobalCursor()
            }
            const handleMultipointPointInsertion = ($event, drawable, mode) => {
                mouse.setGlobalCursor(mouse.CURSORS.CREATE.class)
                $(imageView.html.ids["sia-imgview-svg-container"]).on("mousedown.lineInsertPoint", ($event) => {
                    if(!mouse.button.isRight($event.button)) {
                        $event.preventDefault()
                        return
                    }
                    // this key check looks like it is just duplication but it is not.
                    if(keyboard.isModifierHit($event, "Control")){
                        let mousepos = mouse.getMousePosition($event, imageView.html.ids["sia-imgview-svg-container"])
                        // calculate the real mouseposition (@zoom)
                        const zoom = appModel.ui.zoom.value
                        mousepos = {
                            x: (mousepos.x + (SVG.getViewBoxX(imageView.html.ids["sia-imgview-svg"]) * 1 / zoom)) * zoom,
                            y: (mousepos.y + (SVG.getViewBoxY(imageView.html.ids["sia-imgview-svg"]) * 1 / zoom)) * zoom,
                        }
                        const point = drawable.insertPoint(mousepos)
                        if(point){
                            /*
                                DEACTIVATED CAUSE COMPLICATED:
                                Need to work on MultipointPresenter for this to function.
                                A "move" command can not be redone after readding the point with this.<>>
                                state.add({
                                    do: {
                                        data: { point, drawable },
                                        fn: (data) => {
                                            const { point, drawable } = data
                                            drawable.insertPoint(point, "insert", point.insertionIndex)
                                            drawable.setChanged()
                                            selectDrawable(point)
                                        }
                                    },
                                    undo: {
                                        data: { drawable },
                                        fn: (data) => {
                                            const { drawable } = data
                                            drawable.removePoint(drawable.pointSelectionList.getTailNode().getData())
                                        }
                                    }
                                })
                            */
                            drawable.setChanged()
                            selectDrawable(point)
                        }
                    }
                })
                $(window).on("keyup.lineInsertPointEnd", ($event) => {
                    // @KEYBOARD: isModifierHit (checking modifiers) wont work here! modifier needs to be detected via key!
                    // this key check looks like it is just duplication but it is not.
                    if(keyboard.isKeyHit($event, "Control")){
                        mouse.unsetGlobalCursor()
                        $(imageView.html.ids["sia-imgview-svg-container"]).off("mousedown.lineInsertPoint")
                        $(window).off("keyup.lineInsertPointEnd")
                    }
                })
            }
            const handleLinePointAdd = ($event, drawable) => {
                mouse.setGlobalCursor(mouse.CURSORS.CREATE.class)
                $(imageView.html.ids["sia-imgview-svg-container"]).on("mousedown.lineInsertPoint", ($event) => {
                    if (!mouse.button.isRight($event.button)) {
                        $event.preventDefault()
                        return
                    }
                    // this key check looks like it is just duplication but it is not.            
                    if(keyboard.isModifierHit($event, "Alt", true)){
                        let mousepos = mouse.getMousePosition($event, imageView.html.ids["sia-imgview-svg-container"])
                        // calculate the real mouseposition (@zoom)
                        const zoom = appModel.ui.zoom.value
                        mousepos = {
                            x: (mousepos.x + (SVG.getViewBoxX(imageView.html.ids["sia-imgview-svg"]) * 1 / zoom)) * zoom,
                            y: (mousepos.y + (SVG.getViewBoxY(imageView.html.ids["sia-imgview-svg"]) * 1 / zoom)) * zoom,
                        }
                        const point = drawable.insertPoint(mousepos, "add")
                        if(point){
                            drawable.setChanged()
                            selectDrawable(point)
                        }
                    }
                })
                $(window).on("keyup.lineInsertPointEnd", ($event) => {
                    // this key check looks like it is just duplication but it is not.            
                    if(keyboard.isKeyHit($event, "Alt")){
                        mouse.unsetGlobalCursor()
                        $(imageView.html.ids["sia-imgview-svg-container"]).off("mousedown.lineInsertPoint")
                        $(window).off("keyup.lineInsertPointEnd")
                    }
                })
            }
            switch(drawable.getClassName()){
                case "PointPresenter":
                    // mouse
                    var mouseStart = undefined
                    var mousePrev = undefined
                    var mousepos = undefined
                    var stateElement = undefined
                    var savedStartState = false
                    $(drawable.view.html.root).on("mousedown.movePointStart", ($event) => {
                        // return on right or middle mouse button, prevent context menu.
                        if (!mouse.button.isLeft($event.button)) {
                            $event.preventDefault()
                            return
                        }
                        // console.warn("point change handler (start)")
                        mouseStart = mouse.getMousePosition($event, imageView.html.ids["sia-imgview-svg-container"])
                        // calculate the real mouseposition (@zoom)
                        const svg = imageView.html.ids["sia-imgview-svg"]
                        const zoom = appModel.ui.zoom.value
                        mouseStart = {
                            x: (mouseStart.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                            y: (mouseStart.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                        }
                        stateElement = new state.StateElement()
                        $(window).on("mousemove.movePointUpdate", ($event) => {
                            // hide the point while moving
                            if(drawable.parent){
                                drawable.hide()
                            }
                            // console.warn("point change handler (update)")
                            mouse.setGlobalCursor(mouse.CURSORS.NONE.class, {
                                noPointerEvents: true,
                                noSelection: true,
                            })
                            mousePrev = (mousePrev === undefined) ? mouseStart : mousepos
                            mousepos = mouse.getMousePosition($event, imageView.html.ids["sia-imgview-svg-container"])
                            // calculate the real mouseposition (@zoom)
                            const svg = imageView.html.ids["sia-imgview-svg"]
                            const zoom = appModel.ui.zoom.value
                            mousepos = {
                                x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                                y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                            }
                            if(!savedStartState){
                                stateElement.addUndo({
                                    data: {
                                        x: drawable.getX() / imageView.getWidth(),
                                        y: drawable.getY() / imageView.getHeight(),
                                    },
                                    fn: (data) => {
                                        selectDrawable(drawable)
                                        drawable.setPosition({
                                            x: data.x * imageView.getWidth(),
                                            y: data.y * imageView.getHeight(),
                                        })
                                    } 
                                })
                                savedStartState = true
                            } 
                            else {
                                drawable.move({
                                    x: mousepos.x - mousePrev.x,
                                    y: mousepos.y - mousePrev.y,
                                })
                            }    
                        })

                        $(window).on("mouseup.movePointEnd", ($event) => {
                            // return on right or middle mouse button, prevent context menu.
                            if (!mouse.button.isLeft($event.button)) {
                                $event.preventDefault()
                                return
                            }
                            // console.warn("point change handler (end)")
                            $(window).off("mousemove.movePointUpdate")
                            $(window).off("mouseup.movePointEnd")
                            // update drawable status and reselect if its a multi-point-annotation point.
                            // show the point when finished moving
                            drawable.setChanged()
                            if(drawable.parent){
                                drawable.parent.setChanged()
                                drawable.show()
                                selectDrawable(drawable)
                                appModel.selectDrawable(drawable)
                            }

                            // finish setting up the 'StateElement'
                            stateElement.addRedo({
                                data: {
                                    x: drawable.getX() / imageView.getWidth(),
                                    y: drawable.getY() / imageView.getHeight(),
                                },
                                fn: (data) => {
                                    selectDrawable(drawable)
                                    drawable.setPosition({
                                        x: data.x * imageView.getWidth(),
                                        y: data.y * imageView.getHeight(),
                                    })
                                }
                            })
                            // make undo redo possible
                            if(!appModel.controls.creationEvent.value){
                                state.add(stateElement)
                            }

                            // reset
                            mouse.unsetGlobalCursor()
                            mouseStart = undefined
                            mousePrev = undefined
                            mousepos = undefined
                            savedStartState = false
                            stateElement = undefined
                        })
                    })

                    // Key
                    $(window).on("keydown.movePoint", $event => {
                        if(keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
                            if(!savedStartState){
                                stateElement = new state.StateElement()
                                // add undo
                                stateElement.addUndo({
                                    data: {
                                        x: drawable.getX() / imageView.getWidth(),
                                        y: drawable.getY() / imageView.getHeight(),
                                    },
                                    fn: (data) => {
                                        selectDrawable(drawable)
                                        drawable.setPosition({
                                            x: data.x * imageView.getWidth(),
                                            y: data.y * imageView.getHeight(),
                                        })
                                    } 
                                })
                                savedStartState = true
                                $(window).one("keyup.movePoint", $event => {
                                    if(keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){   
                                        stateElement.addRedo({
                                            data: {
                                                x: drawable.getX() / imageView.getWidth(),
                                                y: drawable.getY() / imageView.getHeight(),
                                            },
                                            fn: (data) => {
                                                selectDrawable(drawable)
                                                drawable.setPosition({
                                                    x: data.x * imageView.getWidth(),
                                                    y: data.y * imageView.getHeight(),
                                                })
                                            }
                                        })
                                        
                                        if(!appModel.controls.creationEvent.value){
                                            state.add(stateElement)
                                        }
                                        stateElement = undefined
                                        savedStartState = false
                                    }
                                })
                            }
                            keyMoveDrawable($event, drawable)    
                        }
                    })

                    // for multi point points
                    if(drawable.parent){
                        // on [CTRL]
                        $(window).on("keydown.multipointInsertPointStart", ($event) => {
                            if(keyboard.isModifierHit($event, "Control")){
                                handleMultipointPointInsertion($event, drawable.parent)
                            }
                        })
                        if(drawable.parent.model.type === "line"){
                            // on [ALT]
                            $(window).on("keydown.lineAddPointStart", ($event) => {
                                if(keyboard.isModifierHit($event, "Alt")){
                                    handleLinePointAdd($event, drawable.parent)
                                }
                            })
                        }
                    }
                    break
                case "MultipointPresenter":
                    // mouse
                    var mouseStart = undefined
                    var mousePrev = undefined
                    var mousepos = undefined
                    var distance = { x: undefined, y: undefined }
                    var stateElement = undefined
                    var savedStartState = false
                    $(drawable.view.html.root).on("mousedown.moveDrawableStart", ($event) => {
                        // return on right or middle mouse button, prevent context menu.
                        if (!mouse.button.isLeft($event.button)) {
                            $event.preventDefault()
                            return
                        }
                        // console.warn("drawable change handler (start)")
                        mouseStart = mouse.getMousePosition($event, imageView.html.ids["sia-imgview-svg-container"])
                        // calculate the real mouseposition (@zoom)
                        const svg = imageView.html.ids["sia-imgview-svg"]
                        const zoom = appModel.ui.zoom.value
                        mouseStart = {
                            x: (mouseStart.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                            y: (mouseStart.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                        }
                        stateElement = new state.StateElement()

                        $(window).on("mousemove.moveDrawableUpdate", ($event) => {
                            // console.warn("drawable move handler (update)")
                            mouse.setGlobalCursor(mouse.CURSORS.NONE.class, {
                                noPointerEvents: true,
                                noSelection: true,
                            })
                            mousePrev = (mousePrev === undefined) ? mouseStart : mousepos
                            mousepos = mouse.getMousePosition($event, imageView.html.ids["sia-imgview-svg-container"])
                            // calculate the real mouseposition (@zoom)
                            const svg = imageView.html.ids["sia-imgview-svg"]
                            const zoom = appModel.ui.zoom.value
                            mousepos = {
                                x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                                y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                            }
                            if(!savedStartState){
                                stateElement.addUndo({
                                    data: {
                                        x: drawable.getX() / imageView.getWidth(),
                                        y: drawable.getY() / imageView.getHeight(),
                                    },
                                    fn: (data) => {
                                        selectDrawable(drawable)
                                        drawable.setPosition({
                                            x: data.x * imageView.getWidth(),
                                            y: data.y * imageView.getHeight(),
                                        })
                                    } 
                                })
                                savedStartState = true
                            }
                            drawable.move({
                                x: mousepos.x - mousePrev.x,
                                y: mousepos.y - mousePrev.y,
                            })
                        })

                        $(window).on("mouseup.moveDrawableEnd", ($event) => {
                            // return on right or middle mouse button, prevent context menu.
                            if (!mouse.button.isLeft($event.button)) {
                                $event.preventDefault()
                                return
                            }
                            // console.warn("drawable move handler (end)")
                            $(window).off("mousemove.moveDrawableUpdate")
                            $(window).off("mouseup.moveDrawableEnd")
                            
                            // finish setting up the 'StateElement'
                            stateElement.addRedo({
                                data: {
                                    x: drawable.getX() / imageView.getWidth(),
                                    y: drawable.getY() / imageView.getHeight(),
                                },
                                fn: (data) => {
                                    selectDrawable(drawable)
                                    drawable.setPosition({
                                        x: data.x * imageView.getWidth(),
                                        y: data.y * imageView.getHeight(),
                                    })
                                }
                            })
                            // make undo redo possible
                            if(!appModel.controls.creationEvent.value){
                                state.add(stateElement)
                            }

                            // reselect if its a multi-point-annotation point.
                            drawable.setChanged()
                            mouse.unsetGlobalCursor()
                            mouseStart = undefined
                            mousePrev = undefined
                            mousepos = undefined
                            savedStartState = false
                            stateElement = undefined
                        })
                    })

                    // Key
                    $(window).on("keydown.moveDrawable", $event => {
                        if(keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
                            if(!savedStartState){
                                stateElement = new state.StateElement()
                                // add undo
                                stateElement.addUndo({
                                    data: {
                                        x: drawable.getX() / imageView.getWidth(),
                                        y: drawable.getY() / imageView.getHeight(),
                                    },
                                    fn: (data) => {
                                        selectDrawable(drawable)
                                        drawable.setPosition({
                                            x: data.x * imageView.getWidth(),
                                            y: data.y * imageView.getHeight(),
                                        })
                                    } 
                                })
                                savedStartState = true
                                $(window).one("keyup.moveDrawable", $event => {
                                    if(keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
                                        
                                        stateElement.addRedo({
                                            data: {
                                                x: drawable.getX() / imageView.getWidth(),
                                                y: drawable.getY() / imageView.getHeight(),
                                            },
                                            fn: (data) => {
                                                selectDrawable(drawable)
                                                drawable.setPosition({
                                                    x: data.x * imageView.getWidth(),
                                                    y: data.y * imageView.getHeight(),
                                                })
                                            }
                                        })
                                        if(!appModel.controls.creationEvent.value){
                                            state.add(stateElement)
                                        }
                                        stateElement = undefined
                                        savedStartState = false
                                    }
                                })
                            }
                            keyMoveDrawable($event, drawable)    
                        }
                    })

                    // on [CTRL]
                    $(window).on("keydown.multipointInsertPointStart", ($event) => {
                        if(keyboard.isModifierHit($event, "Control")){
                            handleMultipointPointInsertion($event, drawable)
                        }
                    })
                    if(drawable.model.type === "line"){
                        // on [ALT]
                        $(window).on("keydown.lineAddPointStart", ($event) => {
                            if(keyboard.isModifierHit($event, "Alt")){
                                handleLinePointAdd($event, drawable)
                            }
                        })
                    }
                    break
                case "BoxPresenter":
                    // mouse
                    var mouseStart = undefined
                    var mousePrev = undefined
                    var mousepos = undefined
                    var distance = { x: undefined, y: undefined }
                    var stateElement = undefined
                    var savedStartState = false
                    let frameRequestBoxChange = undefined
                    $(drawable.view.html.root).on("mousedown.changeBoxStart", ($event) => {
                        // return on right or middle mouse button, prevent context menu.
                        if (!mouse.button.isLeft($event.button)) {
                            $event.preventDefault()
                            return
                        }
                        // @QUICKFIX: for close button
                        if($event.target.closest(`[data-ref="menubar-close-button"]`)){
                            return
                        }
                        // console.warn("box change handler (start)")
                        
                        // set move cursor if mouse on menubar to move the box.
                        if($event.target.closest(`[data-ref="menu"]`)){
                            drawable.setCursor(mouse.CURSORS.MOVE)
                        }

                        // disable hover effect of all other boxes
                        appModel.state.boxEventActive.update({ isActive: true, type: "change" })
                        
                        // init context
                        mouseStart = mouse.getMousePosition($event, imageView.html.ids["sia-imgview-svg-container"])
                        // calculate the real mouseposition (@zoom)
                        const svg = imageView.html.ids["sia-imgview-svg"]
                        const zoom = appModel.ui.zoom.value
                        mouseStart = {
                            x: (mouseStart.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                            y: (mouseStart.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                        }

                        // set global cursor via class
                        try {
                            mouse.setGlobalCursor(drawable.model.currentCursor.class, {
                                noPointerEvents: true,
                                noSelection: true,
                            })
                        } catch(e){
                            console.error(e)
                            console.log(drawable)
                            console.log(drawable.model)
                            console.log(drawable.view.html)
                        }

                        // add the update function
                        $(window).on("mousemove.changeBoxUpdate", ($event) => {
                            // add undo
                            if(!savedStartState){
                                stateElement = new state.StateElement()
                                stateElement.addUndo({
                                    data: {
                                        x: drawable.getX() / imageView.getWidth(),
                                        y: drawable.getY() / imageView.getHeight(),
                                        w: drawable.getW() / imageView.getWidth(),
                                        h: drawable.getH() / imageView.getHeight(),
                                    },
                                    fn: (data) => {
                                        selectDrawable(drawable)
                                        drawable.setBounds({
                                            x: data.x * imageView.getWidth(),
                                            y: data.y * imageView.getHeight(),
                                            w: data.w * imageView.getWidth(),
                                            h: data.h * imageView.getHeight(),
                                        })
                                    } 
                                })
                                savedStartState = true
                            }
                            if(frameRequestBoxChange !== undefined) cancelAnimationFrame(frameRequestBoxChange)
                            frameRequestBoxChange = requestAnimationFrame(() => {
                                // console.warn("box change handler (update)")
                                // prepare update
                                mousepos = mouse.getMousePosition($event, imageView.html.ids["sia-imgview-svg-container"])
                                // calculate the real mouseposition (@zoom)
                                const svg = imageView.html.ids["sia-imgview-svg"]
                                const zoom = appModel.ui.zoom.value
                                mousepos = {
                                    x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                                    y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                                }
                                mousePrev = (mousePrev) ? mouseStart : mousepos
                                distance.x = mousePrev.x - mousepos.x
                                distance.y = mousePrev.y - mousepos.y
                                // execute update
                                switch (drawable.model.currentCursor.id) {
                                    case mouse.CURSORS.MOVE.id:
                                        // invert distance
                                        distance.x = - distance.x
                                        distance.y = - distance.y
                                        drawable.move(distance)
                                        drawable.setChanged()
                                        break
                                    case mouse.CURSORS.CURSOR_EDGE_BOTTOM.id:
                                        drawable.scaleBottom(distance)
                                        drawable.setChanged()
                                        break
                                    case mouse.CURSORS.CURSOR_EDGE_LEFT.id:
                                        drawable.scaleLeft(distance)
                                        drawable.setChanged()
                                        break
                                    case mouse.CURSORS.CURSOR_EDGE_RIGHT.id:
                                        drawable.scaleRight(distance)
                                        drawable.setChanged()
                                        break
                                    case mouse.CURSORS.CURSOR_EDGE_TOP.id:
                                        drawable.scaleTop(distance)
                                        drawable.setChanged()
                                        break
                                    case mouse.CURSORS.CURSOR_CORNER_TOP_LEFT.id:
                                        drawable.scaleTopLeft(distance)
                                        drawable.setChanged()
                                        break
                                    case mouse.CURSORS.CURSOR_CORNER_TOP_RIGHT.id:
                                        drawable.scaleTopRight(distance)
                                        drawable.setChanged()
                                        break
                                    case mouse.CURSORS.CURSOR_CORNER_BOTTOM_RIGHT.id:
                                        drawable.scaleBottomRight(distance)
                                        drawable.setChanged()
                                        break
                                    case mouse.CURSORS.CURSOR_CORNER_BOTTOM_LEFT.id:
                                        drawable.scaleBottomLeft(distance)
                                        drawable.setChanged()
                                        break
                                }
                                mouseStart = mousepos
                            })
                        })

                        // mouse change (end)
                        $(window).on("mouseup.changeBoxEnd", ($event) => {
                            // return on right or middle mouse button, prevent context menu.
                            if (!mouse.button.isLeft($event.button)) {
                                $event.preventDefault()
                                return
                            }
                            // console.warn("box change handler (end)")
                            $(window).off("mousemove.changeBoxUpdate")
                            $(window).off("mouseup.changeBoxEnd")

                            // reenable hover effect of all other boxes
                            appModel.state.boxEventActive.update({ isActive: false, type: "change" })

                            // add redo
                            // if user does mouse down and up without mousemove, the stateElement won't be cameraInitialized.
                            if(savedStartState){
                                stateElement.addRedo({
                                    data: {
                                        x: drawable.getX() / imageView.getWidth(),
                                        y: drawable.getY() / imageView.getHeight(),
                                        w: drawable.getW() / imageView.getWidth(),
                                        h: drawable.getH() / imageView.getHeight(),
                                    },
                                    fn: (data) => {
                                        selectDrawable(drawable)
                                        drawable.setBounds({
                                            x: data.x * imageView.getWidth(),
                                            y: data.y * imageView.getHeight(),
                                            w: data.w * imageView.getWidth(),
                                            h: data.h * imageView.getHeight(),
                                        })
                                    }
                                })
                                if(!appModel.controls.creationEvent.value){
                                    state.add(stateElement)
                                }
                                savedStartState = false
                                stateElement = undefined
                            }

                            // "reset mouse"
                            mouse.unsetGlobalCursor()
                            mouseStart = undefined
                            mousePrev = undefined
                            mousepos = undefined
                            distance = { x: undefined, y: undefined }          
                        })
                    })

                    // key
                    let frameRequestBoxEdgeScaling = undefined
                    // scale
                    $(window).on("keydown.selectBoxEdge", $event => {
                        if(keyboard.isModifierHit($event, "Alt")){
                            // prevent scrolling when using arrow keys
                            $event.preventDefault()

                            // temporary disable box movement via keyboard
                            $(window).off("keydown.keyMoveBox")

                            // reset edge if space was used
                            $(window).on("keydown.resetEdge", $event => {
                                if (keyboard.isKeyHit($event, ["Space", "Enter", "Tab", "Escape"])){
                                    $(window).off("keydown.resetEdge")
                                    $event.preventDefault()
                                    drawable.resetEdge()
                                    // force re-select (Escape will unselect the drawable)
                                    // this will re-enable box movement via keyboard
                                    selectDrawable(drawable)
                                }
                            })
                            
                            // edge selection
                            if (keyboard.isModifierHit($event, "Alt")) {
                                switch ($event.key) {
                                    case "w":
                                    case "W":
                                    case "ArrowUp":
                                        drawable.selectEdge("top")
                                        break
                                    case "d":
                                    case "D":
                                    case "ArrowRight":
                                        drawable.selectEdge("right")
                                        break
                                    case "s":
                                    case "S":
                                    case "ArrowDown":
                                        drawable.selectEdge("bottom")
                                        break
                                    case "a":
                                    case "A":
                                    case "ArrowLeft":
                                        drawable.selectEdge("left")
                                        break
                                    default: return
                                }
                            }
                        }
                    })
                    $(window).on("keydown.scaleBoxEdge", $event => {
                        let moveStep = undefined
                        if(keyboard.isModifierHit($event, "Shift")){
                            moveStep = appModel.controls.moveStepFast
                            appModel.controls.currentMoveStep = moveStep
                        } else {
                            moveStep = appModel.controls.moveStep
                            appModel.controls.currentMoveStep = moveStep
                        }
                        if(keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
                            
                            $event.preventDefault()
                            if (frameRequestBoxEdgeScaling !== undefined) cancelAnimationFrame(frameRequestBoxEdgeScaling)
                            if(drawable.isEdgeSelected() && keyboard.isModifierNotHit($event, "Alt")){
                                // add undo
                                if(!savedStartState){
                                    stateElement = new state.StateElement()
                                    stateElement.addUndo({
                                        data: {
                                            x: drawable.getX() / imageView.getWidth(),
                                            y: drawable.getY() / imageView.getHeight(),
                                            w: drawable.getW() / imageView.getWidth(),
                                            h: drawable.getH() / imageView.getHeight(),
                                        },
                                        fn: (data) => {
                                            selectDrawable(drawable)
                                            drawable.setBounds({
                                                x: data.x * imageView.getWidth(),
                                                y: data.y * imageView.getHeight(),
                                                w: data.w * imageView.getWidth(),
                                                h: data.h * imageView.getHeight(),
                                            })
                                        } 
                                    })
                                    savedStartState = true
                                } 
                                try {
                                    // scale edge
                                    frameRequestBoxEdgeScaling = requestAnimationFrame(() => {
                                        switch (drawable.getEdge()) {
                                            case "right":
                                                switch ($event.key) {
                                                    case "d":
                                                    case "D":
                                                    case "ArrowRight":
                                                        drawable.setBounds({
                                                            w: drawable.getW() + moveStep,
                                                            x: drawable.getX() + moveStep / 2,
                                                        })
                                                        drawable.setChanged()
                                                        break
                                                    case "a":
                                                    case "A":
                                                    case "ArrowLeft":
                                                        drawable.setBounds({
                                                            w: drawable.getW() - moveStep,
                                                            x: drawable.getX() - moveStep / 2,
                                                        })
                                                        drawable.setChanged()
                                                        break
                                                }
                                                break
                                            case "bottom":
                                                switch ($event.key) {
                                                    case "w":
                                                    case "W":
                                                    case "ArrowUp":
                                                        drawable.setBounds({
                                                            h: drawable.getH() - moveStep,
                                                            y: drawable.getY() - moveStep / 2,
                                                        })
                                                        drawable.setChanged()
                                                        break
                                                    case "s":
                                                    case "S":
                                                    case "ArrowDown":
                                                        drawable.setBounds({
                                                            h: drawable.getH() + moveStep,
                                                            y: drawable.getY() + moveStep / 2,
                                                        })
                                                        drawable.setChanged()
                                                        break
                                                }
                                                break
                                            case "top":
                                                switch ($event.key) {
                                                    case "w":
                                                    case "W":
                                                    case "ArrowUp":
                                                        drawable.setBounds({
                                                            h: drawable.getH() + moveStep,
                                                            y: drawable.getY() - moveStep / 2,
                                                        })
                                                        drawable.setChanged()
                                                        break
                                                    case "s":
                                                    case "S":
                                                    case "ArrowDown":
                                                        drawable.setBounds({
                                                            h: drawable.getH() - moveStep,
                                                            y: drawable.getY() + moveStep / 2,
                                                        })
                                                        drawable.setChanged()
                                                        break
                                                }
                                                break
                                            case "left":
                                                switch ($event.key) {
                                                    case "a":
                                                    case "A":
                                                    case "ArrowLeft":
                                                        drawable.setBounds({
                                                            w: drawable.getW() + moveStep,
                                                            x: drawable.getX() - moveStep / 2,
                                                        })
                                                        drawable.setChanged()
                                                        break
                                                    case "d":
                                                    case "D":
                                                    case "ArrowRight":
                                                        drawable.setBounds({
                                                            w: drawable.getW() - moveStep,
                                                            x: drawable.getX() + moveStep / 2,
                                                        })
                                                        drawable.setChanged()
                                                        break
                                                }
                                                break
                                            default: 
                                                frameRequestBoxEdgeScaling = undefined
                                                return
                                        }
                                    })
                                } catch(error){
                                    console.error(error.message)
                                    throw error
                                } finally{
                                    frameRequestBoxEdgeScaling = undefined
                                }
                            }
                        }
                    })
                    $(window).on("keyup.scaleBoxEdge", $event => {
                        if(keyboard.isModifierNotHit($event, "Alt") && drawable.isEdgeSelected() && keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
                            
                            // add redo
                            stateElement.addRedo({
                                data: {
                                    x: drawable.getX() / imageView.getWidth(),
                                    y: drawable.getY() / imageView.getHeight(),
                                    w: drawable.getW() / imageView.getWidth(),
                                    h: drawable.getH() / imageView.getHeight(),
                                },
                                fn: (data) => {
                                    selectDrawable(drawable)
                                    drawable.setBounds({
                                        x: data.x * imageView.getWidth(),
                                        y: data.y * imageView.getHeight(),
                                        w: data.w * imageView.getWidth(),
                                        h: data.h * imageView.getHeight(),
                                    })
                                }
                            })
                            if(!appModel.controls.creationEvent.value){
                                state.add(stateElement)
                            }
                            stateElement = undefined
                            savedStartState = false
                        }
                    })
                    // move
                    $(window).on("keydown.keyMoveBox", $event => {
                        if(!drawable.isEdgeSelected() && keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
                            if(!savedStartState){
                                stateElement = new state.StateElement()
                                stateElement.addUndo({
                                    data: {
                                        x: drawable.getX() / imageView.getWidth(),
                                        y: drawable.getY() / imageView.getHeight(),
                                    },
                                    fn: (data) => {
                                        selectDrawable(drawable)
                                        drawable.setPosition({
                                            x: data.x * imageView.getWidth(),
                                            y: data.y * imageView.getHeight(),
                                        })
                                    } 
                                })
                                savedStartState = true
                            }
                            keyMoveDrawable($event, drawable)    
                        }
                    })
                    $(window).on("keyup.keyMoveBox", $event => {
                        if(!drawable.isEdgeSelected() && keyboard.isKeyHit($event, ["W", "ArrowUp", "S", "ArrowDown", "D", "ArrowRight", "A", "ArrowLeft"], { caseSensitive: false })){
                            
                            if(!appModel.controls.creationEvent.value && savedStartState){
                                stateElement.addRedo({
                                    data: {
                                        x: drawable.getX() / imageView.getWidth(),
                                        y: drawable.getY() / imageView.getHeight(),
                                    },
                                    fn: (data) => {
                                        selectDrawable(drawable)
                                        drawable.setPosition({
                                            x: data.x * imageView.getWidth(),
                                            y: data.y * imageView.getHeight(),
                                        })
                                    }
                                })
                                state.add(stateElement)
                                stateElement = undefined
                                savedStartState = false
                            }
                        }
                    })
                    break
                case "Object":
                    if(Object.keys(drawable).length === 0){
                        break                
                    }
                default: throw new Error(`unknown drawable ${drawable} of type ${drawable.getClassName()}.`)
            }
        } else {
            // preserve shortcuts (should still prevent default even if the funciton is not activated)
            $(window).on("keydown", $event => {
                // prevent browser from scrolling if using arrow keys.
                if(keyboard.isKeyHit($event, ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"])){
                    $event.preventDefault()
                }
            })

        }
    }
}
export function disableChange(drawable: DrawablePresenter){
    // console.warn("disabled change handlers")
    drawable = drawable === undefined ? appModel.getSelectedDrawable() : drawable
    if(drawable instanceof DrawablePresenter){
        switch(drawable.getClassName()){
            case "PointPresenter":
                $(drawable.view.html.root).off("mousedown.movePointStart")
                $(window).off("keydown.movePoint")
                $(window).off("keyup.movePoint")
                $(window).off("keydown.multipointInsertPointStart")
                $(window).off("keydown.lineAddPointStart")
            case "MultipointPresenter":
                $(drawable.view.html.root).off("mousedown.moveDrawableStart")
                $(window).off("keydown.moveDrawable")
                $(window).off("keyup.moveDrawable")
                $(window).off("keydown.multipointInsertPointStart")
                $(window).off("keydown.lineAddPointStart")
                break
            case "BoxPresenter":
                $(drawable.view.html.root).off("mousedown.changeBoxStart")
                $(window).off("mousemove.changeBoxUpdate")
                $(window).off("mouseup.changeBoxEnd")
                $(window).off("keydown.selectBoxEdge")
                $(window).off("keydown.scaleBoxEdge")
                $(window).off("keyup.scaleBoxEdge")
                $(window).off("keydown.keyMoveBox")
                $(window).off("keyup.keyMoveBox")
                break
            default: throw new Error(`unknown drawable ${drawable} of type ${drawable.getClassName()}.`)
        }
    }
}

export function createDrawables(drawablesRawData: any){
    console.log("%c creating drawables from raw data: ", "background: #282828; color: #FE8019", drawablesRawData)
    // reset current drawable if any
    appModel.state.selectedDrawable.reset()

    // reset state control values
    appModel.state.drawableIdList.length = 0
    appModel.state.selectedDrawableId = undefined
    
    // create new drawables
    const drawables = []
    const containsData = Object.values(drawablesRawData).find(d => d && d.length > 0) !== undefined

    // create 'DrawablePresenter's
    if(containsData === true){
        Object.keys(drawablesRawData).forEach(key => {
            let drawablesRaw = drawablesRawData[key]
            if(drawablesRaw === undefined){
                return
            }

            // determine constructor
            let DrawablePresenterConstructor = undefined
            switch(key){
                case "bBoxes":
                bulkCreate(BoxPresenter, key, drawablesRaw) 
                break
                case "points":
                bulkCreate(PointPresenter, key, drawablesRaw)
                break
                case "lines":
                bulkCreate(MultipointPresenter, key, drawablesRaw)
                break
                case "polygons":
                bulkCreate(MultipointPresenter, key, drawablesRaw)
                break
                default:
                throw new Error(`raw data named '${key}' was not expected.`)
            }
            // a function to create all drawables depending on constructor.
            // @param: 'data' not used.
            function bulkCreate(DrawablePresenterConstructor: DrawablePresenter, key: String, data: Array<any>){
                const drawableInstances = []
                data.forEach(data => {
                    // console.warn(`drawable type: '${key}', drawable raw data:`)
                    data.status = data.status === undefined
                        ? STATE.DATABASE
                        : data.status
                    if(key === "lines"){
                        data.type = "line"
                    } else if(key === "polygons"){
                        data.type = "polygon"
                    }
                    const drawable = new DrawablePresenterConstructor(data)
                    // keep drawable id
                    if(!appModel.state.drawables.isInInitialState){
                        // @thesis: Wyh am i searching for the drawable id here?
                        // Do i keep track of all drawable ids? If I, why do I?
                        let oldDrawable = appModel.state.drawables[key].value.find(drawable => drawable.model.id === drawablesRaw.id)
                        let oldId = (oldDrawable !== undefined) ? oldDrawable.model.id : undefined
                        if(oldId !== undefined){
                            drawable.model.id = oldId
                        }
                    }
                    // on refresh we might have deleted boxes here. don't add them to the drawableIdList.
                    if(!drawable.model.status.has(STATE.DELETED)){
                        appModel.state.drawableIdList.push(drawable.mountId)
                    }
                    drawableInstances.push(drawable)
                })
                appModel.state.drawables[key].update(drawableInstances)
            }
        })
    } else {
        console.log("%c No drawables in data. ", "background: #282828; color: #FE8019")
    }
}
export function addDrawable(drawable: DrawablePresenter){
    if(!drawable.model.status.has(STATE.DELETED)){
        imageView.addDrawable(drawable)
    }
}
export function addDrawables(drawables: Array<DrawablePresenter>){
    drawables = drawables.filter(d => !d.model.status.has(STATE.DELETED))
    imageView.addDrawables(drawables)
}
// @caching: toolbarPresenter multipoint drawable creation handler 
// should remove unwanted points completely.
export function removeDrawable(drawable: DrawablePresenter){
    imageView.removeDrawable(drawable.view)
}
export function removeDrawables(){
    Object.values(appModel.state.drawables).forEach(drawables => {
        drawables.value.forEach(d => imageView.removeDrawable(d.view))
    })
}
export function selectDrawable(next: Drawable){
    const curr = appModel.getSelectedDrawable()
    // Don't re-select a drawable if it is allready selected. 
    // If another drawable is currently selected unselect it.
    if(curr instanceof DrawablePresenter && curr !== next){
        // console.log("will unselect:", curr)
        curr.unselect()
        if(curr instanceof BoxPresenter){
            curr.resetEdge()
        }
        if(curr.parent){
            curr.parent.unselect()
        }
    }

    // A drawable will only be selected if it is not allready selected.
    if(curr !== next){
        // console.log("will select:", next)
        next.select()
        appModel.selectDrawable(next)
        if(next.parent){
            next.parent.select()
            if(!appModel.controls.creationEvent.value){
                if(curr){
                    next.parent.previousPoint = curr
                }
                next.parent.currentPoint = next
            }
        }
    }
}
export function resetSelection(){
    const drawable = appModel.getSelectedDrawable()
    if(drawable instanceof DrawablePresenter){
        // console.log("reset selection:", drawable)
        appModel.resetDrawableSelection()
        drawable.unselect()
        if(drawable instanceof BoxPresenter){
            drawable.resetEdge()
        }
        if(drawable.parent){
            drawable.parent.unselect()
        }
    }
}

export function resize(width: Number, height: Number){
    // console.log("canvas size:", width, height)
    imageView.resize(width, height)

    // resize drawables
    const drawables = appModel.state.drawables
    Object.keys(drawables).forEach(key => {
        drawables[key].value.forEach(d => d.resize()) 
    })
}