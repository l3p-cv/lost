import { CCol, CFormInput, CFormSwitch, CRow } from '@coreui/react'
import { useNodesData, useReactFlow } from '@xyflow/react'
import HelpButton from '../../../../../../components/HelpButton'
import { AnnoTaskNodeData } from '../../../nodes'

interface SelectSiaConfigurationProps {
    nodeId: string
}

export const SelectSiaConfiguration = ({ nodeId }: SelectSiaConfigurationProps) => {
    const nodeData = useNodesData(nodeId)
    const { configuration } = nodeData?.data as AnnoTaskNodeData

    const { updateNodeData } = useReactFlow()

    const changeValue = (key, value) => {
        const newConfiguration = { ...configuration }
        switch (key) {
            case 'tool-bbox':
                newConfiguration.tools.bbox = value
                break
            case 'tool-polygon':
                newConfiguration.tools.polygon = value
                break
            case 'tool-point':
                newConfiguration.tools.point = value
                break
            case 'tool-line':
                newConfiguration.tools.line = value
                break
            case 'action-draw':
                newConfiguration.annos.actions.draw = value
                break
            case 'action-edit':
                newConfiguration.annos.actions.edit = value
                break
            case 'action-label':
                newConfiguration.annos.actions.label = value
                break
            case 'action-multilabel':
                newConfiguration.annos.multilabels = value
                break
            case 'annos-minarea':
                newConfiguration.annos.minArea = value
                break
            case 'image-junk':
                newConfiguration.tools.junk = value
                break
            case 'image-label':
                newConfiguration.img.actions.label = value
                break
            case 'image-multilabel':
                newConfiguration.img.multilabels = value
                break
            default:
                break
        }
        updateNodeData(nodeId, { configuration: newConfiguration })
    }
    return (
        <>
            {configuration ? (
                <div id="sia-configuration-heading">
                    <h4 className="mb-3 text-center">SIA Configuration</h4>
                    <CRow style={{ margin: '5px' }}>
                        <CCol sm="6">
                            <h4>Annotation Types</h4>
                            <CRow>
                                <CCol sm="12" style={{ marginTop: '5px' }}>
                                    <CRow>
                                        <CCol sm="2">
                                            <CFormSwitch
                                                size="xl"
                                                className={'mx-1'}
                                                color={'primary'}
                                                checked={configuration.tools.bbox}
                                                onChange={() =>
                                                    changeValue(
                                                        'tool-bbox',
                                                        !configuration.tools.bbox,
                                                    )
                                                }
                                            />
                                        </CCol>
                                        <CCol>
                                            <b>
                                                Bbox
                                                <HelpButton
                                                    id="bbox"
                                                    text={'Allow to add / edit bboxes'}
                                                />
                                            </b>
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol sm="12" style={{ marginTop: '5px' }}>
                                    <CRow>
                                        <CCol sm="2">
                                            <CFormSwitch
                                                size="xl"
                                                className={'mx-1'}
                                                color={'primary'}
                                                checked={configuration.tools.polygon}
                                                onChange={() =>
                                                    changeValue(
                                                        'tool-polygon',
                                                        !configuration.tools.polygon,
                                                    )
                                                }
                                            />
                                        </CCol>
                                        <CCol>
                                            <b>
                                                Polygon
                                                <HelpButton
                                                    id="polygon"
                                                    text={'Allow to add / edit polygons'}
                                                />
                                            </b>
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol sm="12" style={{ marginTop: '5px' }}>
                                    <CRow>
                                        <CCol sm="2">
                                            <CFormSwitch
                                                size="xl"
                                                className={'mx-1'}
                                                color={'primary'}
                                                checked={configuration.tools.point}
                                                onChange={() =>
                                                    changeValue(
                                                        'tool-point',
                                                        !configuration.tools.point,
                                                    )
                                                }
                                            />
                                        </CCol>
                                        <CCol>
                                            <b>
                                                Point
                                                <HelpButton
                                                    id="point"
                                                    text={'Allow to add / edit points'}
                                                />
                                            </b>
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol sm="12" style={{ marginTop: '5px' }}>
                                    <CRow>
                                        <CCol sm="2">
                                            <CFormSwitch
                                                size="xl"
                                                className={'mx-1'}
                                                color={'primary'}
                                                checked={configuration.tools.line}
                                                onChange={() =>
                                                    changeValue(
                                                        'tool-line',
                                                        !configuration.tools.line,
                                                    )
                                                }
                                            />
                                        </CCol>
                                        <CCol>
                                            <b>
                                                Line
                                                <HelpButton
                                                    id="line"
                                                    text={'Allow to add / edit lines'}
                                                />
                                            </b>
                                        </CCol>
                                    </CRow>
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol sm="6">
                            {' '}
                            <h4>Annotation Actions</h4>
                            <CRow>
                                <CCol sm="12" style={{ marginTop: '5px' }}>
                                    <CRow>
                                        <CCol sm="2">
                                            <CFormSwitch
                                                size="xl"
                                                className={'mx-1'}
                                                color={'primary'}
                                                checked={configuration.annos.actions.draw}
                                                onChange={() =>
                                                    changeValue(
                                                        'action-draw',
                                                        !configuration.annos.actions.draw,
                                                    )
                                                }
                                            />
                                        </CCol>
                                        <CCol>
                                            <b>
                                                Draw
                                                <HelpButton
                                                    id="draw-anno"
                                                    text={'Allow to add new annotations'}
                                                />
                                            </b>
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol sm="12" style={{ marginTop: '5px' }}>
                                    <CRow>
                                        <CCol sm="2">
                                            <CFormSwitch
                                                size="xl"
                                                className={'mx-1'}
                                                color={'primary'}
                                                checked={configuration.annos.actions.edit}
                                                onChange={() =>
                                                    changeValue(
                                                        'action-edit',
                                                        !configuration.annos.actions.edit,
                                                    )
                                                }
                                            />
                                        </CCol>
                                        <CCol>
                                            <b>
                                                Edit
                                                <HelpButton
                                                    id="edit-anno"
                                                    text={
                                                        'Allow to edit an annotation (move / change size and points)'
                                                    }
                                                />
                                            </b>
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol sm="12" style={{ marginTop: '5px' }}>
                                    <CRow>
                                        <CCol sm="2">
                                            <CFormSwitch
                                                size="xl"
                                                className={'mx-1'}
                                                color={'primary'}
                                                checked={
                                                    configuration.annos.actions.label
                                                }
                                                onChange={() =>
                                                    changeValue(
                                                        'action-label',
                                                        !configuration.annos.actions
                                                            .label,
                                                    )
                                                }
                                            />
                                        </CCol>
                                        <CCol>
                                            <b>
                                                Label
                                                <HelpButton
                                                    id="label-anno"
                                                    text={
                                                        'Allow to apply a label to an annotation'
                                                    }
                                                />
                                            </b>
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol sm="12" style={{ marginTop: '5px' }}>
                                    <CRow>
                                        <CCol sm="2">
                                            <CFormSwitch
                                                size="xl"
                                                className={'mx-1'}
                                                color={'primary'}
                                                defaultChecked
                                                checked={configuration.annos.multilabels}
                                                onChange={() =>
                                                    changeValue(
                                                        'action-multilabel',
                                                        !configuration.annos.multilabels,
                                                    )
                                                }
                                            />
                                        </CCol>
                                        <CCol>
                                            <b>
                                                Multilabel
                                                <HelpButton
                                                    id="multilabel-anno"
                                                    text={
                                                        'Allow to apply multiple labels to an annotation'
                                                    }
                                                />
                                            </b>
                                        </CCol>
                                    </CRow>
                                </CCol>
                            </CRow>
                        </CCol>
                    </CRow>
                    <hr />
                    <CRow style={{ margin: '5px' }}>
                        <CCol sm="12" style={{ marginTop: '5px' }}>
                            <h4>
                                Minimum Annotation Size{' '}
                                <HelpButton
                                    id="min-anno-area"
                                    text={
                                        'Allow only annotations with an area greater than value in pixel ( only applies to polygons and bboxes)'
                                    }
                                />
                            </h4>
                            <CFormInput
                                type="number"
                                min={1}
                                step={1}
                                value={configuration.annos.minArea}
                                onChange={(e) =>
                                    changeValue('annos-minarea', e.currentTarget.value)
                                }
                            />
                        </CCol>
                    </CRow>
                    <hr />
                    <CRow style={{ margin: '5px' }}>
                        <CCol sm="12" style={{ marginTop: '5px' }}>
                            <h4>Image</h4>
                            <CCol sm="12" style={{ marginTop: '5px' }}>
                                <CRow>
                                    <CCol sm="2">
                                        <CFormSwitch
                                            size="xl"
                                            className={'mx-1'}
                                            color={'primary'}
                                            checked={configuration.tools.junk}
                                            onChange={() =>
                                                changeValue(
                                                    'image-junk',
                                                    !configuration.tools.junk,
                                                )
                                            }
                                        />
                                    </CCol>
                                    <CCol>
                                        <b>
                                            Junk
                                            <HelpButton
                                                id="junk-image"
                                                text={'Allow to mark whole image as junk'}
                                            />
                                        </b>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol sm="12" style={{ marginTop: '5px' }}>
                                <CRow>
                                    <CCol sm="2">
                                        <CFormSwitch
                                            size="xl"
                                            className={'mx-1'}
                                            color={'primary'}
                                            checked={configuration.img.actions.label}
                                            onChange={() =>
                                                changeValue(
                                                    'image-label',
                                                    !configuration.img.actions.label,
                                                )
                                            }
                                        />
                                    </CCol>
                                    <CCol>
                                        <b>
                                            Label
                                            <HelpButton
                                                id="label-image"
                                                text={'Allow to label the whole image'}
                                            />
                                        </b>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol sm="12" style={{ marginTop: '5px' }}>
                                <CRow>
                                    <CCol sm="2">
                                        <CFormSwitch
                                            size="xl"
                                            className={'mx-1'}
                                            color={'primary'}
                                            checked={configuration.img.multilabels}
                                            onChange={() =>
                                                changeValue(
                                                    'image-multilabel',
                                                    !configuration.img.multilabels,
                                                )
                                            }
                                        />
                                    </CCol>
                                    <CCol>
                                        <b>
                                            Multilabel
                                            <HelpButton
                                                id="multilabel-image"
                                                text={
                                                    'Allow to apply multiple labels to the whole image'
                                                }
                                            />
                                        </b>
                                    </CCol>
                                </CRow>
                            </CCol>
                        </CCol>
                    </CRow>
                </div>
            ) : (
                ''
            )}
        </>
    )
}
