import $ from "cash-dom"

import { NodeTemplate, mouse, keyboard, state } from "l3p-core"

import * as data from "core/data"
import * as math from "shared/math"

import { LAYOUT } from "./app.defaults"
import appModel from "./appModel"
import * as appView from "./appView"
import * as modals from "./modals"

import * as imagePresenter from "components/image/imagePresenter"
import * as propertiesPresenter from "components/properties/propertiesPresenter"
import * as toolbarPresenter from "components/toolbar/toolbarPresenter"
import * as controlsPresenter from "components/controls/controlsPresenter"

import * as imageView from "components/image/imageView"

state.init({ logging: false })
state.setHistorySize(50)

const CONFIG = false
const DEBUG = true
const BACKEND = true
// dummy labels if no backend
const CATEGORIES = { 
    labelTrees: [
        {
            id: 1,
            name: "my label tree" ,
            description: "my label tree",
            cssClass: null,
            labelLeaves: [
                {   
                    id: 1,
                    name: "label 1",
                    description: "label 1",
                    cssClass: null,
                },
                {   
                    id: 2,
                    name: "label 2222222222",
                    description: "label 2222222222",
                    cssClass: null,
                },
                {   
                    id: 3,
                    name: "label 33333333333333333",
                    description: "label 33333333333333333",
                    cssClass: null,
                },
                {   
                    id: 4,
                    name: "label 444444444444444444444444",
                    description: "label 444444444444444444444444",
                    cssClass: null,
                },
            ],
        }
    ]
}
// dummy data if no backend
const DATA = ((o: any) => {
    return {
        image: {
            id: -1,
            url: "/assets/picsum500x900.jpeg",
            isFirst: true,
            isLast: true,
        },
        drawables: {
            bBoxes: !o.boxes ? undefined :[
                {
                    id: 55,
                    labelIds: [2],
                    data: {
                        x: 0.5,
                        y: 0.5,
                        w: 0.2,
                        h: 0.2,
                    },
                },
                {
                    id: 56,
                    labelIds: [1],
                    data: {
                        x: 0.2,
                        y: 0.2,
                        w: 0.02,
                        h: 0.1,
                    },
                },
            ],
            points: !o.points ? undefined :[
                {
                    id: 115,
                    labelIds: [2],
                    data: {
                        x: 0.24857954545454544, 
                        y: 0.4595959595959596,
                    }
                },
            ],
            lines: !o.lines ? undefined :[
                {
                    id: 120,
                    labelIds: [4],
                    data: [
                        { x: 0.40198863636363635, y: 0.8434343434343434 },
                        { x: 0.6150568181818182, y: 0.8181818181818182 },
                    ]
                },
            ],
            polygons: !o.polygons ? undefined :[
                {
                    id: 33,
                    labelIds: [],
                    data: [
                        { x: 0.13636363636363635, y: 0.7626262626262627 },
                        { x: 0.1875, y: 0.5934343434343434 },
                        { x: 0.4133522727272727, y: 0.7550505050505051 },
                        { x: 0.3125, y: 0.8434343434343434 },
                    ]
                }
            ],
        }
    }
})({
    boxes: true,
    points: true,
    lines: true,
    polygons: true,
})

if(DEBUG){
    window.SIA = {
        math,
        appModel,
        appView,
        appPresenter: this,
        imagePresenter,
        propertiesPresenter,
        toolbarPresenter,
        imageView: require("./components/image/imageView"),
        propertiesView: require("./components/properties/propertiesView"),
        toolbarView: require("./components/toolbar/toolbarView"),
        PointPresenter: require("./drawables/point/PointPresenter"),
        MultipointPresenter: require("./drawables/multipoint/MultipointPresenter"),
        BoxPresenter: require("./drawables/box/BoxPresenter"),
        l3pcore: require("l3p-core")
    }
    window.NodeTemplate = NodeTemplate
}

function validateConfig(config: any){
    if(config.tools.bbox){
        const { minArea, minAreaType } = config.drawables.bbox
        if(!(minArea && minAreaType)){
            console.warn("Config does not provide both minArea and minAreaType for bboxes. Defaulting to 4x4 px, absolute.", config)
            config.drawables.bbox.minArea = 4*4
            config.drawables.bbox.minAreaType = "abs"
        }
    }
    return config
}
if(CONFIG){
    console.warn("NO CONFIG MODE: will not load backend config.")
    let config = appModel.config.value
    // config = Object.assign(config, {
    //     tools: {
    //         point: true,
    //         line: true,
    //         polygon: true,
    //         bbox: true,
    //     },
    //     actions: {
    //         drawing: true,
    //         labeling: true,
    //         edit: {
    //             label: true,
    //             bounds: true,
    //             delete: true,
    //         }
    //     }
    // })
    appModel.config.update(validateConfig(config))
    init()
} else {
    data.requestConfig().then(config => {
        config = JSON.parse(config)
        console.log("%c successfully requested config: ", "background: #282828; color: #FE8019", config)
        appModel.config.update(validateConfig(config))
        init()
    }).catch(error => {
        // make config optional
        console.log(error.message)
        appModel.config.update(appModel.config.value)
        init()
    })
}

