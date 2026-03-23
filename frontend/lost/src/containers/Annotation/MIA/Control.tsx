import { useState, useEffect } from 'react'
import {
  CButtonGroup,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormSelect,
  CInputGroup,
  CRow,
} from '@coreui/react'
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faArrowLeft,
  faArrowRight,
  faArrowsAltH,
  faLock,
  faLockOpen,
  faSearchMinus,
  faSearchPlus,
  faTag,
} from '@fortawesome/free-solid-svg-icons'
import CoreIconButton from '../../../components/CoreIconButton'
import TagLabel from '../../../components/TagLabel'
import './Tag.scss'
import {
  useUpdateMia,
  useGetSpecialMiaAnnos,
  useGoBackMia,
  useGoToFirstMIA,
  useGoToLatestMIA,
} from '../../../api/mia'
import { MiaAnnosResponse, StateManager } from '../../../types/MiaTypes'

type ControlProps = {
  zoomState: StateManager<number>
  maxAmountState: StateManager<number>
  labels: Record<number, boolean>
  selectedLabelState: StateManager<{
    labelProps: { label: string | undefined; id: number | undefined } | undefined
    color: string
  }>
  miaAnnos: MiaAnnosResponse
  imageActiveStates: {
    value: Record<number, boolean>
    set: (id: number, active: boolean) => void
  }
  annotaskFinishedLbls: number
  permaReverseState: StateManager<boolean>
}

