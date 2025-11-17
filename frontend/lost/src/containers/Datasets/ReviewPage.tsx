import { CCol, CRow } from '@coreui/react'
import { useParams } from 'react-router-dom'
import SiaWrapper from '../Annotation/SIA/SiaWrapper'
import { CSSProperties, useEffect, useState } from 'react'
import siaApi, { ReviewData, useReview } from '../../actions/dataset/dataset_review_api'
import { ImageSwitchData } from '../../actions/sia/sia_api'

const DatasetsReviewComponent = () => {
  const { datasetId } = useParams()
  const [currentAnnotaskId, setCurrentAnnotaskId] = useState<number>(-1)

  // image nr in annotask
  const [annotationRequestData, setAnnotationRequestData] = useState<ReviewData>({
    isAnnotaskReview: false,
    taskId: parseInt(`${datasetId}`),
    data: {
      direction: 'first',
      imageAnnoId: null,
      iteration: null,
    },
  })

  const { data: annoData } = useReview(annotationRequestData)

  useEffect(() => {
    if (annoData === undefined) return
    setCurrentAnnotaskId(annoData.current_annotask_idx)
  }, [annoData])

  if (datasetId === undefined || isNaN(parseInt(datasetId)))
    return <h2>Incorrect Dataset Id</h2>

  const nDatasetId: number = parseInt(datasetId)

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
        <h1>Review of dataset {datasetId}</h1>
        <CRow>
          <CCol xs="12" sm="12" lg="12">
            <div style={contentRootStyle}>
              <div style={middleStyle}>
                <SiaWrapper
                  annoData={annoData}
                  datasetId={nDatasetId}
                  annoTaskId={currentAnnotaskId}
                  isDatasetMode={true}
                  isImageSearchEnabled={true}
                  siaApi={siaApi}
                  onSetAnnotationRequestData={(imageSwitchData: ImageSwitchData) => {
                    const newReviewData: ReviewData = {
                      isAnnotaskReview: false,
                      taskId: parseInt(`${datasetId}`),
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

export default DatasetsReviewComponent
