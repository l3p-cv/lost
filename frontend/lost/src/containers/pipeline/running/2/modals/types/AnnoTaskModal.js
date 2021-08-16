import React,{useEffect, useState} from 'react'
import { ModalHeader, ModalBody, Button } from 'reactstrap';
import Table from '../../../../globalComponents/modals/Table'
import CollapseCard from '../../../../globalComponents/modals/CollapseCard'
import { alertSuccess } from '../../../../globalComponents/Sweetalert'
import ReactTable from 'react-table'
import {useDispatch, useSelector} from 'react-redux'
import axios from 'axios'
import {API_URL} from '../../../../../../lost_settings'
import fileDownload from 'js-file-download'

// import { createHashHistory } from 'history'
import { useHistory } from 'react-router-dom'
import actions from '../../../../../../actions'

function handleSiaRewiewClick(props, callback){
    props.siaReviewSetElement(props.id)
    props.chooseAnnoTask(
        props.annoTask.id, 
        callback
        // createHashHistory().push('/sia-review')
        // () => {}
    )
    // history.push('/sia-review')
}

function handleInstantAnnoDownload(pe_id){
    axios.post(API_URL+'/data/annoexport', {'pe_id':pe_id}).then( resp => {
      fileDownload(resp.data, `annos_pe_${pe_id}.parquet`)
    })
  }

function annotationReleaseSuccessful(){
    // console.log('Annotation release successful')
    alertSuccess('Annotation release successful')
}

function handleForceAnnotationRelease(props){
    // console.log('Start annotation release')
    props.forceAnnotationRelease(props.annoTask.id, annotationReleaseSuccessful)
}
const AnnoTaskModal =  (props)=>{
    const dispatch = useDispatch()
    const users = useSelector(state=>state.user.users)
    const groups = useSelector(state=>state.group.groups)
    const [newUserIdx, setNewUserIdx]  = useState()
    const hist = useHistory()
    useEffect(()=>{
        dispatch(actions.getUsers())
        dispatch(actions.getGroups())
    }, [])
    const dataTableData = [
        ...users.map(user=>({
            idx: user.idx,
            rawName: user.user_name,
            name: `${user.user_name} (user)`
        })),
        ...groups.map(group=>({
            idx: group.idx,
            rawName: group.name,
            name: `${group.name} (group)` 
        }))
    ]
    return (
        <>
            <ModalHeader>Annotation Task</ModalHeader>
            <ModalBody>
                <Table
                    data={[
                        {
                            key: 'Annotation Task Name',
                            value: props.annoTask.name
                        },
                        {
                            key: 'Instructions',
                            value: props.annoTask.instructions
                        }
                    ]}
                />
                <CollapseCard
                    buttonText="Adapt Users/Groups"
                >
                    <ReactTable
                        data={dataTableData}
                        getTrProps={(state,rowInfo)=>{
                            let backgroundColor
                            if(rowInfo){
                                if(!newUserIdx && props.annoTask.userName === rowInfo.original.rawName){
                                    backgroundColor = 'orange'
                                }else if(newUserIdx && newUserIdx == rowInfo.original.idx){
                                    backgroundColor = 'orange'
                                } 

                            }
                            return {
                                onClick: (e) => {
                                    setNewUserIdx(rowInfo.original.idx)
                                },
                                style: {
                                    background: backgroundColor,
                                }
                            }


                        }}
                        columns={[
                            {
                                Header: 'ID',
                                accessor: 'idx',
                            },
                            {
                                Header: 'Name',
                                accessor: 'name',
                            }
                        ]}

                    />
                </CollapseCard>
                <CollapseCard>
                    <Table
                        data={[
                            {
                                key: 'Element ID',
                                value: props.id
                            },
                            {
                                key: 'Annotation Task ID',
                                value: props.annoTask.id
                            },
                            {
                                key: 'Type',
                                value: props.annoTask.type
                            },
                            {
                                key: 'Status',
                                value: props.state
                            }
                        ]}
                    />
                </CollapseCard>
                <Button color="success" style={{ marginLeft:10, marginTop:20, marginBottom: '1rem' }}
                    onClick={e => handleInstantAnnoDownload(props.id)}>Download Annotations</Button>
                <Button color="warning" style={{ marginLeft:10, marginTop:20, marginBottom: '1rem' }}
                    onClick={e => handleSiaRewiewClick(props, () => {hist.push('/sia-review')})}>Review Annotations</Button>
                <Button color="danger" style={{ marginLeft:10, marginTop:20, marginBottom: '1rem' }}
                    onClick={e => handleForceAnnotationRelease(props)}>Force Annotation Release</Button>

            </ModalBody>
        </>
    )
}

export default AnnoTaskModal