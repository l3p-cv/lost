import { useParams } from 'react-router-dom'
import SiaWrapper from '../SIA/SiaWrapper'

import { CSSProperties, useState } from 'react'
import siaApi, {
  ReviewData,
  useReview,
} from '../../../actions/dataset/dataset_review_api'
import { useAnnotask } from '../../../actions/annoTask/anno_task_api'
import { ImageSwitchData } from '../../../actions/sia/sia_api'
import AnnotationTop from './AnnotationTop'

const AnnotaskReviewComponent = () => {
  const { annotaskId } = useParams()
  const { data: currentAnnotask } = useAnnotask(annotaskId)

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
      <AnnotationTop annoTask={currentAnnotask} annoData={annoData} isReview={true} />
      <div style={forwardFlex}>
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
  )
}

export default AnnotaskReviewComponent
