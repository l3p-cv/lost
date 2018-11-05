import { mouse, keyboard, state } from "l3p-core"
import appModel from "../../appModel"

import "./toolbar.styles.scss"
import * as toolbarView from "./toolbarView"

import imageInterface from "components/image/imageInterface"
import * as imagePresenter from "components/image/imagePresenter"
import * as imageView from "components/image/imageView"

import { STATE, EVENT_COMPUTATION_SETTINGS } from "drawables/drawable.statics"
import Timer from "shared/timer"

import DrawablePresenter from "drawables/DrawablePresenter"
import PointPresenter from "drawables/point/PointPresenter"
import MultipointPresenter from "drawables/multipoint/MultipointPresenter"
import BoxPresenter from "drawables/box/BoxPresenter"
import BoxModel from "drawables/box/BoxModel"

import DRAWABLE_DEFAULTS from "drawables/drawable.defaults"

import * as SVG from "drawables/svg"
import * as math from "shared/math"

/* model binding */
appModel.config.on("update", config => {
    if(config.actions.drawing){
        show()
        toolbarView.initTools(config.tools)

        // enable tool on selection, if no drawable is selected.
        appModel.controls.tool.on("update", (toolId) => {
            enableDrawableCreation(toolId)
        })
        // disable tool before unselection selection, if no drawable is selected.
        appModel.controls.tool.on("before-update", (toolId) => {
            if(toolId){
                disableDrawableCreation(toolId)
            }
        })

        // set handler depending on tool id string.
        function enableDrawableCreation(toolId: String){
            switch(toolId){
                case "sia-tool-point":
                    $(imageInterface.getSVGEmbeddedImage()).on("mouseup.createPoint", ($event) => {
                        // console.log("create point handler (triggered)")
                        // QUICK FIX:
                        if(keyboard.isAModifierHit($event)){
                            return
                        }
                        if(appModel.controls.tool.value === "sia-tool-point"){
                            if(mouse.button.isRight($event.button)){
                                // console.warn("create point handler(executed)")
                                $event.preventDefault()
                                const { imgW, imgH } = imageInterface.getDimensions()
                                let mousepos = mouse.getMousePosition($event, imageInterface.getSVG())
                                // calculate the real mouseposition (@zoom)
                                const svg = imageInterface.getSVG()
                                const zoom = appModel.ui.zoom.value
                                mousepos = {
                                    x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                                    y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                                }
                                const point = new PointPresenter({
                                    data: {
                                        x: (mousepos.x / imgW),
                                        y: (mousepos.y / imgH),
                                    }
                                })
                                // add redo and undo
                                state.add(new state.StateElement({
                                    do: {
                                        data: { point },
                                        fn: (data) => {
                                            const { point } = data
                                            appModel.addDrawable(point)
                                            imagePresenter.selectDrawable(point)
                                        }
                                    },
                                    undo: {
                                        data: { point },
                                        fn: (data) => {
                                            const { point } = data
                                            point.delete()
                                            appModel.deleteDrawable(point)
                                        }
                                    }
                                }))
                                appModel.addDrawable(point)
                                imagePresenter.selectDrawable(point)
                            }
                        }
                    })
                    break
                case "sia-tool-line":
                    var firstPoint = undefined
                    var currentPoint = undefined
                    var line = undefined
                    function addLinePoint($event){
                        // console.warn("create line handler (executed add)")
                        appModel.controls.creationEvent.update(true)
                        const { imgW, imgH } = imageInterface.getDimensions()
                        let mousepos = mouse.getMousePosition($event, imageInterface.getSVG())
                        // calculate the real mouseposition (@zoom)
                        const svg = imageInterface.getSVG()
                        const zoom = appModel.ui.zoom.value
                        mousepos = {
                            x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                            y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                        }
                        // if no points were created before, create an initial point and show it.
                        if(!firstPoint){
                            firstPoint = new PointPresenter({ 
                                data: { x: mousepos.x / imgW, y: mousepos.y / imgH }, 
                                isNoAnnotation: true,
                            })
                            imagePresenter.addDrawable(firstPoint)
                            imagePresenter.selectDrawable(firstPoint)
                        }
                        // else if no line was created before, create a initial line, and show it, remove the initial point.
                        else if(!line) {
                            line = new MultipointPresenter({
                                data: [ firstPoint.model.relBounds, { x: mousepos.x / imgW, y: mousepos.y / imgH } ],
                                type: "line",
                            })
                            imagePresenter.removeDrawable(firstPoint)
                            // when a drawable is added to the appModel, the imagePresenter is notificated and adds the drawable.
                            appModel.addDrawable(line)
                            // select the second point of the line as indicator.
                            imagePresenter.selectDrawable(line.model.points[1])
                        }
                        // else add a point to the line.
                        else {
                            currentPoint = line.addPoint(mousepos)
                            if(currentPoint){
                                imagePresenter.selectDrawable(currentPoint)
                            }
                        }
                    }
                    function deleteLinePoint(){
                        // first point
                        if(firstPoint && !line){
                            imagePresenter.removeDrawable(firstPoint)
                            firstPoint = undefined
                        }
                        // second point
                        else if(line && line.model.points.length === 2){
                            // remove the line from model and image view (event bound).
                            appModel.deleteDrawable(line)
                            line = undefined
                            // re-create the first point, add and select it.
                            firstPoint = new PointPresenter({
                                data: firstPoint.model.relBounds, 
                                isNoAnnotation: true,
                            })
                            imagePresenter.addDrawable(firstPoint)
                            imagePresenter.selectDrawable(firstPoint)
                        }
                        // 3+n point
                        else if(line){
                            line.removePoint(line.model.points[line.model.points.length - 1])
                            imagePresenter.selectDrawable(line.model.points[line.model.points.length - 1])
                        }
                    }
                    function finishLine(){
                        if(line){
                            state.add(new state.StateElement({
                                do: {
                                    data: { line },
                                    fn: (data) => {
                                        const { line } = data
                                        appModel.addDrawable(line)
                                        imagePresenter.selectDrawable(line)
                                    },
                                },
                                undo: {
                                    data: { line },
                                    fn: (data) => {
                                        const { line } = data
                                        line.delete()
                                        appModel.deleteDrawable(line)
                                    },
                                }
                            }))
                            appModel.selectDrawable(line)
                            line.model.points[line.model.points.length-1].unselect()
                            line.select()
                        } else if(firstPoint){
                            imagePresenter.removeDrawable(firstPoint)
                        }
                        // @QUICK-FIX-2: when finishing, the change events will be activated each time a drawable gets selected.
                        // @QUICK-FIX-2: need to reselect this drawable.
                        // @QUICK-FIX-2: unselect:
                        imagePresenter.resetSelection()
                        appModel.controls.creationEvent.update(false)
                        // @QUICK-FIX-2: reselect:
                        imagePresenter.selectDrawable(line)
                        // reset creation context
                        line = undefined
                        firstPoint = undefined
                    }
                    $(imageInterface.getSVGEmbeddedImage()).on("mouseup.createLinePoint", ($event) => {
                        // console.log("create line handler (triggered)")
                        $event.preventDefault()
                        // @QUICK-FIX-1: when selected, and adding points by ctrl or alt feature, no new drawable should be created.
                        // @QUICK-FIX-1: currently not switching of this handler.
                        if(keyboard.isAModifierHit($event)){
                            return
                        }
                        // create or extend line.
                        if(mouse.button.isRight($event.button)){
                            addLinePoint($event)
                        }
                        // finish line and reset context.
                        if(mouse.button.isLeft($event.button) && (firstPoint || line)){
                            // console.log("create line handler (executed finish)")
                            finishLine()
                        }
                    })
                    $(window).on("mousedown.finishLine", ($event) => {
                        if(firstPoint !== undefined || line !== undefined){
                            // if(!$event.target.closest("#sia-imgview-svg")){
                            // @uncomment: felt ugly to be forced to click on a free area to finish drawing.
                            if(mouse.button.isLeft($event.button)){
                                finishLine()
                            }
                        }
                    })
                    $(window).on("keydown.finishLine", ($event) => {
                        if(appModel.controls.creationEvent.value){
                            if(keyboard.isKeyHit($event, ["Escape", "Tab"])){
                                finishLine()
                            }
                        }
                    })
                    $(window).on("keydown.deleteLinePoint", ($event) => {
                        if(appModel.controls.creationEvent.value){
                            if(keyboard.isKeyHit($event, "delete")){
                                deleteLinePoint()
                            }
                        }
                    })
                    break
                case "sia-tool-polygon":
                    var firstPoint = undefined
                    var line = undefined
                    let polygon = undefined
                    function addPolygonPoint($event){
                        appModel.controls.creationEvent.update(true)
                        const { imgW, imgH } = imageInterface.getDimensions()
                        let mousepos = mouse.getMousePosition($event, imageInterface.getSVG())
                        // calculate the real mouseposition (@zoom)
                        const svg = imageInterface.getSVG()
                        const zoom = appModel.ui.zoom.value
                        mousepos = {
                            x: (mousepos.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                            y: (mousepos.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                        }
                        // if no points were created before, create an initial point and show it.
                        if(!firstPoint){
                            firstPoint = new PointPresenter({ 
                                data: { x: mousepos.x / imgW, y: mousepos.y / imgH }, 
                                isNoAnnotation: true,
                            })
                            imagePresenter.addDrawable(firstPoint)
                            imagePresenter.selectDrawable(firstPoint)
                        }
                        // else if no line was created before, create a initial line, and show it, remove the initial point.
                        else if(!line) {
                            line = new MultipointPresenter({
                                data: [ firstPoint.model.relBounds, { x: mousepos.x / imgW, y: mousepos.y / imgH } ],
                                type: "line",
                            })
                            imagePresenter.removeDrawable(firstPoint)
                            // when a drawable is added to the appModel, the imagePresenter is notificated and adds the drawable.
                            imagePresenter.addDrawable(line)
                            imagePresenter.selectDrawable(line.model.points[1])
                        }
                        else if(!polygon){
                            polygon = new MultipointPresenter({
                                data: [ firstPoint.model.relBounds, line.model.relPointData[1], { x: mousepos.x / imgW, y: mousepos.y / imgH } ],
                                type: "polygon",
                            })
                            imagePresenter.removeDrawable(line)
                            // when a drawable is added to the appModel, the imagePresenter is notificated and adds the drawable.
                            appModel.addDrawable(polygon)
                            imagePresenter.selectDrawable(polygon.model.points[2])
                        }
                        // else add a point to the polygon.
                        else {
                            currentPoint = polygon.addPoint(mousepos)
                            if(currentPoint){
                                imagePresenter.selectDrawable(currentPoint)
                            }
                        }
                    }
                    function deletePolygonPoint($event){
                        if(keyboard.isKeyHit($event, "Delete")){
                            // first point
                            if(firstPoint && !line){
                                imagePresenter.removeDrawable(firstPoint)
                                firstPoint = undefined
                            }
                            // second point
                            else if(line && !polygon){
                                // remove the line from model and image view (event bound).
                                imagePresenter.removeDrawable(line)
                                line = undefined
                                // re-create the first point, add and select it.
                                firstPoint = new PointPresenter({
                                    data: firstPoint.model.relBounds, 
                                    isNoAnnotation: true,
                                })
                                imagePresenter.addDrawable(firstPoint)
                                imagePresenter.selectDrawable(firstPoint)
                            }
                            // third point
                            else if(polygon && polygon.model.points.length === 3){
                                // remove the polygon
                                appModel.deleteDrawable(polygon)
                                polygon = undefined
                                // recreate the line and add the line
                                line = new MultipointPresenter({
                                    data: line.model.relPointData,
                                    type: "line",
                                })
                                imagePresenter.addDrawable(line)
                                imagePresenter.selectDrawable(line.model.points[1])
                            }
                            // 4+n point
                            else if(polygon) {
                                polygon.removePoint(polygon.model.points[polygon.model.points.length - 1])
                                imagePresenter.selectDrawable(polygon.model.points[polygon.model.points.length - 1])
                            }
                        }
                    }
                    function finishPolygon(){
                        if(polygon){
                            state.add(new state.StateElement({
                                do: {
                                    data: { polygon },
                                    fn: (data) => {
                                        const { polygon } = data
                                        appModel.addDrawable(polygon)
                                        imagePresenter.selectDrawable(polygon)
                                    },
                                },
                                undo: {
                                    data: { polygon },
                                    fn: (data) => {
                                        const { polygon } = data
                                        polygon.delete()
                                        appModel.deleteDrawable(polygon)
                                    },
                                }
                            }))
                            appModel.selectDrawable(polygon)
                            polygon.model.points[polygon.model.points.length-1].unselect()
                            polygon.select()
                        } else if(line){
                            imagePresenter.removeDrawable(line)
                        } else if(firstPoint){
                            imagePresenter.removeDrawable(firstPoint)
                        }
                        // @QUICK-FIX-2: when finishing, the change events will be activated each time a drawable gets selected.
                        // @QUICK-FIX-2: need to reselect this drawable.
                        // @QUICK-FIX-2: unselect:
                        imagePresenter.resetSelection()
                        appModel.controls.creationEvent.update(false)
                        // @QUICK-FIX-2: reselect:
                        imagePresenter.selectDrawable(polygon)
                        // reset creation context
                        firstPoint = undefined
                        line = undefined
                        polygon = undefined
                    }
                    $(imageInterface.getSVGEmbeddedImage()).on("mouseup.createPolygonPoint", ($event) => {
                        // console.log("create polygon handler (triggered)")
                        $event.preventDefault()
                        // @QUICK-FIX-1: when selected, and adding points by ctrl or alt feature, no new drawable should be created.
                        // @QUICK-FIX-1: currently not switching of this handler.
                        if(keyboard.isAModifierHit($event)){
                            return
                        }
                        // create or extend line.
                        if(mouse.button.isRight($event.button)){
                            // console.warn("create polygon handler (executed add)")
                            addPolygonPoint($event)
                        }
                        // finish line and reset context.
                        if(mouse.button.isLeft($event.button) && (firstPoint || line)){
                            // console.warn("create polygon handler (executed finish)")
                            finishPolygon()
                        }
                    })
                    $(window).on("mousedown.finishPolygon", ($event) => {
                        if(firstPoint !== undefined || line !== undefined || polygon !== undefined){
                            // if(!$event.target.closest("#sia-imgview-svg")){
                            // @uncomment: felt ugly to be forced to click on a free area to finish drawing.
                            if(mouse.button.isLeft($event.button)){
                                finishPolygon()
                            }
                        }
                    })
                    $(window).on("keydown.finishPolygon", ($event) => {
                        if(appModel.controls.creationEvent.value){
                            if(keyboard.isKeyHit($event, ["Escape", "Tab"])){
                                // console.warn("create polygon handler (executed finish)")
                                finishPolygon()
                            }
                        }
                    })
                    $(window).on("keydown.deletePolygonPoint", ($event) => {
                        if(appModel.controls.creationEvent.value){
                            if(keyboard.isKeyHit($event, "delete")){
                                deletePolygonPoint($event)
                            }
                        }
                    })
                    break
                case "sia-tool-bbox":
                    // data context
                    const container = imageInterface.getSVGEmbeddedImage()
                    
                    // control context
                    const minDrawTime = EVENT_COMPUTATION_SETTINGS.boxCreate.MIN_DRAW_TIME
                    let validated = false
                    let finished = false
                    let lastUpdateCall = undefined

                    // calculation context
                    let newBox = undefined
                    let wImg = undefined
                    let hImg = undefined
                    let mouseStart = undefined
                    let mouseCurr = undefined
                    let mousePrev = undefined

                    function validate(e) {
                        e.preventDefault()
                        if(lastUpdateCall !== undefined) cancelAnimationFrame(lastUpdateCall)
                        lastUpdateCall = requestAnimationFrame(() => {
                            if (Timer.elapsed() > minDrawTime) {
                                // reset validation.
                                $(window).off("mousemove", validate)
                                Timer.unlock()
                                appModel.controls.creationEvent.update(true)

                                // check in which direction the user draws the box, create and add it
                                // calculate the real mouseposition (@zoom)
                                mouseCurr = mouse.getMousePosition(e, imageInterface.getSVG())
                                const svg = imageInterface.getSVG()
                                const zoom = appModel.ui.zoom.value
                                mouseCurr = {
                                    x: (mouseCurr.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                                    y: (mouseCurr.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                                }
                                let direction = undefined
                                let right = mouseStart.x <= mouseCurr.x
                                let down = mouseStart.y <= mouseCurr.y

                                // create a new box
                                // actual values
                                let w = BoxModel.getSquareMinSideLength()
                                let h = BoxModel.getSquareMinSideLength()
                                let x = right 
                                    ? mouseStart.x
                                    : mouseStart.x - w
                                let y = down 
                                    ? mouseStart.y
                                    : mouseStart.y - h
                                // relative values
                                w = w / wImg
                                h = h / hImg
                                x = (x / wImg) + (w / 2)
                                y = (y / hImg) + (h / 2)
                                newBox = new BoxPresenter ({
                                    status: STATE.NEW,
                                    data: { x, y, w, h }
                                })
                                // add the box hidden.
                                appModel.addDrawable(newBox)
                                // select the box.
                                imagePresenter.selectDrawable(newBox)

                                appModel.controls.creationEvent.update(false)
                                // start the update on mousemove and show the box.
                                $(window).on("mousemove", update)
                            }
                            lastUpdateCall = undefined
                        })
                    }
                    function update(e) {
                        e.preventDefault()
                        if(lastUpdateCall !== undefined) cancelAnimationFrame(lastUpdateCall)
                        lastUpdateCall = requestAnimationFrame(() => {
                            // @refactor: BoxPresenter.create(distance)
                            mouseCurr = mouse.getMousePosition(e, imageInterface.getSVG())
                            // calculate the real mouseposition (@zoom)
                            const svg = imageInterface.getSVG()
                            const zoom = appModel.ui.zoom.value
                            mouseCurr = {
                                x: (mouseCurr.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                                y: (mouseCurr.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                            }
                            mousePrev = (mousePrev) ? mouseStart : mouseCurr
                            const left = mouseCurr.x <= mouseStart.x
                            const up = mouseCurr.y <= mouseStart.y
                            const right = !left
                            const down = !up

                            let x, y, w, h;
                            let wDiff, hDiff;
                            window.box = newBox
                            if(left){
                                w = mouseStart.x - mouseCurr.x
                                wDiff = w - newBox.getW()
                                x = newBox.getX() - wDiff / 2
                                if(down){
                                    h = mouseCurr.y - mouseStart.y
                                    hDiff = h - newBox.getH()
                                    y = newBox.getY() + hDiff / 2
                                }
                                else if(up){
                                    h = mouseStart.y - mouseCurr.y
                                    hDiff = h - newBox.getH()
                                    y = newBox.getY() - hDiff / 2
                                } 
                            }
                            else if(right){
                                w = mouseCurr.x - mouseStart.x
                                wDiff = w - newBox.getW()
                                x = newBox.getX() + wDiff / 2
                                if(down === true){
                                    h = mouseCurr.y - mouseStart.y
                                    hDiff = h - newBox.getH()
                                    y = newBox.getY() + hDiff / 2
                                }
                                else if(up){
                                    h = mouseStart.y - mouseCurr.y
                                    hDiff = h - newBox.getH()
                                    y = newBox.getY() - hDiff / 2
                                } 
                            }
                            newBox.setBounds({ x, y, w, h })
                        })
                    }

                    // create box (start)
                    $(imageInterface.getSVGEmbeddedImage()).on("mousedown.createBoxStart", ($event) => {
                        // console.log("create box handler (triggered)")
                        // QUICK FIX:
                        if(keyboard.isAModifierHit($event)){
                            return
                        }
                        if(appModel.controls.tool.value === "sia-tool-bbox"){
                            if(!mouse.button.isRight($event.button)){
                                return
                            } else {
                                // console.warn("create box handler (code executed)")
                                $event.preventDefault()
                            
                                // disable hover effect of all other boxes
                                appModel.state.boxEventActive.update({ isActive: true, type: "create" })
                                
                                // set a global cursor.
                                mouse.setGlobalCursor(mouse.CURSORS.CREATE.class, {
                                    noPointerEvents: true,
                                    noSelection: true,
                                })
                                
                                // start the box create e with a
                                // timer because drawing should have a minimum time
                                // required to get validated.
                                // save the mouse start position for the new box and
                                // add the validate function to the mousemove e
                                Timer.start()

                                // update the context
                                wImg = imageInterface.getWidth()
                                hImg = imageInterface.getHeight()
                                mouseStart = mouse.getMousePosition($event, imageInterface.getSVG())
                                // calculate the real mouseposition (@zoom)
                                const svg = imageInterface.getSVG()
                                const zoom = appModel.ui.zoom.value
                                mouseStart = {
                                    x: (mouseStart.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
                                    y: (mouseStart.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
                                }

                                // start event validation
                                $(window).on("mousemove", validate)
                            }
                        }      
                    })
                    // create box (end)
                    $(window).on("mouseup.createBoxEnd", ($event) => {
                        // console.log("create box handler (triggered)")
                        if(appModel.controls.tool.value === "sia-tool-bbox"){
                            if(!mouse.button.isRight($event.button)){
                                return
                            } else {
                                // console.warn("create box handler (code executed)")
                                $event.preventDefault()
                                // at least trigger update once!
                                update($event)

                                // removing validation is needed if the user fastclicks without dragging.
                                $(window).off("mousemove", validate)                
                                $(window).off("mousemove", update)

                                // reset the global cursor.            
                                mouse.unsetGlobalCursor()

                                // add redo and undo
                                state.add(new state.StateElement({
                                    do: {
                                        data: {
                                            box: newBox
                                        },
                                        fn: (data) => {
                                            // add the box hidden.
                                            appModel.addDrawable(data.box)
                                            // select the box.
                                            imagePresenter.selectDrawable(data.box)
                                        }
                                    },
                                    undo: {
                                        data: {
                                            box: newBox
                                        },
                                        fn: (data) => {
                                            data.box.delete()
                                            appModel.deleteDrawable(data.box)
                                            // imagePresenter.selectDrawable(appModel.state.previousDrawable)
                                        }
                                    }
                                }))

                                // reenable hover effect of all other boxes
                                appModel.state.boxEventActive.update({ isActive: false, type: "create" }) 
                            }
                        }       
                    })
                    break
                default: throw new Error("unknown tool id:", toolId)
            }
        }
        // unset handler depending on tool id string.
        function disableDrawableCreation(toolId: String){
            console.log("disable:", toolId)
            switch(toolId){
                case "sia-tool-point":
                    $(imageInterface.getSVGEmbeddedImage()).off("mouseup.createPoint")
                    break
                case "sia-tool-line":
                    $(imageInterface.getSVGEmbeddedImage()).off("mouseup.createLinePoint")
                    $(window).off("keydown.deleteLinePoint")
                    $(window).off("keydown.finishLine")
                    $(window).off("mousedown.finishLine")
                    break
                case "sia-tool-polygon":
                    $(imageInterface.getSVGEmbeddedImage()).off("mouseup.createPolygonPoint")
                    $(window).off("keydown.deletePolygonPoint")
                    $(window).off("keydown.finishPolygon")
                    $(window).off("mousedown.finishPolygon")
                    break
                case "sia-tool-bbox":
                    $(imageInterface.getSVGEmbeddedImage()).off("mousedown.createBoxStart")
                    $(window).off("mouseup.createBoxEnd")
                    break
                default: console.warn("unknown tool id.")
            }
        }
    
        appModel.controls.tool.on("update", (id) => toolbarView.activateTool(id))
        appModel.controls.tool.on("before-update", (prevId) => toolbarView.deactivateTool(prevId))
    }
    else {
        hide()
    }
})

/* view binding */
$(toolbarView.html.ids["sia-toolbar-container"]).on("click", "button", ($event) => {
    appModel.controls.tool.update($event.currentTarget.id)
})


/* export */
export function setLayout(layout: String){
    toolbarView.setLayout(layout)
}
export function show(){
    toolbarView.show()
}
export function hide(){
    toolbarView.hide()
}
export function getWidth(){
    return toolbarView.getWidth()
}
export function getHeight(){
    return toolbarView.getHeight()
}


