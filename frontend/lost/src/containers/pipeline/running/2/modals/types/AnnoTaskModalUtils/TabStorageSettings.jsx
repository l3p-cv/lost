import React from 'react'
import { CCol, CContainer, CFormInput, CRow } from '@coreui/react'
import HelpButton from '../../../../../../../components/HelpButton'
import LabelInput from '../../../../../../Annotation/SIA/lost-sia/src/LabelInput'

const TabStorageSettings = ({ annoTask, datasetList, datasourceList }) => {

    console.log(datasourceList);

    return (
        <CContainer>
            <CRow style={{ marginLeft: '5px' }}>
                <CCol sm="6">
                    <CRow xs={{ gutterY: 3 }}>
                        <CCol sm="12">
                            <h4>
                                Export Name
                                <HelpButton
                                    id="export-name"
                                    text={`Give your export file a name.`}
                                />
                            </h4>
                            <CRow>
                                <CCol>
                                    <CFormInput
                                        type="text"
                                        id="dataset"
                                        list="datasetOptions"
                                    // value={newExport.exportName}
                                    // onChange={(e) =>
                                    //     setNewExport({
                                    //         ...newExport,
                                    //         exportName: e.currentTarget.value,
                                    //     })
                                    // }
                                    />
                                    <LabelInput possibleLabelsProp={Object.values(datasourceList)} />
                                </CCol>
                            </CRow>
                        </CCol>
                    </CRow>
                </CCol>
            </CRow>
        </CContainer>
    )
}

export default TabStorageSettings
