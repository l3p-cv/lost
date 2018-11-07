import $ from "cash-dom"

import { mouse, keyboard, state } from "l3p-core"

import * as propertiesView from "./propertiesView"

import appModel from "../../appModel"
import * as modals from "../../modals"

import * as data from "core/data"

import { STATE } from "drawables/drawable.statics"
import DrawablePresenter from "drawables/DrawablePresenter"
import PointPresenter from "../../drawables/point/PointPresenter";

import imageInterface from "components/image/imageInterface"

import objectAssignDeep from "@cartok/object-assign-deep"

import * as imagePresenter from "../image/imagePresenter"

// STATE BASED UPDATES
appModel.data.image.url.on("update", (imgPath) => propertiesView.image.src = imgPath)
appModel.state.selectedDrawable.on("before-update", detachDrawable)
appModel.state.selectedDrawable.on("update", attachDrawable)
appModel.state.selectedDrawable.on("reset", detachDrawable)

// DATA BASED UPDATES
propertiesView.init()
appModel.data.labelList.on("update", propertiesView.updateLabels)


// LABEL
appModel.config.on("update", config => {
    let labelingEnabled = undefined
    if(config.actions.labeling){
        if(!labelingEnabled){
            enableLabeling()
            labelingEnabled = true
        }
    } else {
        disableLabeling()
    }
})

// GLOBAL
$(window).on("load", resize) // shouldnt be needed => appPresenter.resize()
$(window).on("resize", resize) // shouldnt be needed => appPresenter.resize()

// BUTTONS
$(propertiesView.html.refs["btn-prev"]).on("click", ($event) => {
    // return on right or middle mouse button, prevent context menu.
    if (!mouse.button.isLeft($event.button)) {
        $event.preventDefault()
        return
    }
    $event.preventDefault()
    propertiesView.disablePrevButton()
    if(appModel.data.image.isLast){
        propertiesView.disableNextButton()
    }
    updateData("previous")
})
$(propertiesView.html.refs["btn-next"]).on("click", ($event) => {
    // return on right or middle mouse button, prevent context menu.
    if (!mouse.button.isLeft($event.button)) {
        $event.preventDefault()
        return
    }
    $event.preventDefault()
    if(!appModel.data.image.isLast){
        updateData("next")
        propertiesView.disableNextButton()
    }
})
$(propertiesView.html.refs["btn-first"]).on("click", ($event) => {
    // return on right or middle mouse button, prevent context menu.
    if (!mouse.button.isLeft($event.button)) {
        $event.preventDefault()
        return
    }
    $event.preventDefault()
    propertiesView.disableFirstButton()
    if(appModel.data.image.isLast){
        propertiesView.disableNextButton()
    }
    updateData("first")
})
$(propertiesView.html.refs["btn-latest"]).on("click", ($event) => {
    // return on right or middle mouse button, prevent context menu.
    if (!mouse.button.isLeft($event.button)) {
        $event.preventDefault()
        return
    }
    $event.preventDefault()
    propertiesView.disableLastButton()
    updateData("latest")
})



