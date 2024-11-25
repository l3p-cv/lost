import React, { useState, useEffect } from 'react'
import { Menu } from 'semantic-ui-react'

const ImgBar = ({ svg, imgLabelIds, possibleLabels, imageMeta, annos, annoTaskId, visible, onLabelUpdate, onMouseEnter, onClose }) => {
    const [position, setPosition] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (svg) {
            setPosition({
                ...position,
                left: svg.left,
                top: svg.top,
            })
        }
    }, [svg])

    // const handleLabelUpdate = (label) => {
    //     if (onLabelUpdate) {
    //         onLabelUpdate(label)
    //     }
    // }

    // const handleClose = () => {
    //     if (onClose) {
    //         onClose()
    //     }
    // }

    const handleMouseEnter = (e) => {
        if (onMouseEnter) {
            onMouseEnter(e)
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
        if (imgLabelIds && imgLabelIds.length > 0) {
            let labelObject
            imgLabelIds.forEach((lbl, idx) => {
                labelObject = possibleLabels.find(el => {
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
        if (imageMeta.description) {
            return <Menu.Item>
                {imageMeta.description}
            </Menu.Item>
        } else {
            return null
        }
    }

    const renderAnnoTaskId = () => {

        if (!annoTaskId) return null

        return <Menu.Item>
            Annotask ID: {annoTaskId}
        </Menu.Item>
    }

    if (!visible) return null
    if (!imageMeta) return null

    return (
        <div style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: svg.width,
            minWidth: '300px'
        }}
            onMouseEnter={e => { handleMouseEnter(e) }}
        >
            <Menu inverted style={{ opacity: 0.9, justifyContent: 'center', alignItems: 'center' }}>
                {/* { renderImgLabelInput() } */}
                {renderImgDescription()}
                {renderAnnoTaskId()}
                <Menu.Item>
                    {/* { annos.image.url.split('/').pop() +" (ID: " + annos.image.id + ")" } */}
                    {"ID: " + imageMeta.id}
                </Menu.Item>
                <Menu.Item>
                    {imageMeta.number + " / " + imageMeta.amount}
                </Menu.Item>
                {renderImgLabels()}
            </Menu>
        </div>
    )
}

export default ImgBar
