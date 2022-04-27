import React, { useRef, useEffect, useState } from 'react'

import ToolBar from './ToolBar'
import Canvas from './Canvas'
import * as tbe from './types/toolbarEvents'

const Sia = (props) => {

    const [fullscreenCSS, setFullscreenCSS] = useState('')
    const [layoutUpdate, setLayoutUpdate] = useState(0)
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
    const toolbarRef = useRef()
    const containerRef = useRef()
    const canvasRef = useRef()

    useEffect(() => {
        if (props.onGetRefs){
            props.onGetRefs(containerRef, canvasRef, toolbarRef)
        }
    }, [])

    useEffect(() => {
        doLayoutUpdate()
    }, [props.layoutUpdate])

    useEffect(() => {
        setUiConfig({...uiConfig, ...props.uiConfig})
    }, [props.uiConfig])

    const doLayoutUpdate = () => {
        setLayoutUpdate(layoutUpdate + 1)
    }

    const handleAnnoEvent = (anno, annos, action) => {
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
        if (props.onCanvasEvent){
            props.onCanvasEvent(e, data)
        }
    }

    const handleToolBarEvent = (e, data) => {
        console.log('Sia handleToolBarEvent', e)
        switch(e){
            case tbe.SET_FULLSCREEN:
                // this.props.siaSetFullscreen(!this.props.fullscreenMode)
                if (fullscreenCSS === ''){
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
                ref={canvasRef} 
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

                canvasConfig={props.canvasConfig}
                uiConfig={uiConfig}

                nextAnnoId={props.nextAnnoId}
                annos={props.annos}
                imageMeta={props.imageMeta}
                imageBlob={props.imageBlob}
                possibleLabels={props.possibleLabels}
                exampleImg={props.exampleImg}

                layoutUpdate={layoutUpdate}
                selectedTool={props.selectedTool}
                isJunk={props.isJunk}
                blocked={props.blockCanvas}
                defaultLabel={props.defaultLabel}
            />
            <ToolBar 
                ref={toolbarRef} 
                onToolBarEvent={
                    (e, data) => handleToolBarEvent(e, data)
                }
                imageMeta={props.imageMeta}
                layoutUpdate={layoutUpdate}

                svg={props.svg}
                active={{
                    isJunk: props.isJunk,
                    selectedTool: props.selectedTool,
                    fullscreen: props.fullscreenMode
                }}
                canvasConfig={props.canvasConfig}
                uiConfig={uiConfig}
                filter={props.filter}
            />
        </div>
    )

}

export default Sia