function updateTable(bounds: any){
    const drawable = appModel.state.selectedDrawable.value
    propertiesView.updateTable(drawable)
}
function updateCanvas(){
    const { imgW, imgH } = imageInterface.getDimensions()
    const drawable = appModel.state.selectedDrawable.value
    const bounds = drawable.getBounds()
    const pointPadding = 5
    if(drawable instanceof PointPresenter){
        bounds.w = pointPadding * 2
        bounds.h = pointPadding * 2
    }

    propertiesView.hideCanvasBorder()

    // values to calculate
    let sbx,sby,sbw,sbh,
    drawableRatio,canRatio,
    canvasZoomFactor,drawableZoomFactor,
    hScaled, hDiff, shDiff,
    wScaled, wDiff,swDiff,
    padding;

    // expand the selection that the drawable determines to the canvas dimensions
    // ------------------------------------------------------------------
    // instead of using the actual pixel values of the drawable
    // use its relative values and get the corresponding actual values
    // matching the drawable on the source image.
    // sb = source drawable
    const imgSourceH = propertiesView.image.height
    const imgSourceW = propertiesView.image.width
    if(drawable instanceof PointPresenter){
        sbx = (drawable.model.relBounds.x * imgSourceW) - (pointPadding / imgW * imgSourceW)
        sby = (drawable.model.relBounds.y * imgSourceH) - (pointPadding / imgH * imgSourceH)
        sbw = (bounds.w / imgW) * imgSourceW
        sbh = (bounds.h / imgH) * imgSourceH
    } else {
        sbx = drawable.model.relBounds.left * imgSourceW
        sby = drawable.model.relBounds.top * imgSourceH
        sbw = drawable.model.relBounds.w * imgSourceW
        sbh = drawable.model.relBounds.h * imgSourceH
    }

    // determine zoom factor
    // its calculation is depending on the ratios of the drawable and the canvas
    drawableRatio = bounds.w / bounds.h
    const canW = propertiesView.html.refs["canvas"].width
    const canH = propertiesView.html.refs["canvas"].height
    canRatio = canW / canH

    if (drawableRatio >= canRatio) {
        // when applying the zoom factor later the drawable preview width
        // will match the canvas width, but the drawable height wont fill
        // the canvas height
        // zoom factor depends on width
        canvasZoomFactor = canW / sbw

        // center clipping
        // -----------------------------------------------------------------
        // get resulting height difference when zooming
        hScaled = sbh * canvasZoomFactor
        hDiff = canH - hScaled
        // get the actual hight difference (scale height diff to img size)
        shDiff = hDiff / canvasZoomFactor
        // center the clipping by moving the startpoint up
        sby -= (shDiff / 2)

        // calculate padding
        // -----------------------------------------------------------------
        drawableZoomFactor = canW / bounds.w
        padding = (canH - (bounds.h * drawableZoomFactor)) / 2
    }
    else {
        // when applying the zoom factor later the drawable preview height
        // will match the canvas height, but the drawable width wound fill
        // the canvas width
        // zoom factor depends on height
        canvasZoomFactor = canH / sbh

        // center clipping
        // -----------------------------------------------------------------
        wScaled = sbw * canvasZoomFactor
        // get resulting height difference
        wDiff = canW - wScaled
        // get the actual width difference (scale width diff to img size)
        swDiff = wDiff / canvasZoomFactor
        // center the clipping by moving the startpoint left
        sbx -= (swDiff / 2)

        // calculate padding
        // -----------------------------------------------------------------
        drawableZoomFactor = canH / bounds.h
        padding = (canW - (bounds.w * drawableZoomFactor)) / 2
    }

    propertiesView.updateCanvas({
        drawable: {
            source: {
                x: sbx,
                y: sby,
            },
            zoomFactor: drawableZoomFactor,
            width: bounds.w,
            height: bounds.h,
            ratio: drawableRatio,
        },
        canvas: {
            zoomFactor: canvasZoomFactor,
            width: canW,
            height: canH,
            ratio: canRatio,
        },
        padding: padding,
    })
}

function keyRequestPreviousData($event){
    if(keyboard.isShortcutHit($event, {
        mod: ["Control", "Alt"],
        key: "ArrowLeft"
    })){
        $event.preventDefault()
        $event.stopPropagation()
        propertiesView.disableNavigationButtons()
        updateData("previous")
    }
}
function keyRequestNextData($event){
    if(keyboard.isShortcutHit($event, {
        mod: ["Control", "Alt"],
        key: "ArrowRight"
    })){
        $event.preventDefault()
        $event.stopPropagation()
        propertiesView.disableNavigationButtons()
        updateData("next")
    }
}


function updateData(action: String){
    // choose data request depending on the action string:
    let requestData = undefined
    switch(action){
        case "previous":
            requestData = data.requestPreviousData
            break
        case "next":
            requestData = data.requestNextData
            break
        case "first":
            requestData = data.requestFirstData
            break
        case "latest":
            requestData = data.requestLatestData
            break
        default: 
            throw new Error(`The action string is invalid.`)
    }
    return data.sendData(appModel.getResponseData()).then(() => {
        Promise.all([
            data.requestLabels(),
            requestData(),
        ]).then((responses)=>{
            let [categories, data] = responses
            console.log("%c update via request ", "background: #282828; color: #FE8019")
            console.log("categories:", categories)
            console.log("data:", data)
            appModel.updateLabels(categories)
            appModel.updateAnnotations(data)
        }).catch((reason) => {
            console.error(reason)
        })
    })
}
// quickfix
appModel.data.image.info.on("update", () => {
    const data = appModel.data
    if(data.image.isFirst){
        console.log("handling first image")
        handleFirstImage()
    } else {
        console.log("handling not fist image")
        handleNotFirstImage()
    }
    if(data.image.isLast){
        console.log("handling last image")
        handleLastImage()
    } else {
        console.log("handling not last image")
        handleNotLastImage()
    }
})

