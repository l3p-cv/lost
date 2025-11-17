import { CCol, CFormSwitch, CRow } from '@coreui/react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import RangeSlider from './RangeSlider'

const CannyFilterComponent = ({
  cannyThreshholds,
  isActive,
  onActiveChanged,
  onThreshholdChange,
}) => {
  return (
    <>
      <CRow>
        <CCol xs={1}>
          <FontAwesomeIcon icon={faGripVertical as IconProp} size="lg" />
        </CCol>
        <CCol>
          <strong>Canny Edge</strong>
        </CCol>
        <CCol xs={1}>
          <CFormSwitch
            checked={isActive}
            onChange={(e) => onActiveChanged(e.target.checked)}
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol xs={1}></CCol>
        <CCol>
          <div>Lower Threshhold: {cannyThreshholds.min}</div>
          <div>Upper Threshhold: {cannyThreshholds.max}</div>
        </CCol>
      </CRow>
      <CRow>
        <CCol xs={1}></CCol>
        <CCol>
          <RangeSlider
            min={0}
            max={255}
            step={1}
            value={cannyThreshholds}
            onChange={onThreshholdChange}
          />
        </CCol>
      </CRow>
    </>
  )
}

export default CannyFilterComponent
