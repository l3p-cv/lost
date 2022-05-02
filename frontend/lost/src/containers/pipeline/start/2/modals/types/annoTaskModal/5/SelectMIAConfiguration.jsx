import React, { useEffect, useState } from 'react'
import HelpButton from '../../../../../../../../components/HelpButton'
import {
    CCard,
    CCardBody,
    CRow,
    CCol,
    CSwitch,
    CInput,
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
} from '@coreui/react'

import { useSelector, useDispatch } from 'react-redux'

const loadElements = (state) => {
    if (state.pipelineStart) {
        if (state.pipelineStart.step1Data) {
            return state.pipelineStart.step1Data.elements
        }
    }
    return undefined
}

export const SelectMIAConfiguration = ({ ...props }) => {
    const dispatch = useDispatch()
    const [configuration, setConfiguration] = useState(undefined)
    const elements = useSelector((state) => loadElements(state))

    useEffect(() => {
        if (elements) {
            elements.find((el) => {
                if (el.peN === props.peN) {
                    setConfiguration(el.exportData.annoTask.configuration)
                    return true
                }
                return false
            })
        }
    }, [elements])

    useEffect(() => {
        if (configuration === undefined) {
            if (props.peN === undefined) {
                setConfiguration(props.configuration)
            }
        }
    }, [props])

    const changeValue = (key, value) => {
        let newConfiguration = { ...configuration }
        switch (key) {
            case 'show-proposed-label':
                newConfiguration.showProposedLabel = value
                break
            case 'anno-type':
                newConfiguration.type = value
                break
            case 'draw-anno':
                newConfiguration.drawAnno = value
                break
            case 'add-context':
                newConfiguration.addContext = value
                break
            default:
                break
        }
        if (props.peN) {
            dispatch({
                type: 'PIPELINE_START_ANNO_TASK_UPDATE_CONFIGURATION',
                payload: { elementId: props.peN, configuration: newConfiguration },
            })
        } else {
            setConfiguration(newConfiguration)
            props.onUpdate(newConfiguration)
        }
    }
    return (
        <>
            {configuration ? (
                <>
                    <CRow style={{ margin: '5px' }}>
                        <CCol sm="12">
                            <h4>MIA Configuration</h4>
                            <CRow>
                                <CCol sm="12">
                                    <CSwitch
                                        className={'mx-1'}
                                        variant={'3d'}
                                        color={'primary'}
                                        checked={configuration.showProposedLabel}
                                        onChange={(e) =>
                                            changeValue(
                                                'show-proposed-label',
                                                !configuration.showProposedLabel,
                                            )
                                        }
                                    />
                                    <b
                                        style={{
                                            marginLeft: '20px',
                                        }}
                                    >
                                        Show proposed label
                                        <HelpButton
                                            id="show-proposed-label"
                                            text={'Show proposed label (if given)'}
                                        />
                                    </b>
                                </CCol>
                            </CRow>
                            <h4>Annotation Type</h4>
                            <CRow>
                                <CCol sm="12">
                                    <CRow style={{ marginLeft: '5px' }}>
                                        <CDropdown>
                                            <CDropdownToggle color="primary">
                                                {configuration.type}
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                <CDropdownItem
                                                    href="#"
                                                    onClick={(e) =>
                                                        changeValue(
                                                            'anno-type',
                                                            'annoBased',
                                                        )
                                                    }
                                                >
                                                    annoBased
                                                </CDropdownItem>
                                                <CDropdownItem
                                                    href="#"
                                                    onClick={(e) =>
                                                        changeValue(
                                                            'anno-type',
                                                            'imageBased',
                                                        )
                                                    }
                                                >
                                                    imageBased
                                                </CDropdownItem>
                                            </CDropdownMenu>
                                        </CDropdown>
                                        <b
                                            style={{
                                                marginLeft: '20px',
                                            }}
                                        >
                                            Annotation type
                                            <HelpButton
                                                id="anno-type"
                                                text={
                                                    'Weather annotation requests are based on whole images or two_d annotations (in example from a previous SIA annotation step)'
                                                }
                                            />
                                        </b>
                                    </CRow>
                                </CCol>
                                {configuration.type === 'annoBased' ? (
                                    <>
                                        <CCol sm="12" style={{ marginTop: '15px' }}>
                                            <CSwitch
                                                className={'mx-1'}
                                                variant={'3d'}
                                                color={'primary'}
                                                checked={configuration.drawAnno}
                                                onChange={(e) =>
                                                    changeValue(
                                                        'draw-anno',
                                                        !configuration.drawAnno,
                                                    )
                                                }
                                            />
                                            <b
                                                style={{
                                                    marginLeft: '20px',
                                                }}
                                            >
                                                Draw Anno
                                                <HelpButton
                                                    id="draw-anno"
                                                    text={
                                                        'Weather to draw two_d annnotations into the image'
                                                    }
                                                />
                                            </b>
                                        </CCol>
                                        <CCol sm="12">
                                            <CRow
                                                style={{
                                                    marginLeft: '5px',
                                                    marginTop: '10px',
                                                }}
                                            >
                                                <CInput
                                                    type="number"
                                                    min={0.0}
                                                    step={0.01}
                                                    max={1.0}
                                                    style={{ maxWidth: '20%' }}
                                                    value={configuration.addContext}
                                                    onChange={(e) =>
                                                        changeValue(
                                                            'add-context',
                                                            e.currentTarget.value,
                                                        )
                                                    }
                                                />
                                                <b
                                                    style={{
                                                        marginLeft: '20px',
                                                    }}
                                                >
                                                    Add Context
                                                    <HelpButton
                                                        id="add-context"
                                                        text={`Add some amount of pixels will be added around the annotation when the
                                                        annotation is cropped.
                                                        The number of pixels that are add is calculated relative to the
                                                        image size.
                                                        So if you set addContext to 0.1,
                                                        10 percent of the image size will be added to the crop.
                                                        This setting is useful to provide the annotator some more visual
                                                        context during the annotation step. `}
                                                    />
                                                </b>
                                            </CRow>
                                        </CCol>
                                    </>
                                ) : (
                                    ''
                                )}
                            </CRow>
                        </CCol>
                    </CRow>
                </>
            ) : (
                ''
            )}
        </>
    )
}

export default SelectMIAConfiguration
