import { CCol, CRow } from "@coreui/react";
import { useParams } from "react-router-dom";
import SIAReview from "../../Datasets/SIAReview";

const AnnotaskReviewComponent = () => {

    const { annotaskId } = useParams()

    return (
        <CRow>
            <CCol>
                <h1>Review of annotation task {annotaskId}</h1>
                <CRow>
                    <CCol xs='12' sm='12' lg='12'>
                        <SIAReview annotaskId={annotaskId} />
                    </CCol>
                </CRow>
            </CCol>
        </CRow>

    )
}

export default AnnotaskReviewComponent