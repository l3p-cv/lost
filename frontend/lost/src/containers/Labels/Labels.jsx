import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import actions from '../../actions'
import { createColumnHelper } from '@tanstack/react-table'

import CreateLabelTree from './CreateLabelTree'
import { useTranslation } from 'react-i18next'
import { FaEdit, FaFileExport } from 'react-icons/fa'
import { CBadge } from '@coreui/react'
import HelpButton from '../../components/HelpButton'
import IconButton from '../../components/IconButton'
import LabelTreeTable from './LabelTreeTable'
import BaseContainer from '../../components/BaseContainer'

let amountOfLabels = 0

const Labels = ({ visLevel }) => {
    const dispatch = useDispatch()
    const labelTrees = useSelector((state) => state.label.trees)
    const { t } = useTranslation()
    const [refetch, setRefetch] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedTreeId, setSelectedTreeId] = useState(null)

    useEffect(() => {
        dispatch(actions.getLabelTrees())
        setRefetch(false)
    }, [refetch])

    const getLabelTreeById = (id) => {
        const lT = labelTrees.find((item) => item.idx === id)
        return lT
    }

    const handleLabelTreeExport = (labelLeafId) => {
        fetch(`${window.API_URL}/label/${labelLeafId}/export`, {
            method: 'get',
            headers: new Headers({
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
        })
            .then((res) => res.blob())
            .then((blob) => saveAs(blob, `${getLabelTreeById(labelLeafId).name}.csv`))
    }

    useEffect(() => {}, [labelTrees])
    const triggerRefetch = () => {
        console.log('REFETCH')
        setRefetch(true)
    }

    const getAmountOfLabels = (n) => {
        amountOfLabels += 1
        if (n.children === undefined) return 1
        n.children.forEach((c) => {
            getAmountOfLabels(c)
        })
        return amountOfLabels
    }

    useEffect(() => {
        dispatch(actions.getLabelTrees(visLevel))
    }, [])

    const defineColumns = () => {
        const columnHelper = createColumnHelper()
        const columns = [
            columnHelper.accessor('name', { header: t('config.treeName') }),
            columnHelper.accessor('description', {
                header: t('config.description'),
                cell: ({ row }) => {
                    return (
                        <HelpButton
                            id={row.original.idx}
                            text={row.original.description}
                        />
                    )
                },
            }),
            columnHelper.display({
                id: 'idx',
                header: t('config.amountLabels'),
                cell: ({ row }) => {
                    amountOfLabels = 0
                    return getAmountOfLabels(row.original) - 1
                },
            }),
            columnHelper.display({
                id: 'group_id',
                header: 'Global',
                cell: ({ row }) => {
                    if (row.original.group_id) {
                        return <CBadge color="success">User</CBadge>
                    }
                    return <CBadge color="primary">Global</CBadge>
                },
            }),
            columnHelper.display({
                id: 'edit',
                header: t('general.edit'),
                cell: ({ row }) => {
                    return (
                        <IconButton
                            left={<FaEdit />}
                            right={t('general.edit')}
                            color="primary"
                            onClick={() => {
                                setIsEditModalOpen(true)
                                setSelectedTreeId(row.index)
                            }}
                        />
                    )
                },
            }),
            columnHelper.display({
                id: 'export',
                header: 'Export',
                cell: ({ row }) => {
                    return (
                        <IconButton
                            left={<FaFileExport />}
                            right={t('config.export')}
                            color="primary"
                            isOutline={false}
                            onClick={() => handleLabelTreeExport(row.original.idx)}
                        />
                    )
                },
            }),
        ]

        return columns
    }
    return (
        <BaseContainer className="mt-3">
            <CreateLabelTree visLevel={visLevel} />

            <LabelTreeTable labelTrees={labelTrees} visLevel={visLevel} />
        </BaseContainer>
    )
}

export default Labels
