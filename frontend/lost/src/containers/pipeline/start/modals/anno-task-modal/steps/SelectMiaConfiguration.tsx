import {
    CCol,
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CFormInput,
    CFormSwitch,
    CRow,
} from '@coreui/react'
import { useNodesData, useReactFlow } from '@xyflow/react'
import HelpButton from '../../../../../../components/HelpButton'
import { AnnoTaskNodeData } from '../../../nodes'

interface SelectMiaConfigurationProps {
    nodeId: string
}

export const SelectMiaConfiguration = ({ nodeId }: SelectMiaConfigurationProps) => {
    const nodeData = useNodesData(nodeId)
    const { configuration } = nodeData?.data as AnnoTaskNodeData

    const { updateNodeData } = useReactFlow()

    const changeValue = (key, value) => {
        const newConfiguration = { ...configuration }
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
        updateNodeData(nodeId, { configuration: newConfiguration })
    }
    return (
        <>
            {configuration ? (
                <div id="mia-configuration-heading">
                    <h4 className="mb-3 text-center">MIA Configuration</h4>
                    <CRow style={{ margin: '5px' }}>
                        <CCol sm="6">
                            <CRow>
                                <CCol sm="2">
                                    <CFormSwitch
                                        size="xl"
                                        className={'mx-1'}
                                        color={'primary'}
                                        checked={configuration.showProposedLabel}
                                        onChange={() =>
                                            changeValue(
                                                'show-proposed-label',
                                                !configuration.showProposedLabel,
                                            )
                                        }
                                    />
                                </CCol>
                                <CCol>
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
                        </CCol>
                    </CRow>
                    <hr />

                    <CRow style={{ margin: '5px' }}>
                        <h4>
                            Annotation Type
                            <HelpButton
                                id="anno-type"
                                text={
                                    'If annotation requests are based on whole images or two_d annotations (in example from a previous SIA annotation step)'
                                }
                            />
                        </h4>
                        <CRow style={{ marginLeft: '5px' }}>
                            <CDropdown>
                                <CDropdownToggle color="primary">
                                    {configuration.type}
                                </CDropdownToggle>
                                <CDropdownMenu>
                                    <CDropdownItem
                                        href="#"
                                        onClick={() =>
                                            changeValue('anno-type', 'annoBased')
                                        }
                                    >
                                        annoBased
                                    </CDropdownItem>
                                    <CDropdownItem
                                        href="#"
                                        onClick={() =>
                                            changeValue('anno-type', 'imageBased')
                                        }
                                    >
                                        imageBased
                                    </CDropdownItem>
                                </CDropdownMenu>
                            </CDropdown>
                        </CRow>
                        <CRow>
                            {configuration.type === 'annoBased' ? (
                                <>
                                    <CRow>
                                        <CCol sm="4" style={{ marginTop: '10px' }}>
                                            <CFormSwitch
                                                size="xl"
                                                className={'mx-1'}
                                                color={'primary'}
                                                checked={configuration.drawAnno}
                                                onChange={() =>
                                                    changeValue(
                                                        'draw-anno',
                                                        !configuration.drawAnno,
                                                    )
                                                }
                                            />
                                        </CCol>
                                        <CCol style={{ marginTop: '10px' }}>
                                            <b
                                                style={{
                                                    marginLeft: '20px',
                                                }}
                                            >
                                                Draw Anno
                                                <HelpButton
                                                    id="draw-anno"
                                                    text={
                                                        'Draw 2D annotations on the image.'
                                                    }
                                                />
                                            </b>
                                        </CCol>
                                    </CRow>

                                    <CRow
                                        style={{
                                            marginLeft: '5px',
                                            marginTop: '10px',
                                        }}
                                    >
                                        <CCol sm="4" style={{ marginTop: '10px' }}>
                                            <CFormInput
                                                type="number"
                                                min={0.0}
                                                step={0.01}
                                                max={1.0}
                                                value={configuration.addContext || 0.3}
                                                onChange={(e) =>
                                                    changeValue(
                                                        'add-context',
                                                        e.currentTarget.value,
                                                    )
                                                }
                                            />
                                        </CCol>
                                        <CCol style={{ marginTop: '10px' }}>
                                            <b
                                                style={{
                                                    marginLeft: '20px',
                                                }}
                                            >
                                                Add Context
                                                <HelpButton
                                                    id="add-context"
                                                    text={`A margin of pixels is added around the annotation when it is cropped. The number of pixels is calculated relative to the image size. For example, setting addContext to 0.1 adds 10% of the image size to the crop. This helps provide the annotator with more visual context during annotation.`}
                                                />
                                            </b>
                                        </CCol>
                                    </CRow>
                                </>
                            ) : (
                                ''
                            )}
                        </CRow>
                    </CRow>
                </div>
            ) : (
                ''
            )}
        </>
    )
}
