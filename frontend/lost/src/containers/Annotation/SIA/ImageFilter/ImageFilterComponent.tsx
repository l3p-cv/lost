import { CCol, CFormSwitch, CRow } from '@coreui/react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './ClassicalRangeSlider.css'

type ImageFilterComponentProps = {
    filterValue: number
    isActive: boolean
    onActiveChanged: (value: boolean) => void
    onFilterValueChange: (value: number) => void
}

const ImageFilterComponent = ({
    filterValue,
    isActive,
    onActiveChanged,
    onFilterValueChange,
}: ImageFilterComponentProps) => {
    return (
        <>
            <CRow>
                <CCol xs={1}>
                    <FontAwesomeIcon icon={faGripVertical as IconProp} size="lg" />
                </CCol>
                <CCol>
                    <strong>Histogram</strong>
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
                <CCol>Clip: {filterValue}</CCol>
            </CRow>
            <CRow>
                <CCol xs={1}></CCol>
                <CCol>
                    <input
                        className="classic-range-slider"
                        type="range"
                        min={1}
                        max={40}
                        value={filterValue}
                        onChange={(e) => onFilterValueChange(parseInt(e.target.value))}
                        // onMouseUp={(e) => onFilterValueUpdated(e.target.value)}
                    />
                </CCol>
            </CRow>
        </>
    )
}

export default ImageFilterComponent
