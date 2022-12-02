import React, { useRef, useEffect, useState } from 'react'

import ToolBar from './ToolBar'
import Canvas from './Canvas'
import * as tbe from './types/toolbarEvents'
import * as annoActions from './types/canvasActions'
import {noAnnos} from './siaDummyData'

/**
 * SIA element that handles annotations within an image
 * 
 * @param {object} annos -  A json object containing all annotation 
 *      information for an image
 *      {
 *              bBoxes: [{
 *                  id: int, // -> Not required if status === annoStatus.NEW
 *                  data: {},
 *                  labelIds: list of int, // -> optional
 *                  status: see annoStatus, // -> optional
 *                  annoTime: float, // -> optional
 *              },...],
 *              points: []
 *              lines: []
 *              polygons: []
 *      }
 * @param {object} annoSaveResponse - Backend response when updating an annotation in backend
 *                  {
 *                      tempId: int or str, // temporal frontend Id 
 *                      dbId: int, // Id from backend
 *                      newStatus: str // new Status for the annotation
 *                  }
 * @param {object} possibleLabels - Possible labels that can be assigned to 
 *      an annotation.
 *      [{   
 *          id: int, 
 *          description: str, 
 *          label: str, (name of the label) 
 *          color: str (color is optional)
 *      }, ...]
 * @param {blob} imageBlob - The actual image blob that will be displayed
 * @param {object} imageMeta - Meta information for the current image
 *        {
 *          "id": int,
 *          "number": int, // -> number of image in current annotask
 *          "amount": int, // -> total number of images in current annotask
 *          "isFirst": bool, // -> True if this image is the first image
 *          "isLast": bool, // -> True if current image is the last image in annotask
 *          "labelIds": list of int, // -> List of label for the current image
 *          "isJunk": bool, // -> Indicates wether current image is a junk image
 *          "annoTime": float, // -> Total annotation time for the current image
 *          "description": str or null // -> Description or comment for the current image
 *      }
 * @param {object} exampleImg - Example for a selected label
 *      {
 *          "anno": {
 *              "id": int, // -> ID of the example annotation
 *              "comment": null or str // -> Comment that has been assigned to this example
 *          },
 *          "img": image blob
 *      }
 * @param {bool} isJunk - Indicates wether the current image is junk or not
 * @param {object} uiConfig - User interface configs 
 *      {
 *          nodesRadius: int, strokeWidth: int,
 *          layoutOffset: {left:int, top:int, right:int, bottom:int}, -> Offset of the canvas inside the container
 *          imgBarVisible: bool,
 *          imgLabelInputVisible: bool,
 *          centerCanvasInContainer: bool, -> Center the canvas in the middle of the container.
 *          maxCanvas: bool -> Maximize Canvas Size. Do not fit canvas to image size.
 *      }
 * @param {int} layoutUpdate - A counter that triggers a layout update
 *      everytime it is incremented.
 * @param {string} selectedTool - The tool that is selected to draw an 
 *      annotation. Possible choices are: 'bBox', 'point', 'line', 'polygon'
 * @param {object} canvasConfig - Configuration for this canvas
 *  {
 *      annos:{
 *          tools: {
 *              point: bool,
 *              line: bool,
 *              polygon: bool,
 *              bbox: bool
 *          },
 *          multilabels: bool,
 *          actions: {
 *              draw: bool,
 *              label: bool,
 *              edit: bool,
 *          },
 *          maxAnnos: null or int,
 *          minArea: int
 *      },
 *      img: {
 *          multilabels: bool,
 *          actions: {
 *              label: bool,
 *          }
 *      },
 *      allowedToMarkExample: bool, -> Indicates wether the current user is allowed to mark an annotation as example.
 *   }
 * @param {str or int} defaultLabel (optional) - Name or ID of the default label that is used
 *      when no label was selected by the annotator. If not set "no label" will be used.
 *      If ID is used, it needs to be one of the possible label ids.
 * @param {bool} blocked Block canvas view with loading dimmer.
 * @param {bool} fullscreen Set fullscreen mode if provided
 * @param {bool} preventScrolling Prevent scrolling on mouseEnter
 * @param {bool} lockedAnnos A list of AnnoIds of annos that should only be displayed.
 *      Such annos can not be edited in any way.
 * @param {object} filter Information for the filter Popup
 *          {
 *              "clahe": {
 *                  "clipLimit": int,
 *                  "active": bool
 *              },
 *          } 
 * @param {bool | object} toolbarEnabled Defines which toolbar buttons are 
 *      displayed or if toolbar is shown at all. 
 *          false | {
 *              imgLabel: bool,
 *              nextPrev: bool,
 *              toolSelection: bool,
 *              fullscreen: bool,
 *              junk: bool,
 *              deleteAll: bool,
 *              settings: bool | {infoBoxes: bool, annoStyle: bool},
 *              filter: bool | {rotate: bool, clahe:bool},
 *              help: bool
 *          }
 * @event onAnnoSaveEvent - Callback with update information for a single 
 *          annotation or the current image that can be used for backend updates
 *          args: {
 *                      action: the action that was performed in frontend, 
 *                      anno: anno information, 
 *                      img: image information
 *              }
 * @event onNotification - Callback for Notification messages
 *      args: {title: str, message: str, type: str}
 * @event onCanvasKeyDown - Fires for keyDown on canvas 
 * @event onAnnoEvent - Fires when an anno performed an action
 *      args: {anno: annoObject, newAnnos: list of annoObjects, pAction: str}
 * @event onGetAnnoExample - Fires when anno example is requested by canvas
 *      {
 *          id: int, // -> ID of the annotation that will be requested as example
 *          comment: null or str
 *      }
 * @event onCanvasEvent - Fires on canvas event
 *      args: {action: action, data: dataObject}
 *      action -> CANVAS_SVG_UPDATE 
 *          data: {width: int, height: int, scale: float, translateX: float,
 *          translateY:float}
 *      action -> CANVAS_UI_CONFIG_UPDATE
 *      action -> CANVAS_LABEL_INPUT_CLOSE 
 *      action -> CANVAS_IMG_LOADED
 *      action -> CANVAS_IMGBAR_CLOSE
 * @event onToolBarEvent - Fires on Toolbar event
 *      args: {e: event, data: data object}
 * 
 *      e -> DELETE_ALL_ANNOS 
 *      e -> TOOL_SELECTED
 *          data: 'bbox', 'point', 'line', 'polygon'
 *      e -> GET_NEXT_IMAGE
 *          data: int // -> Image ID
 *      e -> GET_PREV_IMAGE
 *          data: int // -> Image ID
 *      e -> TASK_FINISHED
 *          data: null
 *      e -> SHOW_IMAGE_LABEL_INPUT
 *          data: null
 *      e -> IMG_IS_JUNK
 *          data: null
 *      e -> APPLY_FILTER
 *          data: {
 *              "clahe": {
 *                  "clipLimit": int,
 *                  "active": bool
 *              },
 *              "rotate": {
 *                  "angle": 90 | -90 | 180,
 *                  "active": bool
 *              }
 *          } 
 *      e -> SHOW_ANNO_DETAILS
 *          data: null
 *      e -> SHOW_LABEL_INFO
 *          data: null
 *      e -> SHOW_ANNO_STATS
 *          data: null
 *      e -> EDIT_STROKE_WIDTH
 *          data: int // -> Stroke width
 *      e -> EDIT_NODE_RADIUS
 *          data: int // -> Radius
 * @event onGetFunction - Get special canvas functions for manipulation from outside canvas
 *              deleteAllAnnos()
 *              unloadImage()
 *              resetZoom()
 *              getAnnos(annos,removeFrontendIds)
 */
