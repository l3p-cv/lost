import { CSSProperties, useState } from 'react'

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
  const { data: currentAnnotask } = annotaskApi.useGetCurrentAnnotask()

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

  if (currentAnnotask === undefined) return 'Loading...'

  return (
    <>
      <WorkingOnSIA annoTask={currentAnnotask} />

      <div style={contentRootStyle}>
        <div style={middleStyle}>
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
    </>
  )
}

export default SingleImageAnnotation
