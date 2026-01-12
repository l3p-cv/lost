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
  faArrowLeft,
  faArrowRight,
  faArrowsAltH,
  faSearchMinus,
  faSearchPlus,
  faTag,
} from '@fortawesome/free-solid-svg-icons'
import CoreIconButton from '../../../components/CoreIconButton'
import TagLabel from '../../../components/TagLabel'

import UndoRedo from '../../../libs/hist'
import './Tag.scss'
import { useUpdateMia, useGetSpecialMiaAnnos } from '../../../api/mia'
import { useQueryClient } from 'react-query'

// TODO: comment out, once it is typescripted
// type AnnotationState = {
//   value: MiaAnnotationChangeRequest
//   set: React.Dispatch<React.SetStateAction<MiaAnnotationChangeRequest>>
// }

const Control = ({
  zoomState,
  maxAmountState,
  labels,
  selectedLabelState,
  miaAnnos,
  imageActiveStates,
}) => {
  const selectStyle = {
    width: '250px',
    maxWidth: '250px',
    borderRadius: 0,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  }
  const hist = new UndoRedo()
  const [newProposedLbl, setNewProposedLbl] = useState(true)
  const [selectedLblIdStr, setSelectedLblIdStr] = useState('')
  const { mutate: updateMia } = useUpdateMia()
  const queryClient = useQueryClient()
  const proposedLabel = miaAnnos?.proposedLabel

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
        hist.push(updateData, 'next')
        selectedLabelState.set(undefined)
        setNewProposedLbl(true)
        setSelectedLblIdStr('')
        await queryClient.invalidateQueries(['miaAnnos'])
        await queryClient.invalidateQueries(['currentannotask'])
      },
    })

    // TODO: wrong image shown in next batch, when not F5...
  }

  const handleMaxAmount = (e) => {
    maxAmountState.set(e.target.innerText)
    selectedLabelState.set(undefined)
  }

  const handleUndo = () => {
    if (!hist.isEmpty()) {
      const cState = hist.undoMia()

      const miaIds = {
        miaIds: cState.entry.images.map((image) => {
          return image.id
        }),
      }
      console.log('MIA IDs: ', miaIds)
      useGetSpecialMiaAnnos(miaIds)
      hist.undoMia()
    }
  }

  useEffect(() => {
    selectedLabelState.set(undefined)
  }, [proposedLabel, labels])

  useEffect(() => {
    if (!proposedLabel) return
    if (!newProposedLbl) return

    console.log('selectedLabel', selectedLabelState.value)
    console.log('proposedLabel', proposedLabel)
    handleAddLabel(labels.find((value) => value.id === proposedLabel))
    setNewProposedLbl(false)
  }, [miaAnnos.images])

  const renderSelectedLabel = () => {
    if (selectedLabelState.value) {
      return (
        <TagLabel
          label={selectedLabelState.value.label}
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
        {/* TODO: INCLUDE Permanent Reverse!!! */}
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
            icon={faArrowLeft}
            isOutline={true}
            disabled={hist.isEmpty()} // TODO: wrong with current implementation!!!
            color="primary"
            onClick={handleUndo}
            toolTip="Undo last Label Selection"
          />
          <CoreIconButton
            icon={faArrowRight}
            isOutline={true}
            disabled={selectedLabelState.value && miaAnnos.images.length ? false : true}
            color="primary"
            onClick={handleSubmit}
            toolTip="Give Images selected Label"
          />
        </CButtonGroup>
      </CCol>
    </CRow>
  )
}

export default Control
