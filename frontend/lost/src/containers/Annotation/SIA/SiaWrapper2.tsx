import { KeyboardEvent, useEffect, useState } from 'react'
import {
    useGetSiaAnnos,
    useGetSiaImage,
    useEditAnnotation,
    useCreateAnnotation,
    useDeleteAnnotation,
    useFinishAnnotask,
    useImageJunk,
    useGetSiaPossibleLabels,
    useGetSiaConfiguration,
    usePolygonDifference,
    usePolygonIntersection,
    usePolygonUnion,
    useBBoxCreation,
} from '../../../actions/sia/sia_api'

import { Sia2, PolygonOperationResult, SIANotification, ToolCoordinates } from 'lost-sia'
import { useNavigate } from 'react-router-dom'
import { CBadge, CButton, CCol } from '@coreui/react'
import {
    INFERENCE_MODEL_TYPE,
    useTritonInference,
} from '../../../actions/inference-model/model-api'
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
import {
    AnnotationCoordinates,
    ImageFilter,
    SiaImageRequest,
} from '../../../types/SiaTypes'
import PolygonEditButtons from './PolygonEditButtons'
import PolygonEditMode from '../../../models/PolygonEditMode'
import { selectAnnotation } from '../../../actions/sia/sia'

const SiaWrapper = () => {
    const navigate = useNavigate()

    const [samPoints, setSamPoints] = useState([])
    const [samBBox, setSamBBox] = useState(null)

    const [isSiaLoading, setIsSiaLoading] = useState<boolean>(true)
    const [polygonEditMode, setPolygonEditMode] = useState<PolygonEditMode>(
        PolygonEditMode.NONE,
    )

    const [polygonOperationResult, setPolygonOperationResult] =
        useState<PolygonOperationResult>([])

    const [defaultLabelId, setDefaultLabelId] = useState<number>()

    // save the selected annotation for polygon edit events
    // THIS IS A SHADOW COPY THAT IS NOT USED FROM INSIDE SIA
    const [currentlySelectedAnnotation, setCurrentlySelectedAnnotation] = useState<
        Annotation | undefined
    >()

    const { mutate: inferAnnotations, isLoading: isInferenceLoading } =
        useTritonInference()

    // only the initial annotations (the ones we got from the server) are stored in this component
    // the modified annotations are stored inside SIA and handed to us using events
    const [initialAnnotations, setInitialAnnotations] = useState<Annotation[]>()

    // Annotations that are just created in SIA have never been stored in the backend and therefore don't have an externalId yet.
    // To identify them later on, we store a mapping between the external and SIAs internal id for freshly created annos
    const [annotationIdMapping, setAnnotationIdMapping] = useState({})

    // image nr in annotask
    const [annotationRequestData, setAnnotationRequestData] = useState({
        direction: 'next',
        imageId: -1,
    })

    // image id in filesystem
    const [appliedImageFilters, setAppliedImageFilters] = useState<ImageFilter[]>([])
    const [imageId, setImageId] = useState<number>(-1)
    const imageRequestData: SiaImageRequest = {
        imageId,
        appliedFilters: appliedImageFilters,
    }

    const { data: possibleLabels } = useGetSiaPossibleLabels()
    const { data: siaConfiguration } = useGetSiaConfiguration()

    // requests will automatically refetched when their state (parameter) changes
    const { data: annoData } = useGetSiaAnnos(annotationRequestData)
    const { data: imageBlobRequest } = useGetSiaImage(imageRequestData)
    const [imageBlob, setImageBlob] = useState<string | undefined>()

    // move this to an external state to be able to unload the image
    // changing the image does also reinitialize SIA
    // do this only when possible labels are fetched
    useEffect(() => {
        if (possibleLabels === undefined || imageBlobRequest === undefined) return

        if (
            typeof imageBlobRequest !== 'string' &&
            imageBlobRequest.error !== undefined
        ) {
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
    const { data: createAnnotationResponse, mutate: createAnnotation } =
        useCreateAnnotation()
    const { data: editAnnotationResponse, mutate: editAnnotation } = useEditAnnotation()
    const { data: deleteAnnotationResponse, mutate: deleteAnnotation } =
        useDeleteAnnotation()
    const { data: imageJunkResponse, mutate: junkImage } = useImageJunk()

    const { data: finishAnnotaskResponse, mutate: finishAnnotask } = useFinishAnnotask()

    const { data: polygonDiffReponse, mutate: diffPolygons } = usePolygonDifference()
    const { data: polygonIntersectionReponse, mutate: intersectPolygons } =
        usePolygonIntersection()
    const { data: polygonUnionReponse, mutate: mergePolygons } = usePolygonUnion()
    const { data: bboxCreationResponse, mutate: createBBox } = useBBoxCreation()

    useEffect(() => {
        // react query throws a state update with undefined right before the actual data is set when the query cache is disabled
        if (annoData?.image === undefined || annoData?.annotations === undefined) return

        // @TODO use the old api style (annos separated by type) for now, but convert it here to the new style
        const annotationsByType: LegacyAnnotationResponse = annoData.annotations
        const collectedAnnoData = Object.entries(annotationsByType).flatMap(
            ([type, items]: [string, LegacyAnnotation[]]) =>
                items.map((annotation) =>
                    legacyHelper.convertAnnoToNewFormat(annotation, type),
                ),
        )

        setInitialAnnotations(collectedAnnoData)

        // request the image from the backend
        const imageId = annoData.image.id

        // update the image id
        // the request will automatically refetch
        setImageId(imageId)
    }, [annoData])

    useEffect(() => {
        if (createAnnotationResponse === undefined) return

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

    // const handleAnnoSaveEventResponse = (saveData) => {
    //     console.log('SiaWrapper -> handleAnnoSaveEvent', saveData)
    //     props.siaUpdateOneThing(saveData).then((response) => {
    //         if (response === 'error') {
    //             handleNotification({
    //                 title: 'Anno save failed',
    //                 message: 'Error while saving annotation.',
    //                 type: notificationType.ERROR,
    //             })
    //         } else {
    //             console.log('handleAnnoSaveResponse ', response.data)
    //             setAnnoSaveResponse(response.data)
    //             if (localTaskFinished) {
    //                 props.siaSetTaskFinished()
    //                 props.siaSendFinishToBackend().then(() => {
    //                     navigate('/annotation')
    //                 })
    //             }
    //         }
    //     })
    // }

    const handleFinishAnnotaskResponse = () => {
        // @TODO if success
        navigate('/annotation')
    }

    useEffect(() => {
        if (finishAnnotaskResponse === undefined) return
        handleFinishAnnotaskResponse()
    }, [finishAnnotaskResponse])

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
                message: 'Merge can only be done with polygon annotations',
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
        const firstLegacyAnnotation = legacyHelper.convertAnnoToOldFormat(firstAnnotation)
        const secondLegacyAnnotation =
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
        window.removeEventListener('keydown', (e) => handleWrapperKeydown(e))
        setAnnotationIdMapping([])
        setPolygonEditMode(PolygonEditMode.NONE)
        setImageBlob(undefined)
    }

    const getNextImage = () => {
        resetWrapper()
        setAnnotationRequestData({
            direction: 'next',
            imageId: imageRequestData!.imageId!,
        })

        handleClearSamHelperAnnos()
    }

    const getPreviousImage = () => {
        resetWrapper()
        setAnnotationRequestData({
            direction: 'prev',
            imageId: imageRequestData!.imageId!,
        })

        handleClearSamHelperAnnos()
    }

    const submitAnnotask = () => {
        showDecision({
            title: 'Do you really want to finish the annotation task?',
            option1: {
                text: 'YES',
                callback: () => {
                    finishAnnotask()
                },
            },
            option2: {
                text: 'NO!',
                callback: () => {},
            },
        })
    }

    const failedToLoadImage = () => {
        const message = {
            title: 'Load image error',
            message: 'Failed to load image',
            type: NotificationType.ERROR,
        }
        handleNotification(message)
        return undefined
    }

    const handleAddAnnotation = () => {
        if (annoData?.image?.id) {
            inferAnnotations(
                {
                    imageId: annoData.image.id,
                    modelId: siaConfiguration.inferenceModel.id,
                    prompts: {
                        points: samPoints.map((point) => ({
                            x: point.normX,
                            y: point.normY,
                            label: point.type,
                        })),
                        bbox: samBBox
                            ? {
                                  xMin: samBBox.xMinNorm,
                                  yMin: samBBox.yMinNorm,
                                  xMax: samBBox.xMaxNorm,
                                  yMax: samBBox.yMaxNorm,
                              }
                            : undefined,
                    },
                },
                {
                    onSuccess: () => {
                        showSuccess('Annotations inferred successfully!')
                        setSamBBox(null) // reset SAM bounding box
                        // getNewImage(image.id, 'current')
                        // props.getSiaAnnos(image.id, 'current')
                    },
                    onError: () => {
                        showError('An error occurred while inferring annotations!')
                    },
                },
            )
        } else {
            console.warn('No image id found!')
        }
    }

    const handleSamPointClick = (x, y, normX, normY, type) => {
        // @ts-expect-error disabling type check since it is a jsx file
        setSamPoints((prev) => [
            ...prev,
            {
                x: Math.round(x),
                y: Math.round(y),
                type,
                normX,
                normY,
            },
        ])
    }

    const handleUpdateSamBBox = (bbox) => {
        setSamBBox({
            ...bbox,
        })
    }

    const handleClearSamHelperAnnos = () => {
        setSamPoints([])
        setSamBBox(null)
    }

    // handle image switching
    const handleWrapperKeydown = (e: KeyboardEvent) => {
        if (e.repeat) return

        switch (e.key) {
            case 'ArrowLeft':
                getPreviousImage()
                break
            case 'ArrowRight':
                getNextImage()
                break
        }
    }

    const handleBBoxReponse = (response) => {
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
    }

    // handles response after we did a polygon operation (HTTP request)
    const handlePolygonOperationResponse = (response) => {
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

        const newPolygonOperationResult: PolygonOperationResult = {
            polygonsToCreate: [toolCoordinates],
            annotationsToDelete: [currentlySelectedAnnotation],
        }

        // write update to SIA
        setPolygonOperationResult(newPolygonOperationResult)
        setIsSiaLoading(false)
    }

    useEffect(() => {
        if (polygonDiffReponse === undefined) return
        handlePolygonOperationResponse(polygonDiffReponse)
    }, [polygonDiffReponse])

    useEffect(() => {
        if (polygonIntersectionReponse === undefined) return
        handlePolygonOperationResponse(polygonIntersectionReponse)
    }, [polygonIntersectionReponse])

    useEffect(() => {
        if (polygonUnionReponse === undefined) return
        handlePolygonOperationResponse(polygonUnionReponse)
    }, [polygonUnionReponse])

    useEffect(() => {
        if (bboxCreationResponse === undefined) return
        handleBBoxReponse(bboxCreationResponse)
    }, [bboxCreationResponse])

    return (
        <>
            {siaConfiguration?.inferenceModel?.id && (
                <div
                    style={{
                        paddingBottom: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
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
                </div>
            )}

            <div
                style={{ height: '100%', width: '100%' }}
                onKeyDown={handleWrapperKeydown}
                tabindex="0"
            >
                <Sia2
                    defaultLabelId={defaultLabelId}
                    image={imageBlob}
                    initialAnnotations={initialAnnotations}
                    initialIsImageJunk={annoData?.image?.isJunk}
                    isLoading={isSiaLoading}
                    isPolygonSelectionMode={polygonEditMode !== PolygonEditMode.NONE}
                    possibleLabels={possibleLabels}
                    polygonOperationResult={polygonOperationResult}
                    additionalButtons={
                        <>
                            <CCol xs={6} sm={4} xl={3}>
                                <PolygonEditButtons
                                    polygonEditMode={polygonEditMode}
                                    onPolygonEditModeChanged={(
                                        polygonEditMode: PolygonEditMode,
                                    ) => {
                                        // bbox calc only needs one annotation
                                        // trigger the bbox creation right away if theres already an anno selected
                                        if (
                                            polygonEditMode === PolygonEditMode.BBOX &&
                                            currentlySelectedAnnotation !== undefined &&
                                            currentlySelectedAnnotation.type !==
                                                AnnotationTool.BBOX
                                        ) {
                                            const legacyAnnotation =
                                                legacyHelper.convertAnnoToOldFormat(
                                                    currentlySelectedAnnotation,
                                                )
                                            createBBox(legacyAnnotation.data)
                                        }

                                        setPolygonEditMode(polygonEditMode)
                                    }}
                                />
                            </CCol>
                            <CCol xs={2} md={1}>
                                <ImageFilterButton
                                    isDisabled={isSiaLoading}
                                    appliedFilters={appliedImageFilters}
                                    onFiltersChanged={setAppliedImageFilters}
                                />
                            </CCol>
                            <CCol xs={4} sm={2} xxl={1}>
                                <NavigationButtons
                                    isFirstImage={annoData?.image?.isFirst}
                                    isLastImage={annoData?.image?.isLast}
                                    onNextImagePressed={getNextImage}
                                    onPreviousImagePressed={getPreviousImage}
                                    onSubmitAnnotask={submitAnnotask}
                                />
                            </CCol>
                        </>
                    }
                    onAnnoChanged={(annotation) => {
                        // do nothing when still creating annotation
                        // @TODO adapt backend to support partly-finished annotations
                        if (annotation.status === AnnotationStatus.CREATING) return

                        // the polygon result throws the created and changed event at the same time
                        // we only need the created event since it already contains all coordinates
                        if (polygonEditMode !== PolygonEditMode.NONE) return

                        setCurrentlySelectedAnnotation(annotation)

                        // remember annotation label (set it as the default label when switching the image)
                        if (
                            annotation.labelIds !== undefined &&
                            annotation.labelIds.length > 0
                        )
                            setDefaultLabelId(annotation.labelIds[0])

                        const newAnnotation = { ...annotation }

                        if (
                            [
                                AnnotationStatus.DATABASE,
                                AnnotationStatus.CREATED,
                            ].includes(annotation.status)
                        ) {
                            // mark annoation only as changed if it made contact with the server once
                            // (keeps new annotations new)
                            newAnnotation.status = AnnotationStatus.CHANGED

                            // search for an external anno id in the mapping
                            const externalAnnoId =
                                annotationIdMapping[newAnnotation.internalId]
                            if (externalAnnoId) newAnnotation.externalId = externalAnnoId
                        }

                        const annotationInOldFormat =
                            legacyHelper.convertAnnoToOldFormat(newAnnotation)

                        const currentImageData = annoData.image
                        const imageData = {
                            imgId: currentImageData.id,
                            imgActions: currentImageData.imgActions,
                            annoTime: currentImageData.annoTime, // @TODO
                        }

                        const editAnnotationData = {
                            annotation: annotationInOldFormat,
                            imageEditData: imageData,
                        }
                        editAnnotation(editAnnotationData)
                    }}
                    onAnnoCreated={(annotation) => {
                        // do nothing when initially creating an annotation
                        // @TODO adapt backend to support partly-finished annotations
                        console.log('ANNO CREATED', annotation)
                    }}
                    onAnnoCreationFinished={(annotation) => {
                        // reset polygon edit mode
                        setPolygonEditMode(PolygonEditMode.NONE)
                        setCurrentlySelectedAnnotation(annotation)

                        const newAnnotation = {
                            ...annotation,
                            status: AnnotationStatus.CREATING, // mark as new so the anno is created at the server
                        }
                        const annotationInOldFormat =
                            legacyHelper.convertAnnoToOldFormat(newAnnotation)

                        const currentImageData = annoData.image
                        const imageData = {
                            imgId: currentImageData.id,
                            imgActions: currentImageData.imgActions,
                            annoTime: currentImageData.annoTime, // @TODO
                        }

                        const createAnnotationData = {
                            annotation: {
                                ...annotationInOldFormat,
                                // special case for created annos: the server saves the anno and returns this id back as 'tempId'
                                // use SIAs internalId for identifying the annotation when the response arrived
                                id: `new-${newAnnotation.internalId}`,
                            },
                            imageEditData: imageData,
                        }
                        createAnnotation(createAnnotationData)
                    }}
                    onAnnoDeleted={(annotation) => {
                        const currentImageData = annoData.image
                        const imageData = {
                            imgId: currentImageData.id,
                            imgActions: currentImageData.imgActions,
                            annoTime: currentImageData.annoTime, // @TODO
                        }
                        const deletedAnnotation = {
                            ...annotation,
                            status: AnnotationStatus.DELETED,
                        }

                        // search the mapping if annotation has no external id
                        // annotations that are deleted right after they were created
                        if (deletedAnnotation.externalId == '') {
                            const externalAnnoId =
                                annotationIdMapping[deletedAnnotation.internalId]
                            if (externalAnnoId)
                                deletedAnnotation.externalId = externalAnnoId
                        }

                        const annotationInOldFormat =
                            legacyHelper.convertAnnoToOldFormat(deletedAnnotation)
                        const deleteAnnotationData = {
                            annotation: annotationInOldFormat,
                            imageEditData: imageData,
                        }
                        deleteAnnotation(deleteAnnotationData)
                        setCurrentlySelectedAnnotation(undefined)
                    }}
                    onIsImageJunk={(newJunkState) => {
                        const currentImageData = annoData.image
                        const imageData = {
                            imgId: currentImageData.id,
                            annoTime: currentImageData.annoTime,
                            isJunk: newJunkState,
                        }
                        junkImage(imageData)
                        setCurrentlySelectedAnnotation(undefined)
                    }}
                    onNotification={handleNotification}
                    onSelectAnnotation={(annotation: Annotation) => {
                        // if we have a polygon edit mode selected we are currently searching for the second polygon to calculate
                        if (polygonEditMode != PolygonEditMode.NONE) {
                            calculatePolygonOperation(
                                currentlySelectedAnnotation,
                                annotation,
                            )
                        } else {
                            setCurrentlySelectedAnnotation(annotation)
                        }
                    }}
                />
            </div>
        </>
    )
}

export default SiaWrapper