function enableLabeling(){
    propertiesView.enableLabeling()
   
    // add dropdown open shortcut
    $(window).on("keydown.openLabelSelect", $event => {
        if(keyboard.isShortcutHit($event, { mod: "Control", key: "L" })){
            console.log("ctrl + l")
            imagePresenter.disableChange()
            // don't set cursor to browser adress line
            $event.preventDefault()
            // open the dropdown
            // propertiesView.html.ids["sia-propview-label-select"].click()
        }
    })
    // add label change listener.
    $(propertiesView.html.ids["sia-propview-label-select"]).on("change", $event => {
        // @todo: replace with id (add id to views)
        // find label object by name and update description
        // @improve this section
        let optionId = $event.target.value
        let labelObj = appModel.data.labelList.value.find(l => parseInt(l.id) === parseInt(optionId))
        if(labelObj){
            // save label in appModel and session.
            appModel.state.selectedLabel = labelObj
            // update description view.
            propertiesView.setDescription(labelObj.description)
            // update current drawable label.
            if(appModel.isADrawableSelected()){
                const drawable = appModel.getSelectedDrawable()
                if(drawable.isLabelable()){
                    drawable.setLabel(labelObj)
                    drawable.setChanged()
                    if(drawable.parent){
                        drawable.parent.setLabel(labelObj)
                        drawable.setChanged()
                    }
                }
            }
        } else { 
            throw  new Error(`Could not find label by id: ${optionId}.`)
        }

        imagePresenter.enableChange()
    })
}
function disableLabeling(){
    $(window).off("keydown.openLabelSelect")
    propertiesView.disableLabeling()
}

function enableAllButtons(){
    propertiesView.enableFirstButton()
    propertiesView.enableLastButton()
    propertiesView.enablePrevButton()
    propertiesView.enableNextButton()
}
function disableAllButtons(){
    propertiesView.disableFirstButton()
    propertiesView.disableLastButton()
    propertiesView.disablePrevButton()
    propertiesView.disableNextButton()
}

function attachDrawable(drawable: DrawablePresenter){
    if(drawable instanceof DrawablePresenter){
        // initial update
        updateCanvas()
        updateTable()

        // continous update
        drawable.model.actBounds.on("update", updateCanvas)
        drawable.model.actBounds.on("update", updateTable)

        // enable label and description and set the boxes label by id + description
        propertiesView.setLabel(drawable.model.label.id)
        propertiesView.setDescription(drawable.model.label.description)
    }
}
function detachDrawable(drawable: DrawablePresenter){
    if(drawable instanceof DrawablePresenter){
        drawable.model.actBounds.off("update", updateCanvas)
        drawable.model.actBounds.off("update", updateTable)
        propertiesView.resetCanvas()
        propertiesView.resetTable()
    }
}


export function handleLastImage(){
    propertiesView.disableLastButton()
    propertiesView.setNextButtonState("finish")
    $(propertiesView.html.refs["btn-next"]).on("click", modals.showLastImageModal)
    $(window).off("keydown", keyRequestPreviousData).on("keydown", keyRequestPreviousData)
    $(window).off("keydown", keyRequestNextData)
}
export function handleNotLastImage(){
    propertiesView.enableLastButton()
    propertiesView.setNextButtonState("default")
    $(propertiesView.html.refs["btn-next"]).off("click", modals.showLastImageModal)
    $(window).off("keydown", keyRequestPreviousData).on("keydown", keyRequestPreviousData)
    $(window).off("keydown", keyRequestNextData).on("keydown", keyRequestNextData)
}
export function handleFirstImage(){
    propertiesView.disablePrevButton()
    propertiesView.disableFirstButton()
}
export function handleNotFirstImage(){
    propertiesView.enablePrevButton()
    propertiesView.enableFirstButton()
}


export function resize(){
    propertiesView.resize()
    if(appModel.isADrawableSelected()){
        updateCanvas()
        propertiesView.hideCanvasBorder()
    }
}
export function show(){
    propertiesView.show()
}
export function hide(){
    propertiesView.hide()
}

export function getBounds(){
    return propertiesView.getBounds()
}
export function getWidth(){
    return propertiesView.getWidth()
}
export function getHeight(){
    return propertiesView.getHeight()
}

export function setLayout(layout: String){
    propertiesView.setLayout(layout)
}