const Sia = (props) => {

    const [fullscreenCSS, setFullscreenCSS] = useState('')
    const [fullscreen, setFullscreen] = useState()
    const [annos, setAnnos] = useState(noAnnos)
    const [layoutUpdate, setLayoutUpdate] = useState(0)
    const [svg, setSvg] = useState()
    const [externalConfigUpdate, setExternalConfigUpdate] = useState(false)
    const [uiConfig, setUiConfig] = useState(
        {
            "nodeRadius": 4,
            "strokeWidth": 4,
            "annoDetails": {
                "visible": false
            },
            "labelInfo": {
                "visible": false
            },
            "annoStats": {
                "visible": false
            },
            "layoutOffset": {
                "left": 20,
                "top": 0,
                "bottom": 5,
                "right": 5
            },
            "imgBarVisible": true,
            "imgLabelInputVisible": false,
            "centerCanvasInContainer": true,
            "maxCanvas": true
        }
    )
    const containerRef = useRef()

    useEffect(() => {
        doLayoutUpdate()
    }, [props.layoutUpdate])
    
    useEffect(() => {
        console.log(annos)
    }, [annos])

    useEffect(() => {
        console.log('props.annos', props.annos)
        if (props.annos){
            setAnnos(props.annos)
        } else {
            setAnnos({...noAnnos})

        }
    }, [props.annos])

    useEffect(() => {
        console.log('props.fullscreen', props.fullscreen)
        console.log('fullscreen', fullscreen)
        if (typeof props.fullscreen === 'boolean'){
            if (fullscreen !== props.fullscreen){
                setFullscreen(props.fullscreen)
            }
        }
    }, [props.fullscreen])

    useEffect(() => {
        if (fullscreen !== undefined){
            console.log('effect fullscreen', fullscreen)
            // toggleFullscreen()
            applyFullscreen(fullscreen)
        }
    }, [fullscreen])
    
    useEffect(() => {
        setExternalConfigUpdate(true)
        setUiConfig({...uiConfig, ...props.uiConfig})
    }, [props.uiConfig])

    useEffect(() => {
        if (externalConfigUpdate){
            setExternalConfigUpdate(false)
        }else{
            if (props.onCanvasEvent){
                props.onCanvasEvent(annoActions.CANVAS_UI_CONFIG_UPDATE, uiConfig)
            }
        }
    }, [uiConfig])

    const doLayoutUpdate = () => {
        setLayoutUpdate(layoutUpdate + 1)
    }

    const handleAnnoEvent = (anno, annos, action) => {
        console.log('handleAnnoEvent anno, annos, action', anno, annos, action)
        if (props.onAnnoEvent){
            props.onAnnoEvent(anno, annos, action)
        }

    }

    const handleNotification = (msg) => {
        if (props.onNotification){
            props.onNotification(msg)
        }

    }

    const handleCanvasKeyDown = (e) => {
        if (props.onCanvasKeyDown){
            props.onCanvasKeyDown(e)
        }

    }

    const handleCanvasEvent = (e, data) => {
        switch(e){
            case annoActions.CANVAS_SVG_UPDATE:
                setSvg(data)
                break
            case annoActions.CANVAS_UI_CONFIG_UPDATE:
                setUiConfig({...uiConfig, ...data})
                break
            default:
                break
        }
        if (props.onCanvasEvent){
            props.onCanvasEvent(e, data)
        }
    }

    const handleGetFunction = (canvasFunction) =>  {
        if (props.onGetFunction){
            props.onGetFunction(canvasFunction)
        }
    }

    const handleAnnoSaveEvent = (action, saveData) => {
        if (props.onAnnoSaveEvent){
            props.onAnnoSaveEvent(action, saveData)
        }
    }

    const applyFullscreen = (full) => {
        if (full){
            setFullscreenCSS('sia-fullscreen')
            setUiConfig({...uiConfig,
                layoutOffset: {
                    ...uiConfig.layoutOffset,
                    left: 50,
                    top: 5,
                } 
            })
            doLayoutUpdate()
        } else {
            setFullscreenCSS('')
            setUiConfig({...uiConfig,
                layoutOffset: {
                    ...uiConfig.layoutOffset,
                    left: 20,
                    top: 0,
                } 
            })
            doLayoutUpdate()
        }

    }

    const toggleFullscreen = () => {
        if (fullscreen){
            setFullscreen(false)
        } else {
            setFullscreen(true)
        }
    }

    const handleToolBarEvent = (e, data) => {
        switch(e){
            case tbe.SET_FULLSCREEN:
                toggleFullscreen()
                break
            case tbe.SHOW_ANNO_DETAILS:
                setUiConfig({
                    ...uiConfig,
                    annoDetails: {
                        ...uiConfig.annoDetails,
                        visible: !uiConfig.annoDetails.visible,
                    },
                })
                break
            case tbe.SHOW_LABEL_INFO:
                setUiConfig({
                    ...uiConfig,
                    labelInfo: {
                        ...uiConfig.labelInfo,
                        visible: !uiConfig.labelInfo.visible,
                    },
                })
                break
            case tbe.SHOW_ANNO_STATS:
                setUiConfig({
                    ...uiConfig,
                    annoStats: {
                        ...uiConfig.annoStats,
                        visible: !uiConfig.annoStats.visible,
                    },
                })
                break
            case tbe.EDIT_STROKE_WIDTH:
                setUiConfig({...uiConfig, strokeWidth: data})
                break
            case tbe.EDIT_NODE_RADIUS:
                setUiConfig({...uiConfig, nodeRadius: data})
                break
            default:
                break
        }
        if (props.onToolBarEvent){
            props.onToolBarEvent(e, data)
        }
    }

    return (
        <div className={fullscreenCSS} ref={containerRef}>
            <Canvas
                container={containerRef}

                onAnnoEvent={
                    (anno, annos, action) => handleAnnoEvent(anno, annos, action)
                }
                onNotification={
                    (messageObj) => handleNotification(messageObj)
                }
                onKeyDown={
                    e => handleCanvasKeyDown(e)
                }
                onCanvasEvent={
                    (action, data) => handleCanvasEvent(action, data)
                }
                onGetAnnoExample={
                    (exampleArgs) => props.onGetAnnoExample ? props.onGetAnnoExample(exampleArgs):{} 
                }
                onGetFunction={(canvasFunc) => handleGetFunction(canvasFunc)}
                onAnnoSaveEvent={(saveData) => handleAnnoSaveEvent(saveData)}

                annoSaveResponse={props.annoSaveResponse}
                canvasConfig={props.canvasConfig}
                uiConfig={uiConfig}
                annos={annos}
                imageMeta={props.imageMeta}
                imageBlob={props.imageBlob}
                possibleLabels={props.possibleLabels}
                exampleImg={props.exampleImg}
                lockedAnnos={props.lockedAnnos}
                layoutUpdate={layoutUpdate}
                selectedTool={props.selectedTool}
                isJunk={props.isJunk}
                blocked={props.blockCanvas}
                defaultLabel={props.defaultLabel}
                preventScrolling={props.preventScrolling}
            />
            <ToolBar 
                onToolBarEvent={
                    (e, data) => handleToolBarEvent(e, data)
                }
                imageMeta={props.imageMeta}
                layoutUpdate={layoutUpdate}
                svg={svg}
                active={{
                    isJunk: props.isJunk,
                    selectedTool: props.selectedTool,
                    fullscreen: props.fullscreenMode
                }}
                enabled={props.toolbarEnabled}
                canvasConfig={props.canvasConfig}
                uiConfig={uiConfig}
                filter={props.filter}
            />
        </div>
    )

}

export default Sia