function init(){
    if(BACKEND) {
        data.requestAnnotationProgress().then((ATStatus) => {
            console.log("%c ATStatus: ", "background: #282828; color: #FE8019", ATStatus)
            if(ATStatus.name === "nothing_available"){
                handleNothingAvailable()
            } else {
                // remove stored data when switching pipelines,
                let lastKnownAnnotationId = JSON.parse(sessionStorage.getItem("sia-annotation-id"))
                if(lastKnownAnnotationId && (lastKnownAnnotationId !== ATStatus.id)){
                    console.warn("The saved state is from another session.")
                    appModel.cleanSession()
                }
                // init:
                // get labels and annotation data.
                console.log("%c init ", "background: #282828; color: #FE8019")
                Promise.all([
                    data.requestLabels(),
                    data.requestInitialAnnotation(),
                ]).then((responses) => {
                    let [labels, annotations] = responses
                    console.log("%c update via request ", "background: #282828; color: #FE8019")
                    console.log("labels:", labels)
                    console.log("annotations:", annotations)
                    appModel.updateLabels(labels)
                    appModel.updateAnnotations(annotations)
                    sessionStorage.setItem("sia-annotation-id", JSON.stringify(ATStatus.id))
                }).catch((error)=>{
                    // when reaching this state, no pipline was selected, hide app.
                    appView.hide()
                })
            }
        })
    }
    else {
        appModel.updateLabels(CATEGORIES)
        appModel.updateAnnotations(DATA)
    }
}

/* model binding */
appModel.data.drawables.on("update", () => handleDataUpdate(appModel.data))

/* view binding */
$(window).on("resize", resize)
$(window).on("contextmenu", ($event) => $event.preventDefault())
$(window).on("mousedown mouseup click", ($event) => filterMouseButtons($event))
$(window).on("keydown", ($event) => filterKeyStrokes($event))
$(modals.lastImageModal.refs["finish-button"]).on("click", $event => {
    data.sendData(appModel.getResponseData()).then(() => {
        data.finish().then((message) => {
            if(message !== "succeeded"){
                alert(message)
                throw new Error(message)
            } else {
                appModel.cleanSession()
                window.AT.setFinished()
                handleNothingAvailable()
                console.log("%c application finished with status: ", "background: #282828; color: #FE8019", message)
            }
        })
    })
})
imagePresenter.image.addEventListener("load", () => {
    appView.show()
    resize()
    appModel.ui.resized.update(true)
    appModel.ui.resized.reset()
})   


