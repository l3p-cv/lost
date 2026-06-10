import { useParams } from 'react-router-dom'
import SiaWrapper from '../Annotation/SIA/SiaWrapper'
import { CSSProperties, useEffect, useState } from 'react'
import siaApi, { ReviewData, useReview, useGetReviewImageList } from '../../api/dataset/dataset_review'
import { ImageSwitchData } from '../../api/sia'
import { useAnnotask } from '../../api/anno_task'
import AnnotationTop from '../Annotation/AnnoTask/AnnotationTop'
import SiaPreviewSidebar from '../Annotation/SIA/SiaPreviewSidebar'
import CoreIconButton from '../../components/CoreIconButton'
import { faFilm } from '@fortawesome/free-solid-svg-icons'

const DatasetsReviewComponent = () => {
  const { datasetId } = useParams()
  const [currentAnnotaskId, setCurrentAnnotaskId] = useState<number>(-1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
  const { data: imageList } = useGetReviewImageList(currentAnnotaskId > 0 ? currentAnnotaskId : undefined)

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

  const rowFlex: CSSProperties = {
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
  }

  const handleImageSwitch = (imageSwitchData: ImageSwitchData) => {
    setAnnotationRequestData({
      isAnnotaskReview: false,
      taskId: parseInt(`${datasetId}`),
      data: {
        direction: imageSwitchData.direction,
        imageAnnoId: imageSwitchData.imageId,
        iteration: imageSwitchData.iteration,
      },
    })
  }

  return (
    <div style={forwardFlex}>
      <AnnotationTop
        annoTask={!!currentAnnotask ? currentAnnotask : null}
        annoData={annoData}
        datasetId={nDatasetId}
        isReview={true}
      />
      <div style={{ ...rowFlex, position: 'relative' }}>
        {/* SiaWrapper always takes full row width — canvas size never changes */}
        <div style={forwardFlex}>
          <SiaWrapper
            annoData={annoData}
            datasetId={nDatasetId}
            annoTaskId={currentAnnotaskId}
            isDatasetMode={true}
            isImageSearchEnabled={true}
            siaApi={siaApi}
            isReview={true}
            onSetAnnotationRequestData={handleImageSwitch}
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
          <div style={{ paddingTop: 6, paddingLeft: 4, flexShrink: 0 }}>
            <CoreIconButton
              icon={faFilm}
              toolTip={isSidebarOpen ? 'Close image strip' : 'Open image strip'}
              onClick={() => setIsSidebarOpen((o) => !o)}
              isActive={isSidebarOpen}
            />
          </div>
          {isSidebarOpen && (
            <SiaPreviewSidebar
              imageList={imageList ?? []}
              currentImageId={annoData?.image?.id ?? -1}
              onSelect={(id) =>
                handleImageSwitch({ direction: 'specificImage', imageId: id })
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default DatasetsReviewComponent
