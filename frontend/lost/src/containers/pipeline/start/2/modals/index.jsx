import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import actions from '../../../../../actions/pipeline/pipelineStart'
import IconButton from '../../../../../components/IconButton'
import AnnoTaskModal from './types/annoTaskModal/AnnoTaskModal'
import DatasourceModal from './types/DatasourceModal'
import LoopModal from './types/LoopModal'
import ScriptModal from './types/ScriptModal'

const { toggleModal, verifyNode, verifyTab } = actions

const BaseModal = () => {
    const dispatch = useDispatch()

    const step = useSelector((state) => state.pipelineStart.stepper.steps[1])
    const data = useSelector((state) => state.pipelineStart.step1Data)

    const modalData = useMemo(() => {
        return (
            data &&
            step.modalOpened &&
            data.elements.find((el) => el.peN === step.modalClickedId)
        )
    }, [data, step.modalOpened, step.modalClickedId])

    const handleToggleModal = useCallback(() => {
        dispatch(toggleModal(step.modalClickedId))
    }, [dispatch, step.modalClickedId])

    const handleVerifyNode = useCallback(() => {
        if (!modalData) return

        let verified = false

        switch (modalData.type) {
            case 'datasource': {
                const { datasource } = modalData.exportData
                verified = !!datasource.selectedPath
                break
            }
            case 'script': {
                const { script } = modalData.exportData
                verified = script.arguments
                    ? Object.keys(script.arguments).every(
                          (key) => !!script.arguments[key].value,
                      )
                    : true
                break
            }
            case 'annoTask': {
                const { annoTask } = modalData.exportData
                verified = !!(
                    annoTask.name &&
                    annoTask.instructions &&
                    annoTask.assignee &&
                    annoTask.labelLeaves.length > 0 &&
                    annoTask.workerId &&
                    annoTask.selectedLabelTree
                )
                break
            }
            case 'loop': {
                verified = true
                break
            }
            default:
                break
        }

        dispatch(verifyNode(modalData.peN, verified))

        const allNodesVerified =
            data.elements.filter((el) => {
                if (el.peN === modalData.peN) {
                    return !verified
                }
                return !el.verified
            }).length === 0

        dispatch(verifyTab(1, allNodesVerified))
    }, [dispatch, modalData, data])

    useEffect(() => {
        if (!step.modalOpened) return

        return () => {
            handleVerifyNode()
        }
    }, [step.modalOpened, handleVerifyNode])

    const renderModalContent = useMemo(() => {
        if (!modalData) return null

        switch (modalData.type) {
            case 'datasource':
                return <DatasourceModal {...modalData} />
            case 'script':
                return <ScriptModal {...modalData} />
            case 'annoTask':
                return (
                    <AnnoTaskModal
                        {...modalData}
                        availableLabelTrees={data.availableLabelTrees}
                        availableGroups={data.availableGroups}
                    />
                )
            case 'loop':
                return <LoopModal {...modalData} />
            default:
                return null
        }
    }, [modalData, data])

    if (!data || !step.modalOpened) return null

    return (
        <Modal
            onClosed={handleVerifyNode}
            size="lg"
            isOpen={step.modalOpened}
            toggle={handleToggleModal}
        >
            <ModalHeader>{modalData?.title}</ModalHeader>
            <ModalBody>{renderModalContent}</ModalBody>
            <ModalFooter>
                <IconButton
                    color="secondary"
                    isOutline={false}
                    icon={faCheck}
                    text="Okay"
                    onClick={handleToggleModal}
                />
            </ModalFooter>
        </Modal>
    )
}

export default BaseModal
