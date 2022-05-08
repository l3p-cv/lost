import React, { useEffect, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useDispatch } from 'react-redux'
import actions from '../../../actions'
import BaseModal from '../../../components/BaseModal'
import ImageLoading from './ImageLoading'
import { CSwitch } from '@coreui/react'

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
                    {props.image.is_active ? <b>Included</b> : <b>Excluded</b>}
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
                    <div className="flex justify-center my-1">
                        <TransformWrapper>
                            <TransformComponent>
                                <img
                                    style={{ maxWidth: '100%' }}
                                    className={`${classes}`}
                                    src={image.data}
                                    alt=""
                                />
                            </TransformComponent>
                        </TransformWrapper>
                    </div>
                </div>
            </BaseModal>
            {image.data ? (
                <img
                    alt={props.miaKey}
                    id={props.miaKey}
                    onClick={() => imageClick()}
                    src={image.data}
                    className={`mia-image ${classes}`}
                    height={props.height}
                />
            ) : (
                <ImageLoading />
            )}
        </>
    )
}

export default MIAImage
