import { useEffect, useState } from 'react'
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
} from '../../../actions/sia/sia_api'

import { Sia2, notificationType } from 'lost-sia'
import { useNavigate } from 'react-router-dom'
import { CBadge, CButton } from '@coreui/react'
import {
    INFERENCE_MODEL_TYPE,
    useTritonInference,
} from '../../../actions/inference-model/model-api'
import {
    showError,
    showInfo,
    showSuccess,
    showWarning,
} from '../../../components/Notification'
import NavigationButtons from './NavigationButtons'

import { Annotation, AnnotationStatus, AnnotationTool } from 'lost-sia/models'

import legacyHelper, { LegacyAnnotation, LegacyAnnotationResponse } from './legacyHelper'

const SiaWrapper = () => {
    const navigate = useNavigate()

    const [samPoints, setSamPoints] = useState([])
    const [samBBox, setSamBBox] = useState(null)

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
    const [imageId, setImageId] = useState<number | undefined>()

    const { data: possibleLabels } = useGetSiaPossibleLabels()
    const { data: siaConfiguration } = useGetSiaConfiguration()

    // requests will automatically refetched when their state (parameter) changes
    const { data: annoData } = useGetSiaAnnos(annotationRequestData)
    const { data: imageBlobRequest } = useGetSiaImage(imageId)
    const [imageBlob, setImageBlob] = useState<string | undefined>()

    // move this to an external state to be able to unload the image
    // changing the image does also reinitialize SIA
    // do this only when possible labels are fetched
    useEffect(() => {
        if (possibleLabels === undefined) return

        setImageBlob(imageBlobRequest)
    }, [imageBlobRequest, possibleLabels])

    // @TODO check if request worked
    const { data: createAnnotationResponse, mutate: createAnnotation } =
        useCreateAnnotation()
    const { data: editAnnotationResponse, mutate: editAnnotation } = useEditAnnotation()
    const { data: deleteAnnotationResponse, mutate: deleteAnnotation } =
        useDeleteAnnotation()
    const { data: imageJunkResponse, mutate: junkImage } = useImageJunk()

    const { data: finishAnnotaskResponse, mutate: finishAnnotask } = useFinishAnnotask()

    useEffect(() => {
        // react query throws a state update with undefined right before the actual data is set when the query cache is disabled
        if (annoData?.image === undefined || annoData?.annotations === undefined) return

        // @TODO use the old api style (annos separated by type) for now, but convert it here to the new style
        const annotationsByType: LegacyAnnotationResponse = annoData.annotations
        const collectedAnnoData = Object.entries(annotationsByType).flatMap(
            ([type, items]: [string, LegacyAnnotation[]]) =>
                items.map((annotation) => {
                    const convertedAnnoType = legacyHelper.convertAnnoToolType(type)

                    let newCoords = annotation.data

                    if (convertedAnnoType === AnnotationTool.BBox) {
                        // the old format saved the CENTER of the BBox, not the top left corner...
                        const centerPoint = { x: newCoords.x, y: newCoords.y }
                        const topLeftPoint = {
                            x: centerPoint.x - newCoords.w / 2,
                            y: centerPoint.y - newCoords.h / 2,
                        }
                        const bottomRightPoint = {
                            x: centerPoint.x + newCoords.w / 2,
                            y: centerPoint.y + newCoords.h / 2,
                        }

                        newCoords = [topLeftPoint, bottomRightPoint]
                    }

                    if (convertedAnnoType === AnnotationTool.Point) {
                        newCoords = [annotation.data]
                    }

                    return {
                        ...annotation,
                        id: null,
                        data: null,
                        externalId: annotation.id,
                        coordinates: newCoords,
                        type: convertedAnnoType,
                        status: AnnotationStatus.DATABASE,
                    }
                }),
        )

        setInitialAnnotations(collectedAnnoData)

        // request the image from the backend
        const imageId = annoData.image.id
        setImageId(imageId)
    }, [annoData])

    useEffect(() => {
        if (createAnnotationResponse === undefined) return

        // we got an external id assigned from the server
        // update the mapping
        console.log('createAnnotationResponse', createAnnotationResponse)

        // remove the 'new-' prefix
        const siaInternalAnnoId = parseInt(
            createAnnotationResponse.tempId.replace('new-', ''),
        )

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

    const handleNotification = (messageObj) => {
        switch (messageObj.type) {
            case notificationType.WARNING:
                showWarning(messageObj.message)
                break
            case notificationType.INFO:
                showInfo(messageObj.message)
                break
            case notificationType.ERROR:
                showError(messageObj.message)
                break
            case notificationType.SUCCESS:
                showSuccess(messageObj.message)
                break
            default:
                break
        }
    }

    const getNextImage = () => {
        setImageBlob(undefined)
        setAnnotationRequestData({
            direction: 'next',
            imageId: imageId!,
        })

        handleClearSamHelperAnnos()
    }

    const getPreviousImage = () => {
        setImageBlob(undefined)
        setAnnotationRequestData({
            direction: 'prev',
            imageId: imageId!,
        })

        handleClearSamHelperAnnos()
    }

    const submitAnnotask = () => {
        console.log('@TODO implement finish annotask logic here')
        // @TODO prompt
        // finishAnnotask()
    }

    const failedToLoadImage = () => {
        const message = {
            title: 'Load image error',
            message: 'Failed to load image',
            type: notificationType.ERROR,
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
            <div style={{ height: '100%', width: '100%' }}>
                <Sia2
                    image={imageBlob}
                    initialAnnotations={initialAnnotations}
                    initialIsImageJunk={annoData?.image?.isJunk}
                    isLoading={!imageBlob}
                    possibleLabels={possibleLabels}
                    additionalButtons={
                        <NavigationButtons
                            isFirstImage={annoData?.image?.isFirst}
                            isLastImage={annoData?.image?.isLast}
                            onNextImagePressed={getNextImage}
                            onPreviousImagePressed={getPreviousImage}
                            onSubmitAnnotask={submitAnnotask}
                        />
                    }
                    onAnnoChanged={(annotation) => {
                        // do nothing when still creating annotation
                        // @TODO adapt backend to support partly-finished annotations
                        if (annotation.status === AnnotationStatus.CREATING) return

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
                        const annotationInOldFormat =
                            legacyHelper.convertAnnoToOldFormat(deletedAnnotation)
                        const deleteAnnotationData = {
                            annotation: annotationInOldFormat,
                            imageEditData: imageData,
                        }
                        deleteAnnotation(deleteAnnotationData)
                    }}
                    onIsImageJunk={(newJunkState) => {
                        const currentImageData = annoData.image
                        const imageData = {
                            imgId: currentImageData.id,
                            annoTime: currentImageData.annoTime,
                            isJunk: newJunkState,
                        }
                        junkImage(imageData)
                    }}
                />
            </div>
        </>
    )
}

export default SiaWrapper
