import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { useUpdatePipelineArguments } from '../../../../../api/pipeline/pipeline'
import CollapseCard from '../../../globalComponents/modals/CollapseCard'
import ArgumentsTable from '../../../globalComponents/modals/ScriptArgumentsTable'
import { CCol, CProgress, CRow } from '@coreui/react'
import CoreIconButton from '../../../../../components/CoreIconButton'
import BaseModal from '../../../../../components/BaseModal'
import { createColumnHelper } from '@tanstack/react-table'
import CoreDataTable from '../../../../../components/CoreDataTable'
import React from 'react'
import { useEffect } from 'react'

type ScriptModalProps = {
  id: number | string
  state: string
  onClose: () => void
  modalOpened: boolean
  script: {
    name: string
    description: string
    id: number | string
    path: string
    errorMsg: string
    progress: number
    arguments: {}
  }
}

const ScriptModal = ({ script, id, state, modalOpened, onClose }: ScriptModalProps) => {
  const [commitVersion, setCommitVersion] = useState(0)
  const [scriptArguments, setScriptArguments] = useState(script.arguments)

  const progress = script.progress
  const draftArgumentsRef = React.useRef({})

  const { mutate: updatePipelineArguments } = useUpdatePipelineArguments()

  useEffect(() => {
    setScriptArguments(script.arguments)
  }, [script.arguments])

  const argumentsOnInput = (e) => {
    const key = e.target.getAttribute('data-ref')
    const value = e.target.value
    // Store draft ONLY, no state update
    draftArgumentsRef.current[key] = value
  }

  const buildUpdatedArguments = () => {
    const updated = { ...scriptArguments }

    Object.entries(draftArgumentsRef.current).forEach(([key, value]) => {
      updated[key] = {
        ...updated[key],
        value,
      }
    })

    return updated
  }

  const onUpdateArguments = () => {
    const updated = buildUpdatedArguments()

    updatePipelineArguments({
      elementId: id,
      updatedArguments: updated,
    })

    setScriptArguments(updated)
    draftArgumentsRef.current = {}
    setCommitVersion((v) => v + 1)
  }

  const tData = [
    ['Script Name:', script.name],
    ['Description:', script.description],
    ['Pipe Element ID:', id],
    ['Script ID:', script.id],
    ['Path:', script.path],
    ['Status:', state],
    ['Error Message:', script.errorMsg, { color: 'red' }],
  ].map(([key, value, valueStyle]) => ({
    key,
    value,
    valueStyle,
  }))

  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('taskName', {
      header: () => 'Attribute',
      cell: ({ row }) => {
        return <b>{row.original.key}</b>
      },
    }),
    columnHelper.accessor('taskName', {
      header: () => 'Value',
      cell: ({ row }) => {
        return <>{row.original.value}</>
      },
    }),
  ]

  return (
    <BaseModal title="Script" isOpen={modalOpened} onClosed={onClose}>
      <CoreDataTable tableData={tData} usePagination={false} columns={columns} />
      <CProgress color="info" value={progress}>
        {`${progress}%`}
      </CProgress>
      <CollapseCard>
        <ArgumentsTable data={scriptArguments} onInput={argumentsOnInput} />
        <CRow className="justify-content-end">
          <CCol sm="auto">
            <CoreIconButton
              color="primary"
              icon={faCloudUploadAlt}
              text="Update Arguments"
              onClick={onUpdateArguments}
            />
          </CCol>
        </CRow>
      </CollapseCard>
    </BaseModal>
  )
}

export default ScriptModal
