import { CSSProperties, useEffect, useState } from 'react'

import WorkingOnSIA from './AnnoTask/WorkingOnSIA'
import SiaWrapper from './SIA/SiaWrapper'
import * as annotaskApi from '../../actions/annoTask/anno_task_api'
import siaApi, {
  SiaAnnotationChangeRequest,
  useGetSiaAnnos,
} from '../../actions/sia/sia_api'

const SingleImageAnnotation = () => {
  // image nr in annotask
  const [annotationRequestData, setAnnotationRequestData] =
    useState<SiaAnnotationChangeRequest>({
      direction: 'next',
      imageId: -1,
    })

  const { data: annoData } = useGetSiaAnnos(annotationRequestData)
  const { data: currentAnnotask, refetch: refetchCurrentAnnotask } =
    annotaskApi.useGetCurrentAnnotask()

  // reload annotation task data after switching image
  useEffect(() => {
    refetchCurrentAnnotask()
  }, [annoData])

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

  if (currentAnnotask === undefined) return 'Loading...'

  return (
    <div style={forwardFlex}>
      <WorkingOnSIA annoTask={currentAnnotask} />
      <div style={forwardFlex}>
        <SiaWrapper
          taskId={currentAnnotask.id}
          isDatasetMode={false}
          isImageSearchEnabled={false}
          annoData={annoData}
          onSetAnnotationRequestData={setAnnotationRequestData}
          siaApi={siaApi}
        />
      </div>
    </div>
  )
}

export default SingleImageAnnotation
