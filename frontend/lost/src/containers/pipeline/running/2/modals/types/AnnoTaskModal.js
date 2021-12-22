import React, { useEffect } from 'react'
import { Badge, ModalHeader, ModalBody } from 'reactstrap'
import Table from '../../../../globalComponents/modals/Table'
import CollapseCard from '../../../../globalComponents/modals/CollapseCard'
import { alertSuccess } from '../../../../globalComponents/Sweetalert'
import Datatable from '../../../../../../components/Datatable'
import { useDispatch, useSelector } from 'react-redux'
import {
    faUsers,
    faInfo,
    faDownload,
    faEye,
    faCircle,
    faTag,
} from '@fortawesome/free-solid-svg-icons'
// import axios from 'axios'
import { API_URL } from '../../../../../../lost_settings'
import { saveAs } from 'file-saver'
// import { createHashHistory } from 'history'
import { useHistory } from 'react-router-dom'
import actions from '../../../../../../actions'
import IconButton from '../../../../../../components/IconButton'

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

function handleInstantAnnoDownload(pe_id) {
    fetch(`${API_URL}/data/annoexport/${pe_id}`, {
        method: 'get',
        headers: new Headers({
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        }),
    })
        .then((res) => res.blob())
        .then((blob) => saveAs(blob, `annos_pe_${pe_id}.parquet`))
}

function annotationReleaseSuccessful() {
    // console.log('Annotation release successful')
    alertSuccess('Annotation release successful')
}

function changeUserSuccessful() {
    // console.log('Annotation release successful')
    alertSuccess('Change user successful')
}

function handleForceAnnotationRelease(props) {
    // console.log('Start annotation release')
    props.forceAnnotationRelease(props.annoTask.id, annotationReleaseSuccessful)
}

function handleChangeUser(props, groupId) {
    props.changeUser(props.annoTask.id, groupId, changeUserSuccessful)
}

const AnnoTaskModal = (props) => {
    const dispatch = useDispatch()
    const users = useSelector((state) => state.user.users)
    const groups = useSelector((state) => state.group.groups)
    const hist = useHistory()
    useEffect(() => {
        dispatch(actions.getUsers())
        dispatch(actions.getGroups())
    }, [])

    const dataTableData = [
        ...users.map((user) => ({
            idx: user.idx,
            rawName: user.user_name,
            name: `${user.user_name} (user)`,
        })),
        ...groups.map((group) => ({
            idx: group.idx,
            rawName: group.name,
            name: `${group.name} (group)`,
        })),
    ]
    return (
        <>
            <ModalHeader>Annotation Task</ModalHeader>
            <ModalBody>
                <Table
                    data={[
                        {
                            key: 'Annotation Task Name',
                            value: props.annoTask.name,
                        },
                        {
                            key: 'Instructions',
                            value: props.annoTask.instructions,
                        },
                    ]}
                />
                <CollapseCard icon={faInfo}>
                    <Table
                        data={[
                            {
                                key: 'Element ID',
                                value: props.id,
                            },
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
                <CollapseCard icon={faUsers} buttonText="Adapt Users/Groups">
                    {dataTableData.length > 1 ? (
                        <Datatable
                            data={dataTableData}
                            columns={[
                                {
                                    Header: 'ID',
                                    accessor: 'idx',
                                },
                                {
                                    Header: 'Name',
                                    accessor: 'name',
                                },
                                {
                                    Header: 'Change',
                                    id: 'change',
                                    accessor: (d) => {
                                        if (d.rawName === props.annoTask.userName) {
                                            return (
                                                <IconButton
                                                    color="success"
                                                    isOutline={false}
                                                    text="Selected"
                                                    disabled
                                                />
                                            )
                                        }
                                        return (
                                            <IconButton
                                                color="primary"
                                                text="Change"
                                                onClick={() =>
                                                    handleChangeUser(props, d.idx)
                                                }
                                            />
                                        )
                                    },
                                },
                            ]}
                        />
                    ) : (
                        ''
                    )}
                </CollapseCard>

                <CollapseCard icon={faTag} buttonText="Show Labels">
                    <div>
                        <b>All children of the label tree(s):</b>
                    </div>
                    <h5>
                        <Badge color="primary" pill>
                            {props.annoTask.labelLeaves.map((l) => {
                                return l.name
                            })}
                        </Badge>
                    </h5>
                </CollapseCard>
                <IconButton
                    icon={faDownload}
                    color="primary"
                    isOutline={false}
                    style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
                    onClick={(e) => handleInstantAnnoDownload(props.id)}
                    text="Download Annotations"
                />
                <IconButton
                    icon={faEye}
                    color="warning"
                    style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
                    onClick={(e) =>
                        handleSiaRewiewClick(props, () => {
                            hist.push('/sia-review')
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
