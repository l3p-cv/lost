import React from 'react'
import { ModalHeader, ModalBody } from 'reactstrap'
import { faEye, faCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Table from '../../../../globalComponents/modals/Table'
import CollapseCard from '../../../../globalComponents/modals/CollapseCard'
import * as Notification from '../../../../../../components/Notification'
import { useHistory } from 'react-router-dom'
import IconButton from '../../../../../../components/IconButton'
import AnnoTaskTabs from './AnnoTaskModalUtils/AnnoTaskTabs'

// function download(filename, text) {
//     var element = document.createElement('a');
//     element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
//     element.setAttribute('download', filename);

//     element.style.display = 'none';
//     document.body.appendChild(element);

//     element.click();

//     document.body.removeChild(element);
//   }

function handleSiaRewiewClick(props, callback) {
    props.siaReviewSetElement(props.id)
    props.chooseAnnoTask(
        props.annoTask.id,
        callback,
        // createHashHistory().push('/sia-review')
        // () => {}
    )
    // history.push('/sia-review')
}

function annotationReleaseSuccessful() {
    Notification.showSuccess('Annotations were successfully released.')
}

function handleForceAnnotationRelease(props) {
    props.forceAnnotationRelease(props.annoTask.id, annotationReleaseSuccessful)
}

const AnnoTaskModal = (props) => {
    const hist = useHistory()

    return (
        <>
            <ModalHeader>Annotation Task</ModalHeader>
            <ModalBody>
                <Table
                    style={{ marginBottom: '20px' }}
                    data={[
                        {
                            key: 'Annotation Task Name',
                            value: props.annoTask.name,
                        },
                        {
                            key: 'Instructions',
                            value: props.annoTask.instructions,
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
                ></AnnoTaskTabs>

                {/* <IconButton
                    icon={faDownload}
                    color="primary"
                    isOutline={false}
                    style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
                    onClick={(e) => handleInstantAnnoDownload(props.id, 'csv')}
                    text="CSV - Download"
                />
                <IconButton
                    icon={faDownload}
                    color="primary"
                    isOutline={false}
                    style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
                    onClick={(e) => handleInstantAnnoDownload(props.id, 'parquet')}
                    text="Parquet - Download"
                /> */}
                <hr></hr>
                <IconButton
                    icon={faEye}
                    color="primary"
                    // isOutline={false}
                    style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
                    onClick={(e) =>
                        handleSiaRewiewClick(props, () => {
                            hist.push(`/sia-review/${props.id}`)
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
            </ModalBody>
        </>
    )
}

export default AnnoTaskModal
