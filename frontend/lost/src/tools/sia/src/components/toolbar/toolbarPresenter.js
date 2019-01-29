import $ from "cash-dom"

import { mouse, keyboard, state, svg as SVG } from "l3p-frontend"
import appModel from "../../appModel"

import "./toolbar.styles.scss"
import * as toolbarView from "./toolbarView"

import imageInterface from "components/image/imageInterface"
import * as imagePresenter from "components/image/imagePresenter"

import { STATE } from "drawables/drawable.statics"

import PointPresenter from "drawables/point/PointPresenter"
import MultipointPresenter from "drawables/multipoint/MultipointPresenter"
import BoxPresenter from "drawables/box/BoxPresenter"
import BoxModel from "drawables/box/BoxModel"

function resetFocus(){
	// no other element should be selected when creating a drawable, for
	// example the label field could be selected.
	document.activeElement.blur()
}
/* model binding */
appModel.controls.tool.on("update", () => {
	imagePresenter.resetSelection()
})
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
                    $(imageInterface.getSVG()).on("mousedown.createPoint", ($event) => {
                        if(keyboard.isAModifierHit($event)){
                            return
                        }
						if(mouse.button.isRight($event.button)){
							if(appModel.controls.changeEvent.value === false){
								appModel.controls.creationEvent.update(true)
							}
						}
					})
                    $(imageInterface.getSVG()).on("mouseup.createPoint", ($event) => {
						// resetFocus()
                        // console.log("create point handler (triggered)")
                        if(keyboard.isAModifierHit($event)){
                            return
                        }
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
							appModel.controls.creationEvent.update(false)
						}
                    })
                    break
                case "sia-tool-line":
                    var firstPoint = undefined
                    var currentPoint = undefined
                    var line = undefined
                    function addLinePoint($event){
                        console.warn("create line handler (executed add)")
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
							state.add(new state.StateElement({
                                do: {
                                    data: { $event },
                                    fn: (data) => {
										console.log("redo point")
                                        const { $event } = data
										addLinePoint($event)
										window.one = $event
                                    },
                                },
                                undo: {
                                    data: { firstPoint },
                                    fn: (data) => {
										deleteLinePoint()
                                    },
                                }
                            }))
                            // imagePresenter.addDrawable(firstPoint)
                            appModel.addDrawable(firstPoint)
                            imagePresenter.selectDrawable(firstPoint)
							console.log("added line point")
                        }
                        // else if no line was created before, create a initial line, and show it, remove the initial point.
                        else if(!line) {
                            line = new MultipointPresenter({
                                data: [ firstPoint.model.relBounds, { x: mousepos.x / imgW, y: mousepos.y / imgH } ],
                                type: "line",
                            })
							console.log("creat eline")
							state.add(new state.StateElement({
                                do: {
                                    data: { $event },
                                    fn: (data) => {
										console.log("redo point")
                                        const { $event } = data
										addLinePoint($event)
										window.two = $event
                                    },
                                },
                                undo: {
                                    data: { line },
                                    fn: (data) => {
										deleteLinePoint()
                                    },
                                }
                            }))
							// hide menubar during creation
							if(line.menuBar){
								line.menuBar.hide()
							}
                            // imagePresenter.removeDrawable(firstPoint)
                            // imagePresenter.addDrawable(line)
                            appModel.deleteDrawable(firstPoint)
                            appModel.addDrawable(line)
                            // select the second point of the line as indicator.
                            imagePresenter.selectDrawable(line.model.points[1])
                        }
                        // else add a point to the line.
                        else {
                            currentPoint = line.addPoint(mousepos)
                            if(currentPoint){
								state.add(new state.StateElement({
									do: {
										data: { $event },
										fn: (data) => {
											const { $event } = data
											addLinePoint($event)
										},
									},
									undo: {
										data: { line },
										fn: (data) => {
											deleteLinePoint()
										},
									}
								}))
                                imagePresenter.selectDrawable(currentPoint)
                            }
                        }
                    }
                    function deleteLinePoint(){
                        // first point
                        if(firstPoint && !line){
                            // imagePresenter.removeDrawable(firstPoint)
                            appModel.deleteDrawable(firstPoint)
                            firstPoint = undefined
							appModel.controls.creationEvent.update(false)
                        }
                        // second point
                        if(line && line.model.points.length === 2){
                            // remove the line from view
                            // imagePresenter.removeDrawable(line)
                            appModel.deleteDrawable(line)
                            line = undefined
                            // re-create the first point, add and select it.
                            firstPoint = new PointPresenter({
                                data: firstPoint.model.relBounds, 
                                isNoAnnotation: true,
                            })
                            // imagePresenter.addDrawable(firstPoint)
                            appModel.addDrawable(firstPoint)
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
							appModel.addDrawable(line)
                            appModel.selectDrawable(line)
                            line.model.points[line.model.points.length-1].unselect()
                            line.select()
							// show menu bar after creation
							if(line.menuBar){
								line.menuBar.show()
							}
                        } else {
							throw new Error("tried to finish line but line was undefined.")
                        }

                        // reset creation context
                        line = undefined
                        firstPoint = undefined

						appModel.controls.creationEvent.update(false)
                    }
                    $(imageInterface.getSVG()).on("mousedown.createLinePoint", ($event) => {
						if(mouse.button.isRight($event.button)){
							if(appModel.controls.changeEvent.value === false){
								appModel.controls.creationEvent.update(true)
							}
						}
					})
                    $(imageInterface.getSVG()).on("mouseup.createLinePoint", ($event) => {
						resetFocus()
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
                    })
					// left mouse button is also used in point change event handlers (imagePresenter)
                    $(window).on("dblclick.finishLine", ($event) => {
						if(appModel.controls.creationEvent.value === true){
							if(appModel.controls.changeEvent.value === false){
								if(firstPoint !== undefined || line !== undefined){
									if(mouse.button.isLeft($event.button)){
										resetFocus()
										finishLine()
									}
								}
							}
						}
                    })
                    $(window).on("keydown.finishLine", ($event) => {
                        if(appModel.controls.creationEvent.value === true){
	                        if(appModel.controls.changeEvent.value === false){
								if(keyboard.isKeyHit($event, ["Escape", "Enter"])){
									resetFocus()
									finishLine()
								}
							}
                        }
                    })
                    $(window).on("keydown.deleteLinePoint", ($event) => {
                        if(appModel.controls.creationEvent.value === true){
							if(appModel.controls.changeEvent.value === false){
								if(keyboard.isKeyHit($event, "Delete")){
									resetFocus()
									deleteLinePoint()
								}
							}
						}
                    })
                    break
                case "sia-tool-polygon":
                    var firstPoint = undefined
                    var line = undefined
                    let polygon = undefined
                    function addPolygonPoint($event){
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
                            // imagePresenter.addDrawable(firstPoint)
                            appModel.addDrawable(firstPoint)
                            imagePresenter.selectDrawable(firstPoint)
                        }
                        // else if no line was created before, create a initial line, and show it, remove the initial point.
                        else if(!line) {
                            line = new MultipointPresenter({
                                data: [ firstPoint.model.relBounds, { x: mousepos.x / imgW, y: mousepos.y / imgH } ],
                                type: "line",
                            })
							// hide the menu bar during creation
							if(line.menuBar){
								line.menuBar.hide()
							}
                            // imagePresenter.removeDrawable(firstPoint)
                            appModel.deleteDrawable(firstPoint)
                            // when a drawable is added to the appModel, the imagePresenter is notificated and adds the drawable.
                            // imagePresenter.addDrawable(line)
                            appModel.addDrawable(line)
                            imagePresenter.selectDrawable(line.model.points[1])
                        }
                        else if(!polygon){
                            polygon = new MultipointPresenter({
                                data: [ firstPoint.model.relBounds, line.model.relPointData[1], { x: mousepos.x / imgW, y: mousepos.y / imgH } ],
                                type: "polygon",
                            })
							// hide the menu bar during creation
							if(polygon.menuBar){
								polygon.menuBar.hide()
							}
                            // imagePresenter.removeDrawable(line)
                            appModel.deleteDrawable(line)
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
                    function deletePolygonPoint(){
						// first point
						if(firstPoint && !line){
							// imagePresenter.removeDrawable(firstPoint)
							appModel.deleteDrawable(firstPoint)
							firstPoint = undefined
						}
						// second point
						else if(line && !polygon){
							// remove the line from model and image view (event bound).
							// imagePresenter.removeDrawable(line)
							appModel.deleteDrawable(line)
							line = undefined
							// re-create the first point, add and select it.
							firstPoint = new PointPresenter({
								data: firstPoint.model.relBounds, 
								isNoAnnotation: true,
							})
							// imagePresenter.addDrawable(firstPoint)
							appModel.addDrawable(firstPoint)
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
							// imagePresenter.addDrawable(line)
							appModel.addDrawable(line)
							imagePresenter.selectDrawable(line.model.points[1])
						}
						// 4+n point
						else if(polygon) {
							polygon.removePoint(polygon.model.points[polygon.model.points.length - 1])
							imagePresenter.selectDrawable(polygon.model.points[polygon.model.points.length - 1])
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
							// show menu bar after creation
							if(polygon.menuBar){
								polygon.menuBar.show()
							}
                        } else if(line){
                            // imagePresenter.removeDrawable(line)
                            appModel.deleteDrawable(line)
                        } else if(firstPoint){
                            // imagePresenter.removeDrawable(firstPoint)
                            appModel.deleteDrawable(firstPoint)
                        }

                        // reset creation context
                        firstPoint = undefined
                        line = undefined
                        polygon = undefined
                    }
                    $(imageInterface.getSVG()).on("mousedown.createPolygonPoint", ($event) => {
						if(mouse.button.isRight($event.button)){
							if(appModel.controls.changeEvent.value === false){
								appModel.controls.creationEvent.update(true)
							}
						}
					})
                    $(imageInterface.getSVG()).on("mouseup.createPolygonPoint", ($event) => {
						resetFocus()
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
                    })
                    $(window).on("dblclick.finishPolygon", ($event) => {
                        if(firstPoint !== undefined || line !== undefined || polygon !== undefined){
                            // if(!$event.target.closest("#sia-imgview-svg")){
                            // @uncomment: felt ugly to be forced to click on a free area to finish drawing.
                            if(mouse.button.isLeft($event.button)){
								resetFocus()
                                finishPolygon()
								// if(appModel.controls.changeEvent.value === false){
									appModel.controls.creationEvent.update(false)
								// }
                            }
                        }
                    })
                    $(window).on("keydown.finishPolygon", ($event) => {
                        if(appModel.controls.creationEvent.value){
                            if(keyboard.isKeyHit($event, ["Escape", "Enter"])){
                                // console.warn("create polygon handler (executed finish)")
								resetFocus()
                                finishPolygon()
								// if(appModel.controls.changeEvent.value === false){
									appModel.controls.creationEvent.update(false)
								// }
                            }
                        }
                    })
                    $(window).on("keydown.deletePolygonPoint", ($event) => {
                        if(appModel.controls.creationEvent.value){
                            if(keyboard.isKeyHit($event, "Delete")){
								resetFocus()
                                deletePolygonPoint()
                            }
                        }
                    })
                    break
                case "sia-tool-bbox":
                    let newBox = undefined
                    let wImg = undefined
                    let hImg = undefined
                    let mouseStart = undefined
                    let mouseCurr = undefined
                    let lastUpdateCall = undefined
					let validated = false

					function resetContext(){
						newBox = undefined
						wImg = undefined
						hImg = undefined
						mouseStart = undefined
						mouseCurr = undefined
						lastUpdateCall = undefined
						validated = false
					}
					
                    function validate($event) {
						// check in which direction the user draws the box, create and add it
						// calculate the real mouseposition (@zoom)
						mouseCurr = mouse.getMousePosition($event, imageInterface.getSVG())
						const svg = imageInterface.getSVG()
						const zoom = appModel.ui.zoom.value
						mouseCurr = {
							x: (mouseCurr.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
							y: (mouseCurr.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
						}
						let right = mouseStart.x <= mouseCurr.x
						let down = mouseStart.y <= mouseCurr.y

						// create a new box
						// actual values
						let w = BoxModel.getSquareMinSideLength()
						let h = BoxModel.getSquareMinSideLength()
						// console.log(w)
						// console.log(h)
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
						newBox = new BoxPresenter({
							status: STATE.NEW,
							data: { x, y, w, h }
						})

						// hide the menu bar during creation
						if(newBox.menuBar){
							newBox.menuBar.hide()
						}

						// add the box hidden.
						appModel.addDrawable(newBox)
						// select the box.
						imagePresenter.selectDrawable(newBox)

						// start the update on mousemove and show the box.
						$(window).on("mousemove", update)
						$(window).off("mousemove", validate)

						// a flag to indicate that a box was created and update may execute.
						validated = true
                    }
                    function update(e) {
                        if(lastUpdateCall !== undefined) cancelAnimationFrame(lastUpdateCall)
                        lastUpdateCall = requestAnimationFrame(() => {
							mouseCurr = mouse.getMousePosition(e, imageInterface.getSVG())
							// calculate the real mouseposition (@zoom)
							const svg = imageInterface.getSVG()
							const zoom = appModel.ui.zoom.value
							mouseCurr = {
								x: (mouseCurr.x + (SVG.getViewBoxX(svg) * 1 / zoom)) * zoom,
								y: (mouseCurr.y + (SVG.getViewBoxY(svg) * 1 / zoom)) * zoom,
							}
							
							const left = mouseCurr.x <= mouseStart.x
							const up = mouseCurr.y <= mouseStart.y
							const right = !left
							const down = !up
							let x, y, w, h;
							let wDiff, hDiff;
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

                    $(imageInterface.getSVG()).on("mousedown.createBoxStart", ($event) => {
						// only execute on right mouse button.
						if(!mouse.button.isRight($event.button)){
							return
						}

						// mark event.
						if(appModel.controls.changeEvent.value === false){
							appModel.controls.creationEvent.update(true)
						}

						// quickfix: if label selection is opened, blur.
						resetFocus()
					
						// set a global cursor.
						mouse.setGlobalCursor(mouse.CURSORS.CREATE.class, {
							noPointerEvents: true,
							noSelection: true,
						})

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
                    })
					$(window).on("mouseup.createBoxEnd", ($event) => {
						if(!mouse.button.isRight($event.button)){
							return
						}

						// need to remove validation (creation) handler aswell. if user just clicks without dragging,
						// the handler will never get executed and therefore it will not remove itself.
						$(window).off("mousemove", validate)

						// stop update.
						if(lastUpdateCall !== undefined) cancelAnimationFrame(lastUpdateCall)
						$(window).off("mousemove", update)

						// reset the global cursor.            
						mouse.unsetGlobalCursor()

						// add redo undo.
						if(validated){
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

							// show the menu bar during creation
							if(newBox.menuBar){
								newBox.menuBar.show()
							}
						}

						// reset.
						resetContext()
						appModel.controls.creationEvent.update(false)
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
                    $(imageInterface.getSVG()).off("mousedown.createPoint")
                    $(imageInterface.getSVG()).off("mouseup.createPoint")
                    break
                case "sia-tool-line":
                    $(imageInterface.getSVG()).off("mousedown.createLinePoint")
                    $(imageInterface.getSVG()).off("mouseup.createLinePoint")
                    $(window).off("keydown.deleteLinePoint")
                    $(window).off("keydown.finishLine")
                    $(window).off("dblclick.finishLine")
                    break
                case "sia-tool-polygon":
                    $(imageInterface.getSVG()).off("mousedown.createPolygonPoint")
                    $(imageInterface.getSVG()).off("mouseup.createPolygonPoint")
                    $(window).off("keydown.deletePolygonPoint")
                    $(window).off("keydown.finishPolygon")
                    $(window).off("dblclick.finishPolygon")
                    break
                case "sia-tool-bbox":
                    $(imageInterface.getSVG()).off("mousedown.createBoxStart")
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
    appModel.controls.tool.update($event.target.closest("button").id)
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


