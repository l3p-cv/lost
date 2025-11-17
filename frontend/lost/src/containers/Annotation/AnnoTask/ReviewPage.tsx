import { CCol, CRow } from '@coreui/react'
import { useParams } from 'react-router-dom'
import SiaWrapper from '../SIA/SiaWrapper'

import { CSSProperties, useState } from 'react'
import siaApi, {
  ReviewData,
  useReview,
} from '../../../actions/dataset/dataset_review_api'
import { ImageSwitchData } from '../../../actions/sia/sia_api'

const AnnotaskReviewComponent = () => {
  const { annotaskId } = useParams()

  // image nr in annotask
  const [annotationRequestData, setAnnotationRequestData] = useState<ReviewData>({
    isAnnotaskReview: true,
    taskId: parseInt(`${annotaskId}`),
    data: {
      direction: 'first',
      imageAnnoId: null,
      iteration: null,
    },
  })

  const { data: annoData } = useReview(annotationRequestData)

  if (annotaskId === undefined || isNaN(parseInt(annotaskId)))
    return <h2>Incorrect Annotask Id</h2>

  const nAnnotaskId: number = parseInt(annotaskId)

  // method to get the available height of the page without scrolling
  const contentRootStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 375px)',
    overflow: 'hidden',
    marginTop: 10,
  }

  const middleStyle: CSSProperties = {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
    minHeight: 0,
  }

  return (
    <CRow>
      <CCol>
        <h1>Review of annotation task {annotaskId}</h1>
        <CRow>
          <CCol xs="12" sm="12" lg="12">
            <div style={contentRootStyle}>
              <div style={middleStyle}>
                <SiaWrapper
                  annoData={annoData}
                  annoTaskId={nAnnotaskId}
                  isDatasetMode={false}
                  isImageSearchEnabled={true}
                  siaApi={siaApi}
                  onSetAnnotationRequestData={(imageSwitchData: ImageSwitchData) => {
                    const newReviewData: ReviewData = {
                      isAnnotaskReview: true,
                      taskId: parseInt(`${annotaskId}`),
                      data: {
                        direction: imageSwitchData.direction,
                        imageAnnoId: imageSwitchData.imageId,
                        iteration: imageSwitchData.iteration,
                      },
                    }

                    setAnnotationRequestData(newReviewData)
                  }}
                />
              </div>
            </div>
          </CCol>
        </CRow>
      </CCol>
    </CRow>
  )
}

export default AnnotaskReviewComponent