const Control = ({
  zoomState,
  maxAmountState,
  labels,
  selectedLabelState,
  miaAnnos,
  imageActiveStates,
  annotaskFinishedLbls,
  permaReverseState,
}: ControlProps) => {
  const selectStyle = {
    width: '250px',
    maxWidth: '250px',
    borderRadius: 0,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    annotaskFinishedLbls: 0,
  }

  const [newProposedLbl, setNewProposedLbl] = useState(true)
  const [selectedLblIdStr, setSelectedLblIdStr] = useState('')
  const { mutate: updateMia } = useUpdateMia()
  const proposedLabel = miaAnnos?.proposedLabel
  const currentChunk = miaAnnos?.chunk
  const currentUpdateIds = [...new Set(miaAnnos.images.map((img) => img.updateId))]
  const hasPrev = annotaskFinishedLbls == 0 ? false : currentChunk?.hasPrev
  const isLatest =
    (currentUpdateIds.length == 1 && currentUpdateIds[0] == -1) ||
    miaAnnos.images.length == 0
  const { mutate: goBackMia, isLoading: goBackisLoading } = useGoBackMia()
  const { mutate: goToFirstMia, isLoading: goFirstLoading } = useGoToFirstMIA()
  const { mutate: goToLatestMia, isLoading: goLatestLoading } = useGoToLatestMIA()
  const anySelected = Object.values(imageActiveStates.value).some(Boolean)

  const { data, refetch } = useGetSpecialMiaAnnos(undefined, {
    enabled: false,
    onSuccess: (data) => {
      data.images.forEach((img) => {
        imageActiveStates.set(img.id, img.is_active)
      })
      selectedLabelState.set(data.labels?.[0])
    },
  })

  const zoomIn = () => {
    const newZoom = Math.min(zoomState.value * 1.2, 1920)
    zoomState.set(newZoom)
  }

  const zoomOut = () => {
    const newZoom = Math.max(zoomState.value * 0.8, 20)
    zoomState.set(() => newZoom)
  }

  const handleReverse = () => {
    miaAnnos.images.map((image) => {
      imageActiveStates.set(image.id, !imageActiveStates.value[image.id])
      return undefined
    })
  }
  const handleAddLabel = (label) => {
    selectedLabelState.set(label)
  }

  const handlePermaReverse = () => {
    permaReverseState.set(!permaReverseState.value)
    handleReverse()
  }

  const handleLabelChange = (e) => {
    const selectedLblId = Number(e.target.value)

    setSelectedLblIdStr(selectedLblId)

    const selectedLabel = labels.find((lbl) => lbl.id === selectedLblId)
    if (selectedLabel) {
      handleAddLabel(selectedLabel)
    }
  }

  const handleSubmit = () => {
    const updateData = {
      images: miaAnnos.images.map((img) => ({
        ...img,
        is_active: imageActiveStates.value[img.id],
      })),
      labels: [{ ...selectedLabelState.value }],
    }
    updateMia(updateData, {
      onSuccess: async () => {
        selectedLabelState.set(undefined)
        setNewProposedLbl(true)
        setSelectedLblIdStr('')
      },
    })
  }

  const handleMaxAmount = (e) => {
    maxAmountState.set(e.target.innerText)
    selectedLabelState.set(undefined)
  }

  const handleUndo = () => {
    goBackMia({
      currentChunkId: currentChunk.id,
      currentUpdateIds: currentUpdateIds, // TODO: undefined even if miaAnnos there
      maxAmount: maxAmountState.value,
    })
  }

  const handleGoToFirst = () => {
    goToFirstMia(maxAmountState.value)
  }

  const handleGoToLatest = () => {
    goToLatestMia(maxAmountState.value)
  }

  useEffect(() => {
    selectedLabelState.set({ value: undefined, color: '' })
  }, [proposedLabel, labels])

  useEffect(() => {
    if (!proposedLabel) return
    if (!newProposedLbl) return

    handleAddLabel(labels.find((value) => value.id === proposedLabel))
    setNewProposedLbl(false)
  }, [miaAnnos.images])

  const renderSelectedLabel = () => {
    if (selectedLabelState.value) {
      return (
        <TagLabel
          label={selectedLabelState.value.labelProps?.label}
          color={selectedLabelState.value.color}
        />
      )
    }
  }

  return (
    <CRow
      className="align-items-center"
      style={{
        padding: '0px 0px 25px 0px',
      }}
    >
      <CCol xs="4" sm="4" lg="4" className="d-flex justify-content-center">
        {/* TODO: INCLUDE JUNK BUTTON!!! */}
        <CButtonGroup>
          <CoreIconButton
            onClick={zoomIn}
            color="primary"
            icon={faSearchPlus}
            isOutline={true}
            toolTip="Zoom In"
          />
          <CoreIconButton
            onClick={zoomOut}
            color="primary"
            icon={faSearchMinus}
            isOutline={true}
            toolTip="Zoom Out"
          />
          {/* <CoreIconButton
              onClick={this.handleJunking}
              color="primary"
              icon={faBan}
              text=""
              isOutline={true}
              toolTip="Junk selected Images"
            /> */}
          <CoreIconButton
            onClick={handleReverse}
            color="primary"
            icon={faArrowsAltH}
            toolTip="Reverse Selection"
            isOutline={true}
          />
          <CoreIconButton
            onClick={handlePermaReverse}
            color={'primary'}
            icon={permaReverseState.value ? faLock : faLockOpen}
            toolTip="Reverse Selection Mode"
            isOutline={!permaReverseState.value}
          />
          <CDropdown>
            <CDropdownToggle color="primary" variant="outline" caret>
              Amount
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={handleMaxAmount}>1</CDropdownItem>
              <CDropdownItem onClick={handleMaxAmount}>5</CDropdownItem>
              <CDropdownItem onClick={handleMaxAmount}>10</CDropdownItem>
              <CDropdownItem onClick={handleMaxAmount}>20</CDropdownItem>
              <CDropdownItem onClick={handleMaxAmount}>50</CDropdownItem>
              <CDropdownItem onClick={handleMaxAmount}>100</CDropdownItem>
              <CDropdownItem onClick={handleMaxAmount}>150</CDropdownItem>
              <CDropdownItem onClick={handleMaxAmount}>200</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CButtonGroup>
      </CCol>
      <CCol xs="4" sm="4" lg="4">
        <CButtonGroup style={{ zIndex: 5 }}>
          <CoreIconButton icon={faTag} isOutline={false} />
          <CInputGroup>
            <CFormSelect
              style={selectStyle}
              value={selectedLblIdStr}
              onChange={handleLabelChange}
            >
              <option value="">Select label...</option>
              {labels.map((label) => (
                <option key={label.id} value={label.id}>
                  {label.label}
                </option>
              ))}
            </CFormSelect>
            {renderSelectedLabel()}
          </CInputGroup>
        </CButtonGroup>
      </CCol>
      <CCol xs="1" sm="1" lg="1" className="d-flex justify-content-start">
        <CButtonGroup>
          <CoreIconButton
            icon={faAngleDoubleLeft}
            isOutline={true}
            disabled={!hasPrev}
            color="primary"
            onClick={handleGoToFirst}
            toolTip="Go to first images"
          />
          <CoreIconButton
            icon={faArrowLeft}
            isOutline={true}
            disabled={!hasPrev}
            color="primary"
            onClick={handleUndo}
            toolTip="Undo last Label Selection"
          />
          <CoreIconButton
            icon={faArrowRight}
            isOutline={true}
            disabled={
              anySelected && !!selectedLabelState.value?.label && miaAnnos.images.length
                ? false
                : true
            }
            color="primary"
            onClick={handleSubmit}
            toolTip="Give Images selected Label"
          />
          <CoreIconButton
            icon={faAngleDoubleRight}
            isOutline={true}
            disabled={isLatest}
            color="primary"
            onClick={handleGoToLatest}
            toolTip="Go to latest images"
          />
        </CButtonGroup>
      </CCol>
    </CRow>
  )
}

export default Control
