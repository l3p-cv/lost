import { CCol, CRow } from "@coreui/react";
import { useParams } from "react-router-dom";
import SIAReview from "./SIAReview";

const DatasetsReviewComponent = () => {

    const { datasetId } = useParams()

    return (
        <CRow>
            <CCol>
                <h1>Review of dataset {datasetId}</h1>
                <CRow>
                    <CCol xs='12' sm='12' lg='12'>
                        <SIAReview datasetId={datasetId} />
                    </CCol>
                </CRow>
            </CCol>
        </CRow>

    )
}

export default DatasetsReviewComponent