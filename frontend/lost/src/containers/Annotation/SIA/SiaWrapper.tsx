import { useCallback, useEffect, useState } from 'react'
import type {
  SiaApi,
  EditAnnotationData,
  ImageLabelData,
  ImageSwitchData,
  SiaResponse,
} from '../../../actions/sia/sia_api'
import {
  useGetSiaImage,
  useFinishAnnotask,
  useImageJunk,
} from '../../../actions/sia/sia_api'
import polygonOperationApi from '../../../actions/sia/polygonOperationApi'

import type {
  ExternalAnnotation,
  Point,
  PolygonOperationResult,
  SIANotification,
  ToolCoordinates,
} from 'lost-sia'

import { Sia } from 'lost-sia'
import { useNavigate } from 'react-router-dom'
import { CButton, CButtonGroup, CCol, CTooltip } from '@coreui/react'
// import {
//     INFERENCE_MODEL_TYPE,
//     useTritonInference,
// } from '../../../actions/inference-model/model-api'
import {
  showDecision,
  showError,
  showInfo,
  showSuccess,
  showWarning,
} from '../../../components/Notification'
import NavigationButtons from './NavigationButtons'

import {
  Annotation,
  AnnotationStatus,
  AnnotationTool,
  NotificationType,
} from 'lost-sia/models'

import legacyHelper, {
  LegacyAnnotation,
  LegacyAnnotationResponse,
  LegacyBboxData,
} from './legacyHelper'
import ImageFilterButton from './ImageFilterButton'
import { ImageFilter, SiaImageRequest } from '../../../types/SiaTypes'
import PolygonEditButtons from './PolygonEditButtons'
import PolygonEditMode from '../../../models/PolygonEditMode'
import SIAImageSearchModal, {
  ImageSearchResult,
} from '../../Datasets/SIAImageSearchModal'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { TimeUtils } from 'lost-sia/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import imageSearch, { FirstLastResult } from './imageSearch'

type SiaWrapperProps = {
  annoData: SiaResponse | undefined
  datasetId?: number
  annoTaskId: number
  isDatasetMode?: boolean
  isImageSearchEnabled?: boolean
  siaApi: SiaApi
  onSetAnnotationRequestData: (changeRequest: ImageSwitchData) => void
}

// type SamBBox = {
//     x: number
//     y: number
//     width: number
//     height: number
//     xMinNorm?: number
//     yMinNorm?: number
//     xMaxNorm?: number
//     yMaxNorm?: number
// }

// type SamPoint = {
//     x: number
//     y: number
//     type: any
//     normX: number
//     normY: number
// }

