import React, { useRef, useEffect, useState } from 'react'

import ToolBar from './ToolBar'
import Canvas from './Canvas'

const Sia = (props) => {

    const [fullscreenCSS, setFullscreenCSS] = useState('')
    const toolbarRef = useRef()
    const containerRef = useRef()
    const canvasRef = useRef()

    useEffect(() => {
        if (props.onGetRefs){
            props.onGetRefs(containerRef, canvasRef, toolbarRef)
        }
    }, [])

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
                uiConfig={props.uiConfig}

                nextAnnoId={props.nextAnnoId}
                annos={props.annos}
                imageMeta={props.imageMeta}
                imageBlob={props.imageBlob}
                possibleLabels={props.possibleLabels}
                exampleImg={props.exampleImg}

                layoutUpdate={props.layoutUpdate}
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
                layoutUpdate={props.layoutUpdate}

                svg={props.svg}
                active={{
                    isJunk: props.isJunk,
                    selectedTool: props.selectedTool,
                    fullscreen: props.fullscreenMode
                }}
                canvasConfig={props.canvasConfig}
                uiConfig={props.uiConfig}
                filter={props.filter}
            />
        </div>
    )

}

export default Sia