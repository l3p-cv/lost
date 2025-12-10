import { CCol, CRow } from '@coreui/react'
import { useParams } from 'react-router-dom'
import SiaWrapper from '../Annotation/SIA/SiaWrapper'
import { CSSProperties, useEffect, useState } from 'react'
import siaApi, { ReviewData, useReview } from '../../actions/dataset/dataset_review_api'
import { ImageSwitchData } from '../../actions/sia/sia_api'
import { useAnnotask } from '../../actions/annoTask/anno_task_api'
import AnnotationTop from '../Annotation/AnnoTask/AnnotationTop'

const DatasetsReviewComponent = () => {
  const { datasetId } = useParams()
  const [currentAnnotaskId, setCurrentAnnotaskId] = useState<number>(-1)
  const { data: currentAnnotask } = useAnnotask(currentAnnotaskId)
  console.log('Annotask: ', currentAnnotask)

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

  /**
   * do not use a CContainer here
   * CContainers remove the ability to get the available height of the page using flexbox
   * Instead, get the current flexbox, let the current child grow to its maximum available with and height
   * and set the display to flexbox, so that the next child can also benefit from it
   */
  const forwardFlex: CSSProperties = {
    // use the max available height as a flex child
    flex: '1 1 auto',
    minHeight: 0,

    // give the max available height to the next child
    display: 'flex',
    flexDirection: 'column',
  }

  return (
    <div style={forwardFlex}>
      <AnnotationTop
        annoTask={!!currentAnnotask ? currentAnnotask : null}
        annoData={annoData}
        datasetId={nDatasetId}
        isReview={true}
      />
      <div style={forwardFlex}>
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
  )
}

export default DatasetsReviewComponent
