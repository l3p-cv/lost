import { CSSProperties, useEffect, useState } from 'react'

import SiaWrapper from './SIA/SiaWrapper'
import * as annotaskApi from '../../api/anno_task'
import siaApi, {
  SiaAnnotationChangeRequest,
  useGetSiaAnnos, // no image switcher???
  useGetSiaImageList,
} from '../../api/sia'
import AnnotationTop from './AnnoTask/AnnotationTop'
import SiaPreviewSidebar from './SIA/SiaPreviewSidebar'
import CoreIconButton from '../../components/CoreIconButton'
import { faFilm } from '@fortawesome/free-solid-svg-icons'

const SingleImageAnnotation = () => {
  // image nr in annotask
  const [annotationRequestData, setAnnotationRequestData] =
    useState<SiaAnnotationChangeRequest>({
      direction: 'next',
      imageId: -1,
    })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { data: annoData, refetch: refetchAnnoData } = useGetSiaAnnos(annotationRequestData)
  const noImagesLeft = annoData !== undefined && !annoData?.image?.id
  const currentImgId = annoData?.image?.id
  const { data: imageList } = useGetSiaImageList(true, currentImgId)
  const { data: currentAnnotask, refetch: refetchCurrentAnnotask } =
    annotaskApi.useGetCurrentAnnotask()

  // reload annotation task data after switching image
  useEffect(() => {
    refetchCurrentAnnotask()
  }, [annoData])

  // poll every 5s when no images are available so the UI updates when admin releases images
  useEffect(() => {
    if (!noImagesLeft) return
    const interval = setInterval(() => {
      refetchAnnoData()
      refetchCurrentAnnotask()
    }, 5000)
    return () => clearInterval(interval)
  }, [noImagesLeft])

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

  const rowFlex: CSSProperties = {
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
  }

  if (currentAnnotask === undefined) return 'Loading...'

  return (
    <div style={forwardFlex}>
      <AnnotationTop annoTask={currentAnnotask} annoData={annoData} />
      <div style={{ ...rowFlex, position: 'relative' }}>
        {/* SiaWrapper always takes full row width — canvas size never changes */}
        <div style={{ ...forwardFlex, paddingLeft: 120 }}>
          <SiaWrapper
            annoTaskId={currentAnnotask.id}
            isDatasetMode={false}
            isImageSearchEnabled={false}
            isReview={false}
            annoData={annoData}
            onSetAnnotationRequestData={setAnnotationRequestData}
            siaApi={siaApi}
            lockedImgCount={currentAnnotask.locked_img_count ?? 0}
          />
        </div>
        {/* Sidebar column — absolutely positioned, never affects layout or canvas size */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          background: isSidebarOpen ? 'rgba(var(--cui-primary-rgb, 13,110,253), 0.15)' : 'transparent',
        }}>
          {!(annoData !== undefined && !annoData?.image?.id) && (
            <div style={{ width: 120, flexShrink: 0, paddingTop: 8, paddingBottom: 8 }}>
              <CoreIconButton
                icon={faFilm}
                toolTip={isSidebarOpen ? 'Close image strip' : 'Open image strip'}
                onClick={() => setIsSidebarOpen((o) => !o)}
                isActive={isSidebarOpen}
                className="w-100"
                text={isSidebarOpen ? 'Hide' : 'Images'}
              />
            </div>
          )}
          {isSidebarOpen && (
            <SiaPreviewSidebar
              imageList={imageList ?? []}
              currentImageId={annoData?.image?.id ?? -1}
              onSelect={(id) => {
                setAnnotationRequestData({ direction: 'specificImage', imageId: id })
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default SingleImageAnnotation
