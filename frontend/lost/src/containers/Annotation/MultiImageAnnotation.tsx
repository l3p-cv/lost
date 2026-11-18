import React, { useEffect } from 'react'
import AnnotationTop from './AnnoTask/AnnotationTop'
import { useState } from 'react'

import { CCol, CRow } from '@coreui/react'
import CenteredSpinner from '../../components/CenteredSpinner'
import * as annotaskApi from '../../api/anno_task'
import { useGetMiaAnnos, useGetMiaLabel, useJunkMiaImages } from '../../api/mia'
// import { MiaImageRequest } from '../../types/MiaTypes'
import Control from './MIA/Control'
import Cluster from './MIA/Cluster'
import { MiaJunkPayload } from '../../types/MiaTypes'

const MultiImageAnnotation = () => {
  const [selectedLabel, setSelectedLabel] = useState(null)
  const [maxAmount, setMaxAmount] = useState(10)
  const [permaReverse, setPermaReverse] = useState(false)

  const { data: currentAnnotask, isLoading: taskIsLoading } =
    annotaskApi.useGetCurrentAnnotask()
  const { data: annoData, isLoading: annoIsLoading } = useGetMiaAnnos(maxAmount)
  const { data: labels, isLoading: lblIsLoading } = useGetMiaLabel()

  const selectedLabelState = {
    value: selectedLabel,
    set: setSelectedLabel,
  }

  const permaReverseState = {
    value: permaReverse,
    set: setPermaReverse,
  }

  const amountState = {
    value: maxAmount,
    set: setMaxAmount,
  }

  const [zoom, setZoom] = useState(200)
  const zoomState = {
    value: zoom,
    set: setZoom,
  }

  const [imagesActive, setImagesActive] = React.useState({})
  const [imagesJunk, setImagesJunk] = React.useState<Record<number, boolean>>({})

  useEffect(() => {
    if (!annoData?.images) return

    setImagesActive(
      annoData.images.reduce((acc, img) => {
        acc[img.id] = !permaReverse
        return acc
      }, {}),
    )
    setImagesJunk(
      annoData.images.reduce((acc: Record<number, boolean>, img) => {
        acc[img.id] = !!img.isJunk
        return acc
      }, {}),
    )
  }, [annoData])

  const setImageActive = (id, value) => {
    setImagesActive((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const imageActiveStates = {
    value: imagesActive,
    set: setImageActive,
  }

  const setImageJunk = (id: number, junk: boolean) => {
    setImagesJunk((prev) => ({ ...prev, [id]: junk }))
  }

  const { mutate: junkMiaImages } = useJunkMiaImages()

  const handleJunkImages = (payload: MiaJunkPayload) => {
    const previous = { ...imagesJunk }
    payload.images.forEach((img) => setImageJunk(img.id, img.isJunk)) // optimistic
    junkMiaImages(payload, {
      onError: () => setImagesJunk(previous), // toast comes from the hook
    })
  }

  const imageJunkStates = {
    value: imagesJunk,
    set: setImageJunk,
  }

  const isImageBased = annoData?.images?.[0]?.type === 'imageBased'

  // reload annotation task data after switching images
  if (taskIsLoading || annoIsLoading || lblIsLoading) return <CenteredSpinner />

  return (
    <CRow>
      <CCol xs="12">
        <div style={{ marginBottom: '8px' }}>
          <AnnotationTop annoTask={currentAnnotask} isSIA={false} />
        </div>
        <div>
          <Control
            zoomState={zoomState}
            maxAmountState={amountState}
            selectedLabelState={selectedLabelState}
            labels={labels.labels}
            miaAnnos={annoData}
            imageActiveStates={imageActiveStates}
            annotaskFinishedLbls={currentAnnotask.finished}
            permaReverseState={permaReverseState}
            imageJunkStates={imageJunkStates}
            onJunkImages={handleJunkImages}
            isImageBased={isImageBased}
          />
          <Cluster
            images={annoData.images}
            imagesLoading={annoIsLoading}
            zoom={zoom}
            workingOnAnnoTask={currentAnnotask}
            imageActiveStates={imageActiveStates}
            imageJunkStates={imageJunkStates}
            onJunkImages={handleJunkImages}
            isImageBased={isImageBased}
          />
        </div>
      </CCol>
    </CRow>
  )
}

export default MultiImageAnnotation
