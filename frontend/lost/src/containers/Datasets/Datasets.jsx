import React from 'react'
import { CCol, CContainer, CRow } from '@coreui/react'
import IconButton from '../../components/IconButton'
import { faFolderPlus, faTag } from '@fortawesome/free-solid-svg-icons'
import DatasetTable from './DatasetTable'

const datasources = {
    1: "MLDATA-SSI",
    2: "DerGeraet-SSH",
    3: "FTP01"
}

const datasetList = [
    {
        "id": 1,
        "name": "DS 1",
        "description": "Dataset about car parts",
        "datasource": 1,
        "created_at": "2023-09-05 12:05:14",
        "annotasks": [],
    },
    {
        "id": 2,
        "name": "DS 2",
        "description": "Dataset 2",
        "datasource": 3,
        "created_at": "2023-09-05 12:05:14",
        "annotasks": [{
            "isAnnotask": true,
            "id": 1,
            "name": "Annotask3475",
            "description": "Dataset about car parts",
            "created_at": "2023-09-05 12:05:14"
        }]
    },
    {
        "id": 3,
        "name": "DS 3",
        "description": "Dataset 3",
        "datasource": 2,
        "created_at": "2023-09-05 12:05:14",
        "annotasks": [{
            "isAnnotask": true,
            "id": 4,
            "name": "Annotask6553",
            "description": "Test Annotask",
            "created_at": "2023-06-05 15:05:57"
        }, {
            "isAnnotask": true,
            "id": 7,
            "name": "My next Annotask",
            "created_at": "2023-09-05 04:07:33"
        }]
    }
]

const Datasets = () => {

    const openAddDatasetMenu = () => {
        console.log("Clicked on openAddDatasetMenu")
    }

    const openAssignAnnotaskMenu = () => {
        console.log("Clicked on assign annotask")
    }

    return (
        <CContainer>
            <CRow>
                <CCol sm="auto">
                    <IconButton
                        isOutline={false}
                        color="primary"
                        icon={faFolderPlus}
                        text="Add Dataset"
                        onClick={openAddDatasetMenu}
                        style={{ marginTop: '15px' }}
                    />
                </CCol>
                <CCol sm="auto">
                    <IconButton
                        isOutline={false}
                        color="primary"
                        icon={faTag}
                        text="Assign Annotasks"
                        onClick={openAssignAnnotaskMenu}
                        style={{ marginTop: '15px' }}
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <DatasetTable datasets={datasetList} datasources={datasources} />
                </CCol>
            </CRow>
        </CContainer>
    )
}

export default Datasets
