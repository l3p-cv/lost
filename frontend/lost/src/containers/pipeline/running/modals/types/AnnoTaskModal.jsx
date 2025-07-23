import { useEffect } from 'react';
import { faCircle, faEye, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import IconButton from '../../../../../components/IconButton'
import * as Notification from '../../../../../components/Notification'
import CollapseCard from '../../../globalComponents/modals/CollapseCard'
import Table from '../../../globalComponents/modals/Table'
import AnnoTaskTabs from './AnnoTaskModalUtils/AnnoTaskTabs'
import { CModalBody, CModalHeader } from '@coreui/react';

function handleSiaRewiewClick(props, callback) {
    props.siaReviewSetElement(props.id)
    props.chooseAnnoTask(props.annoTask.id, callback)
}

function annotationReleaseSuccessful() {
    Notification.showSuccess('Annotations were successfully released.')
}

function handleForceAnnotationRelease(props) {
    props.forceAnnotationRelease(props.annoTask.id, annotationReleaseSuccessful)
}

const AnnoTaskModal = (props) => {
    const navigate = useNavigate()

    useEffect(() => {
    const timeout = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('joyride-next-step', {
        detail: { step: 'anno-modal-opened' }
        }));
    }, 300);

    return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            <CModalHeader>Annotation Task</CModalHeader>
            <CModalBody>
                <Table
                    style={{ marginBottom: '20px' }}
                    data={[
                        {
                            key: 'Annotation Task Name',
                            value: props.annoTask.name,
                        },
                        {
                            key: 'Pipe Element ID',
                            value: props.id,
                        },
                    ]}
                />
                <CollapseCard icon={faInfoCircle}>
                    <Table
                        data={[
                            {
                                key: 'Annotation Task ID',
                                value: props.annoTask.id,
                            },
                            {
                                key: 'Type',
                                value: props.annoTask.type,
                            },
                            {
                                key: 'Status',
                                value: props.state,
                            },
                        ]}
                    />
                </CollapseCard>
                <div></div>
                <AnnoTaskTabs
                    annotask={props.annoTask}
                    changeUser={props.changeUser}
                    datasetList={[]}
                    datastoreList={[]}
                    hasChangeUser={true}
                    hasShowLabels={true}
                    hasAdaptConfiguration={true}
                ></AnnoTaskTabs>
                <hr></hr>
                <IconButton
                    icon={faEye}
                    color="primary"
                    // isOutline={false}
                    style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
                    onClick={(e) =>
                        handleSiaRewiewClick(props, () => {
                            navigate(`/sia-review/${props.id}`)
                        })
                    }
                    text="Review Annotations"
                />
                <IconButton
                    icon={faCircle}
                    color="danger"
                    style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
                    onClick={(e) => handleForceAnnotationRelease(props)}
                    text="Force Annotation Release"
                />
            </CModalBody>
        </>
    )
}

export default AnnoTaskModal
