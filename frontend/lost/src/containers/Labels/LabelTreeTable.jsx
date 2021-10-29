import React, { useState } from 'react'
import { faEdit, faFileExport } from '@fortawesome/free-solid-svg-icons'

import IconButton from '../../components/IconButton'
import Datatable from '../../components/Datatable'
import BaseModal from '../../components/BaseModal'
import LabelTree from './LabelTree'
import { API_URL } from '../../lost_settings'
import { saveAs } from 'file-saver'

var amountOfLabels = 0

const LabelTreeTable = ({ labelTrees }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedTreeId, setSelectedTreeId] = useState(null)

    const getLabelTreeById = (id) => {
        const lT = labelTrees.find((labelTree) => {
            if (labelTree.idx === id) {
                console.log(labelTree)
                return labelTree
            }
        })
        return lT
    }

    const getAmountOfLabels = (n) => {
        amountOfLabels += 1
        if (n.children === undefined) return 1
        n.children.forEach(function (c) {
            getAmountOfLabels(c)
        })
        return amountOfLabels
    }
    function handleLabelTreeExport(label_leaf_id) {
        fetch(`${API_URL}/label/export/${label_leaf_id}`, {
            method: 'get',
            headers: new Headers({
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
        })
            .then((res) => res.blob())
            .then((blob) => saveAs(blob, `${getLabelTreeById(label_leaf_id).name}.csv`))
    }
    return (
        <>
            <BaseModal
                isOpen={isEditModalOpen}
                isShowCancelButton
                title={'Edit label tree'}
                toggle={() => setIsEditModalOpen(false)}
                onClosed={() => {}}
            >
                <LabelTree labelTree={getLabelTreeById(selectedTreeId)}></LabelTree>
            </BaseModal>

            <Datatable
                data={labelTrees}
                columns={[
                    {
                        Header: 'Tree Name',
                        accessor: 'name',
                    },
                    {
                        Header: 'Description',
                        accessor: 'description',
                    },
                    {
                        Header: 'Amount of Labels',
                        id: 'idx',
                        accessor: (d) => {
                            amountOfLabels = 0
                            return getAmountOfLabels(d) - 1
                        },
                    },
                    {
                        Header: 'Edit',
                        id: 'edit',
                        accessor: (d) => {
                            return (
                                <IconButton
                                    icon={faEdit}
                                    text="Edit"
                                    color="primary"
                                    onClick={() => {
                                        setIsEditModalOpen(true)
                                        setSelectedTreeId(d.idx)
                                    }}
                                />
                            )
                        },
                    },
                    {
                        Header: 'Export',
                        id: 'export',
                        accessor: (d) => {
                            return (
                                <IconButton
                                    icon={faFileExport}
                                    text="Export"
                                    color="primary"
                                    isOutline={false}
                                    onClick={() => handleLabelTreeExport(d.idx)}
                                />
                            )
                        },
                    },
                ]}
                defaultPageSize={10}
            />
        </>
    )
}
export default LabelTreeTable
