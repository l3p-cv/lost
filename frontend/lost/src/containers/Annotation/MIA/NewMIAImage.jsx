import React, { useEffect, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useDispatch } from 'react-redux'
import actions from '../../../actions'
import BaseModal from '../../../components/BaseModal'
import ImageLoading from './ImageLoading'
import { CRow, CSwitch } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

const MIAImage = (props) => {
    const [image, setImage] = useState({ id: props.image.id, data: '' })
    const [clicks, setClicks] = useState(0)
    const [timer, setTimer] = useState(undefined)
    const [classes, setClasses] = useState('')
    const [modalOpen, setModalOpen] = useState(false)

    const dispatch = useDispatch()

    useEffect(() => {
        const mImg = dispatch(actions.getMiaImage(props.image))
        mImg.then((response) => {
            setImage({ ...image, data: response.data })
        })
    }, [])

    useEffect(() => {
        if (props.image.is_active) {
            setClasses(classes.replace(' mia-image-inactive', ''))
        } else {
            if (!classes.includes(' mia-image-inactive')) {
                setClasses(`${classes} mia-image-inactive`)
            }
        }
    }, [props])

    const imageClick = () => {
        let newClicks = clicks + 1
        setClicks(newClicks)
        if (newClicks === 1) {
            setTimer(
                setTimeout(() => {
                    // reset.
                    setClicks(0)
                    if (props.image.is_active) {
                        dispatch(
                            actions.miaToggleActive({
                                image: { ...props.image, is_active: false },
                            }),
                        )
                    } else {
                        dispatch(
                            actions.miaToggleActive({
                                image: { ...props.image, is_active: true },
                            }),
                        )
                    }
                }, 250),
            )
        } else {
            setTimer(clearTimeout(timer))
            setClicks(0)
            setModalOpen(true)
            // if (classes.includes(' mia-image-zoomed')) {
            //     setClasses(classes.replace(' mia-image-zoomed', ''))
            // } else {
            //     setClasses(`${classes} mia-image-zoomed`)
            // }
        }
    }
    const modalFooter = () => {
        return (
            <>
                <CSwitch
                    className={'mx-1'}
                    variant={'3d'}
                    color={'primary'}
                    checked={props.image.is_active}
                    onChange={(e) =>
                        dispatch(
                            actions.miaToggleActive({
                                image: {
                                    ...props.image,
                                    is_active: !props.image.is_active,
                                },
                            }),
                        )
                    }
                />
                <div style={{ marginRight: '50px' }}>
                    {props.image.is_active ? (
                        <b>Included</b>
                    ) : (
                        <>
                            <FontAwesomeIcon
                                className="mr-3"
                                size={'1x'}
                                color={'red'}
                                icon={faTimes}
                            />
                            <b>Excluded</b>
                        </>
                    )}
                </div>
            </>
        )
    }
    return (
        <>
            <BaseModal
                size="xl"
                isOpen={modalOpen}
                isShowCancelButton
                toggle={() => setModalOpen(false)}
                footer={modalFooter()}
            >
                <div key={props.miaKey}>
                    <CRow className="justify-content-center">
                        <TransformWrapper>
                            <TransformComponent>
                                <img
                                    style={{ maxWidth: '100%' }}
                                    src={image.data}
                                    alt=""
                                />
                            </TransformComponent>
                        </TransformWrapper>
                    </CRow>
                </div>
            </BaseModal>
            {image.data ? (
                <>
                    <div style={{ display: 'inline', position: 'relative' }}>
                        <img
                            alt={props.miaKey}
                            id={props.miaKey}
                            onClick={() => imageClick()}
                            src={image.data}
                            className={`mia-image ${classes}`}
                            height={props.height}
                            style={{ display: 'inline' }}
                        />
                        {props.image.is_active ? (
                            ''
                        ) : (
                            <FontAwesomeIcon
                                style={{ position: 'absolute', bottom: 0, left: '45%' }}
                                className="mr-3"
                                size={'2x'}
                                color={'red'}
                                icon={faTimes}
                            />
                        )}
                    </div>
                </>
            ) : (
                <ImageLoading />
            )}
        </>
    )
}

export default MIAImage