const SiaWrapper = ({
  annoData,
  datasetId,
  annoTaskId,
  isDatasetMode = false,
  isImageSearchEnabled = false,
  siaApi,
  onSetAnnotationRequestData,
}: SiaWrapperProps) => {
  const navigate = useNavigate()

  // const [samPoints, setSamPoints] = useState<SamPoint[]>([])
  // const [samBBox, setSamBBox] = useState<SamBBox | undefined>()

  const [isSiaLoading, setIsSiaLoading] = useState<boolean>(true)
  const [polygonEditMode, setPolygonEditMode] = useState<PolygonEditMode>(
    PolygonEditMode.NONE,
  )

  // image search state
  const [isImageSearchActive, setIsImageSearchActive] = useState(false)
  const [isImgSearchModalVisible, setIsImgSearchModalVisible] = useState(false)
  const [filteredImageIds, setFilteredImageIds] = useState<ImageSearchResult[]>([])

  const [polygonOperationResult, setPolygonOperationResult] = useState<
    PolygonOperationResult | undefined
  >()

  const [defaultLabelId, setDefaultLabelId] = useState<number>()

  // measure time spent on image
  const [imageLoadedTimestamp, setImageLoadedTimestamp] = useState<number>(
    performance.now(),
  )

  // save the selected annotation for polygon edit events
  // THIS IS A SHADOW COPY THAT IS NOT USED FROM INSIDE SIA
  const [currentlySelectedAnnotation, setCurrentlySelectedAnnotation] = useState<
    Annotation | undefined
  >()

  // const { mutate: inferAnnotations, isLoading: isInferenceLoading } =
  //     useTritonInference()

  // only the initial annotations (the ones we got from the server) are stored in this component
  // the modified annotations are stored inside SIA and handed to us using events
  const [initialAnnotations, setInitialAnnotations] = useState<
    ExternalAnnotation[] | undefined
  >()

  // Annotations that are just created in SIA have never been stored in the backend and therefore don't have an externalId yet.
  // To identify them later on, we store a mapping between the external and SIAs internal id for freshly created annos
  const [annotationIdMapping, setAnnotationIdMapping] = useState({})

  // image id in filesystem
  const [appliedImageFilters, setAppliedImageFilters] = useState<ImageFilter[]>([])
  const [imageId, setImageId] = useState<number>(-1)
  const imageRequestData: SiaImageRequest = {
    imageId,
    appliedFilters: appliedImageFilters,
  }
  const { data: possibleLabels } = siaApi.useGetPossibleLabels(annoTaskId)

  // request will automatically refetch when its state (parameter) changes
  const { data: imageBlobRequest } = useGetSiaImage(imageRequestData)
  const [imageBlob, setImageBlob] = useState<string | undefined>()

  const [isImageSearchButtonTooltipOpen, setIsImageSearchButtonTooltipOpen] =
    useState<boolean>()

  // move this to an external state to be able to unload the image
  // changing the image does also reinitialize SIA
  // do this only when possible labels are fetched
  useEffect(() => {
    if (possibleLabels === undefined || imageBlobRequest === undefined) return

    if (typeof imageBlobRequest !== 'string' && imageBlobRequest.error !== undefined) {
      return handleNotification({
        title: 'Image filter error',
        message: imageBlobRequest.error,
        type: NotificationType.ERROR,
      })
    }

    setImageBlob(imageBlobRequest)
    setIsSiaLoading(false)
  }, [imageBlobRequest, possibleLabels])

  // @TODO check if request worked
  const { data: createAnnotationResponse, mutate: sendCreateAnnotation } =
    siaApi.useCreateAnnotation()
  const { data: editAnnotationResponse, mutate: sendEditAnnotation } =
    siaApi.useEditAnnotation()
  const { data: deleteAnnotationResponse, mutate: sendDeleteAnnotation } =
    siaApi.useDeleteAnnotation()
  const { data: updateImageLabelResponse, mutate: sendUpdateImageLabel } =
    siaApi.useUpdateImageLabel()
  const { data: imageJunkResponse, mutate: sendJunkImage } = useImageJunk()

  const { data: finishAnnotaskResponse, mutate: sindFinishAnnotask } = useFinishAnnotask()

  const { data: polygonDiffReponse, mutate: diffPolygons } =
    polygonOperationApi.usePolygonDifference()
  const { data: polygonIntersectionReponse, mutate: intersectPolygons } =
    polygonOperationApi.usePolygonIntersection()
  const { data: polygonUnionReponse, mutate: mergePolygons } =
    polygonOperationApi.usePolygonUnion()
  const { data: bboxCreationResponse, mutate: createBBox } =
    polygonOperationApi.useBBoxCreation()

  useEffect(() => {
    // react query throws a state update with undefined right before the actual data is set when the query cache is disabled
    if (annoData?.image === undefined || annoData?.annotations === undefined) return

    // @TODO use the old api style (annos separated by type) for now, but convert it here to the new style
    const annotationsByType: LegacyAnnotationResponse = annoData.annotations
    const collectedAnnoData = Object.entries(annotationsByType).flatMap(
      ([type, items]: [string, LegacyAnnotation[]]) =>
        items.map((annotation) => legacyHelper.convertAnnoToNewFormat(annotation, type)),
    )

    setInitialAnnotations(collectedAnnoData)

    // request the image from the backend
    const imageId = annoData.image.id

    // update the image id
    // the request will automatically refetch
    setImageId(imageId)
  }, [annoData])

  useEffect(() => {
    if (createAnnotationResponse === undefined || createAnnotationResponse === null)
      return

    // remove the 'new-' prefix
    const siaInternalAnnoId = parseInt(
      createAnnotationResponse.tempId.replace('new-', ''),
    )

    // we got an external id assigned from the server
    // update the mapping to include the new annotation
    const newAnnotationIdMapping = { ...annotationIdMapping }
    newAnnotationIdMapping[siaInternalAnnoId] = createAnnotationResponse.dbId

    setAnnotationIdMapping(newAnnotationIdMapping)
  }, [createAnnotationResponse])

  const handleResponse = useCallback((response: object | string): boolean => {
    if (response !== 'error') return true

    handleNotification({
      title: 'Anno save failed',
      message: 'Error while saving annotation.',
      type: NotificationType.ERROR,
    })

    return false
  }, [])

  useEffect(() => {
    if (editAnnotationResponse === undefined || editAnnotationResponse === null) return

    handleResponse(editAnnotationResponse)
  }, [editAnnotationResponse, handleResponse])

  useEffect(() => {
    if (createAnnotationResponse === undefined || createAnnotationResponse === null)
      return

    handleResponse(createAnnotationResponse)
  }, [createAnnotationResponse, handleResponse])

  useEffect(() => {
    if (deleteAnnotationResponse === undefined || deleteAnnotationResponse === null)
      return

    handleResponse(deleteAnnotationResponse)
  }, [deleteAnnotationResponse, handleResponse])

  useEffect(() => {
    if (imageJunkResponse === undefined) return

    handleResponse(imageJunkResponse)
  }, [imageJunkResponse, handleResponse])

  useEffect(() => {
    // a sucessful request just returns null
    if (updateImageLabelResponse === undefined || updateImageLabelResponse === null)
      return

    handleNotification({
      title: 'Error updating image label',
      message: 'Error updating image label',
      type: NotificationType.ERROR,
    })
  }, [updateImageLabelResponse])

  useEffect(() => {
    if (finishAnnotaskResponse === undefined) return

    if (handleResponse(finishAnnotaskResponse)) navigate('/annotation')
  }, [finishAnnotaskResponse, handleResponse, navigate])

  useEffect(() => {
    // don't enable the image search button tooltip directly - other items like the label button moves it aftewards and the tooltip gets displaced...

    if (isImageSearchActive && imageBlob) setIsImageSearchButtonTooltipOpen(true)
  }, [isImageSearchActive, imageBlob])

  const calculatePolygonOperation = (
    firstAnnotation: Annotation,
    secondAnnotation: Annotation,
  ) => {
    const possibleAnnotationTypes = [AnnotationTool.Polygon, AnnotationTool.BBox]

    // check if both annotations are polygons
    if (
      !possibleAnnotationTypes.includes(firstAnnotation.type) ||
      !possibleAnnotationTypes.includes(secondAnnotation.type)
    ) {
      // there's an imposter - abort mission
      setPolygonEditMode(PolygonEditMode.NONE)

      handleNotification({
        title: 'Invalid selection',
        message: 'Merge can only be done with annotations containing an area',
        type: NotificationType.ERROR,
      })

      return
    }

    // stop if user clicks onto the same annotation twice
    if (firstAnnotation.internalId === secondAnnotation.internalId) {
      setPolygonEditMode(PolygonEditMode.NONE)
      handleNotification({
        title: 'Invalid selection',
        message: 'Cannot merge polygon with itself',
        type: NotificationType.ERROR,
      })
      return
    }

    // convert annotations into the legacy format to be supported by the backend
    const firstLegacyAnnotation: LegacyAnnotation =
      legacyHelper.convertAnnoToOldFormat(firstAnnotation)
    const secondLegacyAnnotation: LegacyAnnotation =
      legacyHelper.convertAnnoToOldFormat(secondAnnotation)

    setIsSiaLoading(true)
    switch (polygonEditMode) {
      case PolygonEditMode.MERGE:
        mergePolygons({
          firstPolygon: firstLegacyAnnotation,
          secondPolygon: secondLegacyAnnotation,
        })
        break
      case PolygonEditMode.INTERSECT:
        intersectPolygons({
          firstPolygon: firstLegacyAnnotation,
          secondPolygon: secondLegacyAnnotation,
        })
        break
      case PolygonEditMode.DIFFERENCE:
        diffPolygons({
          firstPolygon: firstLegacyAnnotation,
          secondPolygon: secondLegacyAnnotation,
        })
        break
    }
  }

  const createAnnotation = (annotation: Annotation) => {
    // reset polygon edit mode
    setPolygonEditMode(PolygonEditMode.NONE)
    setCurrentlySelectedAnnotation(annotation)

    const newAnnotation: Annotation = {
      ...annotation,
      status: AnnotationStatus.CREATING, // mark as new so the anno is created at the server
    }
    const annotationInOldFormat: LegacyAnnotation =
      legacyHelper.convertAnnoToOldFormat(newAnnotation)

    // satisfy linter
    if (annoData === undefined) return

    // get the time spent on the image (rounded by 2 decimals)
    const imageEditTime: number = TimeUtils.getRoundedDuration(
      imageLoadedTimestamp,
      performance.now(),
    )

    const currentImageData = annoData.image

    // add the time it took the user to edit the anno to the image time
    const newAnnoTime: number = currentImageData.annoTime + imageEditTime

    const imageData = {
      imgId: currentImageData.id,
      imgActions: currentImageData.imgActions,
      annoTime: newAnnoTime,
    }

    const createAnnotationData: EditAnnotationData = {
      annoTaskId,
      annotation: {
        ...annotationInOldFormat,
        // special case for created annos: the server saves the anno and returns this id back as 'tempId'
        // use SIAs internalId for identifying the annotation when the response arrived
        id: `new-${newAnnotation.internalId}`,
      },
      imageEditData: imageData,
    }

    sendCreateAnnotation(createAnnotationData)
  }

  const deleteAnnotation = (annotation: Annotation) => {
    // satisfy linter
    if (annoData === undefined) return

    // get the time spent on the image (rounded by 2 decimals)
    const imageEditTime: number = TimeUtils.getRoundedDuration(
      imageLoadedTimestamp,
      performance.now(),
    )

    const currentImageData = annoData.image

    // add the time it took the user to edit the anno to the image time
    const newAnnoTime: number = currentImageData.annoTime + imageEditTime

    const imageData = {
      imgId: currentImageData.id,
      imgActions: currentImageData.imgActions,
      annoTime: newAnnoTime,
    }

    const deletedAnnotation = {
      ...annotation,
      status: AnnotationStatus.DELETED,
    }

    // search the mapping if annotation has no external id
    // annotations that are deleted right after they were created
    if (deletedAnnotation.externalId == '') {
      const externalAnnoId = annotationIdMapping[deletedAnnotation.internalId]
      if (externalAnnoId) deletedAnnotation.externalId = externalAnnoId
    }

    const annotationInOldFormat = legacyHelper.convertAnnoToOldFormat(deletedAnnotation)
    const deleteAnnotationData: EditAnnotationData = {
      annoTaskId,
      annotation: annotationInOldFormat,
      imageEditData: imageData,
    }
    sendDeleteAnnotation(deleteAnnotationData)
    setCurrentlySelectedAnnotation(undefined)
  }

  const editAnnotation = (annotation: Annotation) => {
    // do nothing when still creating annotation
    // @TODO adapt backend to support partly-finished annotations
    if (annotation.status === AnnotationStatus.CREATING) return

    // the polygon result throws the created and changed event at the same time
    // we only need the created event since it already contains all coordinates
    if (polygonEditMode !== PolygonEditMode.NONE) return

    setCurrentlySelectedAnnotation(annotation)

    // remember annotation label (set it as the default label when switching the image)
    if (annotation.labelIds !== undefined && annotation.labelIds.length > 0)
      setDefaultLabelId(annotation.labelIds[0])

    const newAnnotation = { ...annotation }

    if (annotation.status === AnnotationStatus.CREATED) {
      // mark annoation only as changed if it made contact with the server once
      // (keeps new annotations new)
      newAnnotation.status = AnnotationStatus.CHANGED

      // search for an external anno id in the mapping
      const externalAnnoId = annotationIdMapping[newAnnotation.internalId]
      if (externalAnnoId) newAnnotation.externalId = externalAnnoId
    }

    const annotationInOldFormat = legacyHelper.convertAnnoToOldFormat(newAnnotation)

    // satisfy linter
    if (annoData === undefined) return

    // get the time spent on the image (rounded by 2 decimals)
    const imageEditTime: number = TimeUtils.getRoundedDuration(
      imageLoadedTimestamp,
      performance.now(),
    )

    const currentImageData = annoData.image

    // add the time it took the user to edit the anno to the image time
    const newAnnoTime: number = currentImageData.annoTime + imageEditTime

    const imageData = {
      imgId: currentImageData.id,
      imgActions: currentImageData.imgActions,
      annoTime: newAnnoTime,
    }

    const editAnnotationData: EditAnnotationData = {
      annoTaskId,
      annotation: annotationInOldFormat,
      imageEditData: imageData,
    }
    sendEditAnnotation(editAnnotationData)
  }

  const handleImageLabelsChanged = (selectedImageIds: number[]) => {
    // satisfy linter
    if (annoData === undefined) return

    // get the time spent on the image (rounded by 2 decimals)
    const imageEditTime: number = TimeUtils.getRoundedDuration(
      imageLoadedTimestamp,
      performance.now(),
    )

    const currentImageData = annoData.image

    // add the time it took the user to edit the anno to the image time
    const newAnnoTime: number = currentImageData.annoTime + imageEditTime

    const imageData: ImageLabelData = {
      imgId: currentImageData.id,
      imgActions: currentImageData.imgActions,
      imgLabelIds: selectedImageIds,
      imgLabelChanged: true,
      annoTime: newAnnoTime,
    }

    sendUpdateImageLabel(imageData)
  }

  const junkImage = (newJunkState) => {
    // satisfy linter
    if (annoData === undefined) return

    // get the time spent on the image (rounded by 2 decimals)
    const imageEditTime: number = TimeUtils.getRoundedDuration(
      imageLoadedTimestamp,
      performance.now(),
    )

    const currentImageData = annoData.image

    // add the time it took the user to edit the anno to the image time
    const newAnnoTime: number = currentImageData.annoTime + imageEditTime

    const imageData = {
      imgId: currentImageData.id,
      annoTime: newAnnoTime,
      isJunk: newJunkState,
    }
    sendJunkImage(imageData)
    setCurrentlySelectedAnnotation(undefined)
  }

  const handleNotification = (messageObj: SIANotification) => {
    switch (messageObj.type) {
      case NotificationType.INFO:
        showInfo(messageObj.message)
        break
      case NotificationType.SUCCESS:
        showSuccess(messageObj.message)
        break
      case NotificationType.WARNING:
        showWarning(messageObj.message)
        break
      case NotificationType.ERROR:
        showError(messageObj.message)
        break
      default:
        break
    }
  }

  const resetWrapper = () => {
    window.removeEventListener('keydown', (e) => handleWrapperKeydown(e.key))
    setAnnotationIdMapping([])
    setPolygonEditMode(PolygonEditMode.NONE)
    setImageBlob(undefined)
  }

  const getSearchImageId = (
    currentId: number,
    isDirectionNext: boolean,
  ): ImageSearchResult => {
    // get position in list to determine if its the first or last entry
    const currentIndex: number = filteredImageIds.findIndex(
      (result: ImageSearchResult) => result.imageId === currentId,
    )

    // next image
    if (isDirectionNext) {
      // catch last image
      if (currentIndex === filteredImageIds.length - 1)
        return { imageId: -1, annotaskId: -1 }

      return filteredImageIds[currentIndex + 1]
    }

    // previous image
    // catch first image
    if (currentIndex === 0) return { imageId: -1, annotaskId: -1 }

    return filteredImageIds[currentIndex - 1]
  }

  const getSpecificImage = (imageId: number) => {
    resetWrapper()

    onSetAnnotationRequestData({
      direction: 'current',
      imageId: imageId,
    })
    setIsImageSearchActive(true)

    // handleClearSamHelperAnnos()
  }

  const handleNewImage = (isForward: boolean) => {
    // abort when going out of available image scope
    const { isFirst, isLast } = checkNavigationConstraints()
    if ((isForward && isLast) || (!isForward && isFirst)) return

    resetWrapper()

    const currentImageId: number = imageRequestData!.imageId
    let newAnnotationRequestData: ImageSwitchData

    // stay in image search filter (if applied)
    if (isImageSearchActive) {
      // quickly hide tooltip - it gets visible again when the next image is loaded
      // otherwise the label button moved the toolbar in a way that the tooltip gets displaced
      setIsImageSearchButtonTooltipOpen(false)

      const nextImageIdInFilter: ImageSearchResult = getSearchImageId(
        currentImageId,
        isForward,
      )

      newAnnotationRequestData = {
        direction: 'current',
        imageId: nextImageIdInFilter.imageId,
      }
    } else {
      newAnnotationRequestData = {
        direction: isForward ? 'next' : 'prev',
        imageId: currentImageId,
      }
    }

    onSetAnnotationRequestData(newAnnotationRequestData as ImageSwitchData)

    // handleClearSamHelperAnnos()
  }

  const getNextImage = () => {
    handleNewImage(true)
  }

  const getPreviousImage = () => {
    handleNewImage(false)
  }

  const submitAnnotask = () => {
    showDecision({
      title: 'Do you really want to finish the annotation task?',
      option1: {
        text: 'YES',
        callback: () => {
          sindFinishAnnotask()
        },
      },
      option2: {
        text: 'NO!',
        callback: () => {},
      },
    })
  }

  // const handleAddAnnotation = () => {
  //     if (annoData?.image?.id) {
  //         inferAnnotations(
  //             {
  //                 imageId: annoData.image.id,
  //                 modelId: siaConfiguration.inferenceModel.id,
  //                 prompts: {
  //                     points: samPoints.map((point: SamPoint) => ({
  //                         x: point.normX,
  //                         y: point.normY,
  //                         label: point.type,
  //                     })),
  //                     bbox: samBBox
  //                         ? {
  //                               xMin: samBBox.xMinNorm,
  //                               yMin: samBBox.yMinNorm,
  //                               xMax: samBBox.xMaxNorm,
  //                               yMax: samBBox.yMaxNorm,
  //                           }
  //                         : undefined,
  //                 },
  //             },
  //             {
  //                 onSuccess: () => {
  //                     showSuccess('Annotations inferred successfully!')
  //                     setSamBBox(undefined) // reset SAM bounding box
  //                     // getNewImage(image.id, 'current')
  //                     // props.getSiaAnnos(image.id, 'current')
  //                 },
  //                 onError: () => {
  //                     showError('An error occurred while inferring annotations!')
  //                 },
  //             },
  //         )
  //     } else {
  //         console.warn('No image id found!')
  //     }
  // }

  // const handleSamPointClick = (x, y, normX, normY, type) => {
  //     // @ts-expect-error disabling type check since it is a jsx file
  //     setSamPoints((prev) => [
  //         ...prev,
  //         {
  //             x: Math.round(x),
  //             y: Math.round(y),
  //             type,
  //             normX,
  //             normY,
  //         },
  //     ])
  // }

  // const handleUpdateSamBBox = (bbox) => {
  //     setSamBBox({
  //         ...bbox,
  //     })
  // }

  // const handleClearSamHelperAnnos = () => {
  //     setSamPoints([])
  //     setSamBBox(undefined)
  // }

  // handle image switching
  const handleWrapperKeydown = (key: string) => {
    switch (key) {
      case 'ArrowLeft':
        getPreviousImage()
        break
      case 'ArrowRight':
        getNextImage()
        break
    }
  }

  const handleBBoxReponse = useCallback((response) => {
    // show errors to user
    if (response?.error) {
      handleNotification({
        title: 'Invalid selection',
        message: response.error,
        type: NotificationType.ERROR,
      })
      setIsSiaLoading(false)
      setPolygonEditMode(PolygonEditMode.NONE)
      return
    } else if (response?.errors) {
      // the response can contain multiple errors at once
      Object.keys(response.errors).forEach((errorTitle) =>
        handleNotification({
          title: errorTitle,
          message: response.errors[errorTitle],
          type: NotificationType.ERROR,
        }),
      )
      return
    }

    if (response?.data === undefined) return

    const newBoxesInOldFormat: LegacyBboxData[] = response!.data
    const toolCoordinates: ToolCoordinates[] = newBoxesInOldFormat.map(
      (legacyBox: LegacyBboxData) => {
        return {
          type: AnnotationTool.BBox,
          coordinates: legacyHelper.convertBboxFormat(legacyBox),
        }
      },
    )

    const newPolygonOperationResult: PolygonOperationResult = {
      polygonsToCreate: toolCoordinates,
      annotationsToDelete: [],
    }

    setPolygonOperationResult(newPolygonOperationResult)
    setIsSiaLoading(false)
  }, [])

  // handles response after we did a polygon operation (HTTP request)
  const handlePolygonOperationResponse = useCallback(
    (response) => {
      // show errors to user
      if (response?.error) {
        handleNotification({
          title: 'Invalid selection',
          message: response.error,
          type: NotificationType.ERROR,
        })
        setIsSiaLoading(false)
        setPolygonEditMode(PolygonEditMode.NONE)
        return
      } else if (response?.errors) {
        // the response can contain multiple errors at once
        Object.keys(response.errors).forEach((errorTitle) =>
          handleNotification({
            title: errorTitle,
            message: response.errors[errorTitle],
            type: NotificationType.ERROR,
          }),
        )
        return
      }

      if (response?.resultantPolygon === undefined) return

      if (response?.type !== 'polygon') return

      const { resultantPolygon } = response

      const toolCoordinates: ToolCoordinates = {
        type: AnnotationTool.Polygon,
        coordinates: resultantPolygon,
      }

      const annotationsToDelete: Annotation[] =
        currentlySelectedAnnotation !== undefined ? [currentlySelectedAnnotation] : []

      const newPolygonOperationResult: PolygonOperationResult = {
        polygonsToCreate: [toolCoordinates],
        annotationsToDelete,
      }

      // write update to SIA
      setPolygonOperationResult(newPolygonOperationResult)
      setIsSiaLoading(false)
    },
    [currentlySelectedAnnotation],
  )

  const handleSelectAnnotation = (annotation: Annotation) => {
    // if we have a polygon edit mode selected we are currently searching for the second polygon to calculate
    if (
      polygonEditMode != PolygonEditMode.NONE &&
      currentlySelectedAnnotation !== undefined
    ) {
      calculatePolygonOperation(currentlySelectedAnnotation, annotation)
    } else {
      setCurrentlySelectedAnnotation(annotation)
    }
  }

  useEffect(() => {
    if (polygonDiffReponse === undefined) return
    handlePolygonOperationResponse(polygonDiffReponse)
  }, [polygonDiffReponse, handlePolygonOperationResponse])

  useEffect(() => {
    if (polygonIntersectionReponse === undefined) return
    handlePolygonOperationResponse(polygonIntersectionReponse)
  }, [polygonIntersectionReponse, handlePolygonOperationResponse])

  useEffect(() => {
    if (polygonUnionReponse === undefined) return
    handlePolygonOperationResponse(polygonUnionReponse)
  }, [polygonUnionReponse, handlePolygonOperationResponse])

  useEffect(() => {
    if (bboxCreationResponse === undefined) return
    handleBBoxReponse(bboxCreationResponse)
  }, [bboxCreationResponse, handleBBoxReponse])

  const checkNavigationConstraints = (): FirstLastResult => {
    // || false -> catch undefined
    let isFirst: boolean = annoData?.image?.isFirst || false
    let isLast: boolean = annoData?.image?.isLast || false

    // check first and last for the restricted image selection if in search mode
    if (isImageSearchActive) {
      const firstLastResult: FirstLastResult = imageSearch.checkFirstLastImage(
        imageId,
        filteredImageIds,
      )

      isFirst = firstLastResult.isFirst
      isLast = firstLastResult.isLast
    }

    return { isFirst, isLast }
  }

  const renderAdditionalButtons = () => {
    const { isFirst, isLast } = checkNavigationConstraints()

    return (
      <>
        <CCol xs="auto">
          <PolygonEditButtons
            polygonEditMode={polygonEditMode}
            onPolygonEditModeChanged={(polygonEditMode: PolygonEditMode) => {
              // bbox calc only needs one annotation
              // trigger the bbox creation right away if theres already an anno selected
              if (
                polygonEditMode === PolygonEditMode.BBOX &&
                currentlySelectedAnnotation !== undefined &&
                ![AnnotationTool.BBox, AnnotationTool.Point].includes(
                  currentlySelectedAnnotation.type,
                )
              ) {
                const legacyAnnotation = legacyHelper.convertAnnoToOldFormat(
                  currentlySelectedAnnotation,
                )

                // conversion possible since we are limiting anno types
                const pointData: Point[] = legacyAnnotation.data as Point[]

                createBBox(pointData)
              }

              setPolygonEditMode(polygonEditMode)
            }}
          />
        </CCol>
        <CCol xs="auto">
          <CButtonGroup>
            <ImageFilterButton
              isDisabled={isSiaLoading}
              appliedFilters={appliedImageFilters}
              onFiltersChanged={setAppliedImageFilters}
            />

            {isImageSearchEnabled && (
              <CTooltip
                content={
                  isImageSearchActive
                    ? 'Image search mode - click to exit'
                    : 'Open image search'
                }
                placement="top"
                visible={isImageSearchButtonTooltipOpen}
                trigger={isImageSearchButtonTooltipOpen ? [] : ['hover']}
              >
                <CButton
                  color={isImageSearchActive ? 'danger' : 'primary'}
                  variant={isImageSearchActive ? undefined : 'outline'}
                  onClick={() => {
                    if (isImageSearchActive) {
                      setIsImageSearchActive(false)
                      setIsImageSearchButtonTooltipOpen(false)
                    } else setIsImgSearchModalVisible(true)
                  }}
                >
                  <FontAwesomeIcon className="mr-3" icon={faSearch} />
                </CButton>
              </CTooltip>
            )}
          </CButtonGroup>
        </CCol>
        <CCol xs="auto">
          <NavigationButtons
            isFirstImage={isFirst}
            isLastImage={isLast}
            isImageSearchActive={isImageSearchActive}
            onNextImagePressed={getNextImage}
            onPreviousImagePressed={getPreviousImage}
            onSubmitAnnotask={submitAnnotask}
          />
        </CCol>

        {/* {siaConfiguration?.inferenceModel?.id && (
                    <CCol>
                        <CBadge color="dark">
                            Inference Model:
                            {' ' + siaConfiguration.inferenceModel.displayName}
                        </CBadge>
                        <CButton
                            onClick={handleAddAnnotation}
                            disabled={
                                isInferenceLoading ||
                                (siaConfiguration.inferenceModel.modelType ===
                                    INFERENCE_MODEL_TYPE.SAM &&
                                    samPoints.length === 0 &&
                                    (samBBox === null || samBBox.width === 0))
                            }
                        >
                            Infer Annotation
                        </CButton>
                    </CCol>
                )} */}
      </>
    )
  }

  return (
    <>
      {isImageSearchEnabled && (
        <SIAImageSearchModal
          isAnnotaskReview={!isDatasetMode}
          id={isDatasetMode ? datasetId : annoTaskId}
          isVisible={isImgSearchModalVisible}
          setIsVisible={setIsImgSearchModalVisible}
          onChooseImage={getSpecificImage}
          possibleAnnotaskLabels={possibleLabels!}
          onSearchResult={setFilteredImageIds}
        />
      )}

      <div
        style={{ height: '100%', width: '100%' }}
        onKeyDown={(e) => {
          if (!e.repeat) handleWrapperKeydown(e.key)
        }}
        tabIndex={0}
      >
        <Sia
          defaultLabelId={defaultLabelId}
          image={imageBlob}
          initialAnnotations={initialAnnotations}
          initialImageLabelIds={annoData?.image.labelIds}
          initialIsImageJunk={annoData?.image?.isJunk}
          isLoading={isSiaLoading}
          isPolygonSelectionMode={polygonEditMode !== PolygonEditMode.NONE}
          possibleLabels={possibleLabels!}
          polygonOperationResult={polygonOperationResult}
          additionalButtons={renderAdditionalButtons()}
          onAnnoChanged={editAnnotation}
          onAnnoCreated={(annotation) => {
            // do nothing when initially creating an annotation
            // @TODO adapt backend to support partly-finished annotations
            console.log('ANNO CREATED', annotation)
          }}
          onAnnoCreationFinished={createAnnotation}
          onAnnoDeleted={deleteAnnotation}
          onImageLabelsChanged={handleImageLabelsChanged}
          onIsImageJunk={junkImage}
          onNotification={handleNotification}
          onSelectAnnotation={handleSelectAnnotation}
        />
      </div>
    </>
  )
}

export default SiaWrapper
