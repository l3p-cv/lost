import React, { useEffect } from 'react'
import AnnotationTop from './AnnoTask/AnnotationTop'
import { useState } from 'react'

import { CCol, CRow } from '@coreui/react'
import CenteredSpinner from '../../components/CenteredSpinner'
import * as annotaskApi from '../../actions/annoTask/anno_task_api'
import { useGetMiaAnnos, useGetMiaLabel } from '../../api/mia'
// import { MiaImageRequest } from '../../types/MiaTypes'
import Control from './MIA/Control'
import Cluster from './MIA/Cluster'
import { useQueryClient } from 'react-query'

const MultiImageAnnotation = () => {
  const [selectedLabel, setSelectedLabel] = useState(null)
  const [maxAmount, setMaxAmount] = useState(10)
  const queryClient = useQueryClient()

  const { data: currentAnnotask, isLoading: taskIsLoading } =
    annotaskApi.useGetCurrentAnnotask()
  const { data: annoData, isLoading: annoIsLoading } = useGetMiaAnnos(maxAmount)
  const { data: labels, isLoading: lblIsLoading } = useGetMiaLabel()

  const selectedLabelState = {
    value: selectedLabel,
    set: setSelectedLabel,
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

  useEffect(() => {
    if (!annoData?.images) return

    setImagesActive(
      annoData.images.reduce((acc, img) => {
        acc[img.id] = true
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

  // reload annotation task data after switching images
  if (taskIsLoading || annoIsLoading || lblIsLoading) return <CenteredSpinner />

  console.log('AnnoData: ', annoData)

  // TODO: refetch images???

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
          />
          <Cluster
            images={annoData.images}
            zoom={zoom}
            workingOnAnnoTask={currentAnnotask}
            imageActiveStates={imageActiveStates}
          />
        </div>
      </CCol>
    </CRow>
  )
}

export default MultiImageAnnotation
