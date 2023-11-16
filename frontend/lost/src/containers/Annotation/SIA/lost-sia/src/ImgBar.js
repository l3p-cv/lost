import React, { useState, useEffect } from 'react'
import { Menu } from 'semantic-ui-react'

const ImgBar = (props) => {
    const [position, setPosition] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (props.svg) {
            setPosition({
                ...position,
                left: props.svg.left,
                top: props.svg.top,
            })
        }
    }, [props.svg])

    const handleLabelUpdate = (label) => {
        if (props.onLabelUpdate) {
            props.onLabelUpdate(label)
        }
    }

    const handleClose = () => {
        if (props.onClose) {
            props.onClose()
        }
    }

    const handleMouseEnter = (e) => {
        if (props.onMouseEnter) {
            props.onMouseEnter(e)
        }
    }

    // renderImgLabelInput(){
    //     if (this.props.allowedActions.label){
    //         return <Menu.Item style={{padding: "5px"}}>
    //             <LabelInput
    //                 // multilabels={true}
    //                 multilabels={this.props.multilabels}
    //                 relatedId={this.props.annos.image.id}
    //                 visible={this.props.visible}
    //                 onLabelUpdate={label => this.handleLabelUpdate(label)}
    //                 possibleLabels={this.props.possibleLabels}
    //                 initLabelIds={this.props.imgLabelIds}
    //                 relatedId={this.props.annos.image.id}
    //                 disabled={!this.props.allowedActions.label}
    //                 />
    //         </Menu.Item>
    //     } else {
    //         return null
    //     }
    // }

    const renderImgLabels = () => {
        let label = ''
        if (props.imgLabelIds && props.imgLabelIds.length > 0) {
            let labelObject
            props.imgLabelIds.forEach((lbl, idx) => {
                labelObject = props.possibleLabels.find(el => {
                    return el.id === lbl
                })
                if (idx > 0) label += ', '
                label += labelObject.label
            })
            return <Menu.Item>
                {label}
            </Menu.Item>
        } else {
            return null
        }
    }

    const renderImgDescription = () => {
        if (props.imageMeta.description) {
            return <Menu.Item>
                {props.imageMeta.description}
            </Menu.Item>
        } else {
            return null
        }
    }

    if (!props.visible) return null
    if (!props.imageMeta) return null

    return (
        <div style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: props.svg.width,
            minWidth: '300px'
        }}
            onMouseEnter={e => { handleMouseEnter(e) }}
        >
            <Menu inverted style={{ opacity: 0.9, justifyContent: 'center', alignItems: 'center' }}>
                {/* {this.renderImgLabelInput()} */}
                {renderImgDescription()}
                <Menu.Item>
                    {/* {this.props.annos.image.url.split('/').pop() +" (ID: "+this.props.annos.image.id+")"} */}
                    {"ID: " + props.imageMeta.id}
                </Menu.Item>
                <Menu.Item>
                    {props.imageMeta.number + " / " + props.imageMeta.amount}
                </Menu.Item>
                {renderImgLabels()}
            </Menu>
        </div>
    )
}

export default ImgBar
