import React, { Component } from 'react'

const Sia = (props) => {

    return (
        <div className={this.state.fullscreenCSS} ref={this.container}>
            <Canvas
                ref={this.canvas} 
                container={this.container}

                onAnnoEvent={(anno, annos, action) => this.handleAnnoPerformedAction(anno, annos, action)}
                onNotification={(messageObj) => this.handleNotification(messageObj)}
                onKeyDown={ e => this.handleCanvasKeyDown(e)}
                onCanvasEvent={(action, data) => this.handleCanvasEvent(action, data)}
                onGetAnnoExample={(exampleArgs) => this.props.onGetAnnoExample ? this.props.onGetAnnoExample(exampleArgs):{} }

                canvasConfig={{
                    ...this.props.canvasConfig,
                    annos: {...this.props.canvasConfig.annos, maxAnnos:null},
                    autoSaveInterval:60,
                    allowedToMarkExample:this.state.allowedToMark
                }}

                uiConfig={{...this.props.uiConfig,
                    layoutOffset:this.state.layoutOffset,
                    imgBarVisible: true,
                    imgLabelInputVisible: this.props.imgLabelInput.show,
                    centerCanvasInContainer: true,
                    maxCanvas: true
                }}

                nextAnnoId={this.state.nextAnnoId}
                annos={this.state.annos.annotations}
                imageMeta={this.state.annos.image}
                imageBlob={this.state.image.data}
                possibleLabels={this.props.possibleLabels}
                exampleImg={this.props.exampleImg}

                layoutUpdate={this.props.layoutUpdate}
                selectedTool={this.props.selectedTool}
                isJunk={this.props.isJunk}
                blocked={this.state.blockCanvas}
                // defaultLabel='no label'
            />
            <ToolBar 
                ref={this.toolbar} 
                onToolBarEvent={
                    (e, data) => this.handleToolBarEvent(e, data)
                }
                imageMeta={this.state.annos.image}
                layoutUpdate={this.props.layoutUpdate}

                svg={this.props.svg}
                active={{
                    isJunk: this.props.isJunk,
                    selectedTool: this.props.selectedTool,
                    fullscreen: this.props.fullscreenMode
                }}
                canvasConfig={this.props.canvasConfig}
                uiConfig={this.props.uiConfig}
                filter={this.props.filter}
                />
            <NotificationContainer/>
            </div>
    )

}

export default Sia