function resize(){
    // requirement
    if(!appModel.data.image.url.isInInitialState && imageView.image !== null){

        // preparation
        let imageWidth = imageView.image.width
        let imageHeight = imageView.image.height

        // looking for
        let imageRatio;
        let isLandscape, isPortrait;
        let optimalImageHeight, optimalImageWidth, newImageHeight, newImageWidth;
        let availWidth, availHeight;

        // the resize function could be triggered before the image is loaded
        // aswell. thats why we need to check the images width and height values
        // setIntervall()
        if(imageWidth > 0 || imageHeight > 0) {
            // get image ratio
            imageRatio = imageWidth / imageHeight
            isLandscape = (imageRatio > 1) ? true : false
            isPortrait = !isLandscape

            // hide the image for caluclations
            imageView.hide() // @add-container-for-that? (getting the top value from boundingClientRect)

            // scroll into view to be able to use getBoundingClientRect for calculations
            document.getElementById("sia-drawer-title").scrollIntoView(true)

            if(isPortrait){
                // console.log("is portrait")
                // toggle grid layout
                appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-landscape", false)
                appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-landscape-toolbar-on-side", false)
                appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-landscape-toolbar-below", false)
                appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-portrait", true)
                propertiesPresenter.setLayout("portrait")
                toolbarPresenter.setLayout("column")

                // calculate height
                availHeight = window.innerHeight 
                    - propertiesPresenter.getBounds().top
                    - 30 // image info height (approx)
                    - imageView.padding.top
                    - imageView.padding.bottom
                    - LAYOUT.space
                // console.log("avail height:", availHeight)
                optimalImageHeight = availHeight
                optimalImageWidth = optimalImageHeight * imageRatio

                // calculate width
                availWidth = document.getElementById("sia-content-wrapper").clientWidth 
                    - propertiesPresenter.getWidth()
                    - toolbarPresenter.getWidth()
                    - 2 * imageView.padding.side
                applyMinimumRules()
            }
            else {
                // console.log("is landscape")
                // toggle grid layout
                appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-portrait", false)
                appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-landscape", true)
                appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-landscape-toolbar-below", true)
                propertiesPresenter.setLayout("landscape")
                toolbarPresenter.setLayout("row")
                // console.log("toolbar should be row")

                // calculate height
                availHeight = window.innerHeight 
                    - propertiesPresenter.getBounds().bottom
                    - toolbarPresenter.getHeight()
                    - (2 * Number.parseInt(getComputedStyle(appView.html.root).getPropertyValue("grid-row-gap")))
                    - 30 // image info height (approx)
                    - imageView.padding.top
                    - imageView.padding.bottom
                    - LAYOUT.space
                optimalImageHeight = availHeight
                optimalImageWidth = optimalImageHeight * imageRatio
                // console.log("avail height:", availHeight)
                // calculate width
                availWidth = document.getElementById("sia-content-wrapper").clientWidth
                    - 2 * imageView.padding.side
                applyMinimumRules()
                
                // additional step (set toolbar aside if enough space)
                const remainingWidth = (availWidth - newImageWidth) / 2
                // set toolbar layout to column to check the width that it would take aside
                appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-landscape-toolbar-below", false)
                appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-landscape-toolbar-on-side", true)
                toolbarPresenter.setLayout("column")
                const requiredWidth = toolbarPresenter.getWidth()
                    + Number.parseInt(getComputedStyle(appView.html.root).getPropertyValue("grid-row-gap"))
                // recalculate height again (and width as it depends)
                if(remainingWidth > requiredWidth){
                    // console.log("enough space to set toolbar on side")
                    // calculate height
                    availHeight = window.innerHeight 
                        - propertiesPresenter.getBounds().bottom
                        - Number.parseInt(getComputedStyle(appView.html.root).getPropertyValue("grid-row-gap"))
                        - 30 // image info height (approx)
                        - imageView.padding.top
                        - imageView.padding.bottom
                        - LAYOUT.space
                    optimalImageHeight = availHeight
                    optimalImageWidth = optimalImageHeight * imageRatio

                    // calculate width
                    availWidth = document.getElementById("sia-content-wrapper").clientWidth
                        - toolbarPresenter.getWidth()
                        - Number.parseInt(getComputedStyle(appView.html.root).getPropertyValue("grid-row-gap"))
                        - 2 * imageView.padding.side
                    applyMinimumRules()
                } 
                // if not enough space is available aside, reset to default
                else {
                    // console.log("not enough space to set toolbar on side")
                    appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-landscape-toolbar-on-side", false)
                    appView.html.ids["sia-content-wrapper"].classList.toggle("sia-layout-landscape-toolbar-below", false)
                    toolbarPresenter.setLayout("row")
                }
            }

            function applyMinimumRules(){
                // apply minimum rules
                if(optimalImageWidth > availWidth){
                    newImageHeight = optimalImageHeight * (availWidth / optimalImageWidth)
                    newImageWidth = availWidth
                } else {
                    newImageHeight = optimalImageHeight
                    newImageWidth = optimalImageWidth
                }
                if(newImageWidth < LAYOUT.minWidthPortrait){
                    newImageWidth = LAYOUT.minWidthPortrait
                    newImageHeight = newImageWidth / imageRatio
                }
            }

            // apply scale factor
            newImageHeight *= LAYOUT.scaleFactor
            newImageWidth *= LAYOUT.scaleFactor

            // floor even width and height
            newImageWidth = math.floorEven(newImageWidth)
            newImageHeight = math.floorEven(newImageHeight)

            // finish
            imageView.show()
            imagePresenter.resize(newImageWidth, newImageHeight)
            propertiesPresenter.resize()
        } else {
            throw new Error("image dimension error.")
        }
    } else {
        throw new Error("image not loaded.")
    }
}
function handleDataUpdate(data: any){
    // update progress bar
    if(BACKEND){
        window.AT.updateProgressBar()
    }
    if(data === "nothing available"){
        handleNothingAvailable()
    } 
}
function handleNothingAvailable(){
    console.log("handle nothing available")
    controlsPresenter.hide()
    propertiesPresenter.hide()
    toolbarPresenter.hide()
    imagePresenter.removeDrawables()
    imageView.hide()
    appView.show()
}
function filterMouseButtons($event){
    // return on right or middle mouse button, prevent context menu.
    if (!mouse.button.isLeft($event.button)) {
        $event.preventDefault()
        return
    }   
}
function filterKeyStrokes($event){
    // globaly prevent element selection with tab key.
    if (keyboard.isKeyHit($event, "Tab")) {
        $event.stopPropagation()
        $event.preventDefault()
    }
}

