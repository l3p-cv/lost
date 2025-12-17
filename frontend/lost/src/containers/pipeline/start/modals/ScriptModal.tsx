import { useNodesData, useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import { Script } from '../../../../actions/pipeline/model/pipeline-template-response'
import CollapseCard from '../../globalComponents/modals/CollapseCard'
import ArgumentsTable from '../../globalComponents/modals/ScriptArgumentsTable'
import { ScriptNodeData } from '../nodes'
import { useRef } from 'react'
import BaseModal from '../../../../components/BaseModal'
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../../../components/CoreDataTable'

interface ScriptModalProps {
  nodeId: string
  isOpen: boolean
  toggle: () => void
  script: Script
}

export const ScriptModal = ({ script, nodeId, isOpen, toggle }: ScriptModalProps) => {
  const nodeData = useNodesData(nodeId)
  const scriptNodeData = nodeData?.data as ScriptNodeData
  const draftArgsRef = useRef<Record<string, string>>({})

  const { updateNodeData } = useReactFlow()

  const argumentTableOnInput = useCallback((e) => {
    const key = e.target.getAttribute('data-ref')
    const value = e.target.value

    draftArgsRef.current[key] = value
  }, [])

  const commitArguments = useCallback(() => {
    if (!scriptNodeData.arguments) return

    const updatedArgs = { ...scriptNodeData.arguments }

    Object.entries(draftArgsRef.current).forEach(([key, value]) => {
      updatedArgs[key] = {
        ...updatedArgs[key],
        value,
      }
    })

    updateNodeData(nodeId, {
      arguments: updatedArgs,
    })

    draftArgsRef.current = {}
  }, [nodeId, scriptNodeData.arguments, updateNodeData])

  const verifyNode = useCallback(() => {
    const verified = scriptNodeData.arguments
      ? Object.values(scriptNodeData.arguments).every((arg) => arg.value)
      : true

    updateNodeData(nodeId, {
      verified,
    })
  }, [nodeId, scriptNodeData.arguments, updateNodeData])

  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('taskName', {
      header: () => 'Attribute',
      cell: ({ row }) => {
        return <b>{`${row.original.key}:`}</b>
      },
    }),
    columnHelper.accessor('taskName', {
      header: () => 'Value',
      cell: ({ row }) => {
        return <>{row.original.value}</>
      },
    }),
  ]

  const tData = [
    {
      key: 'Script Name',
      value: script.name,
    },
    {
      key: 'Description',
      value: script.description,
    },
    {
      key: 'Path',
      value: script.path,
    },
  ]

  return (
    <BaseModal
      size="lg"
      title="Script"
      isOpen={isOpen}
      onShow={verifyNode}
      onClosed={() => {
        commitArguments()
        verifyNode()
        toggle()
      }}
    >
      <CoreDataTable columns={columns} tableData={tData} usePagination={false} />
      <CollapseCard buttonText={'Script Arguments'}>
        <ArgumentsTable data={scriptNodeData.arguments} onInput={argumentTableOnInput} />
      </CollapseCard>
    </BaseModal>
  )
}
