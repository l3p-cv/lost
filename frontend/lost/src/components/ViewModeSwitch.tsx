import { useTranslation } from 'react-i18next'
import { CButton, CButtonGroup, CTooltip } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faTableCells } from '@fortawesome/free-solid-svg-icons'

export type ReviewViewMode = 'sia' | 'ria'

type ViewModeSwitchProps = {
  value: ReviewViewMode
  onChange: (mode: ReviewViewMode) => void
}

// joined Image|Grid switch — used in the annotask and dataset review toolbars
// (direct CButton children so CoreUI's .btn-group joining rules apply)
const ViewModeSwitch = ({ value, onChange }: ViewModeSwitchProps) => {
  const { t } = useTranslation()

  return (
    <CButtonGroup>
      <CTooltip content={t('review.imageView')}>
        <CButton
          color={value === 'sia' ? 'primary' : 'secondary'}
          variant={value !== 'sia' ? 'outline' : undefined}
          onClick={() => {
            if (value !== 'sia') onChange('sia')
          }}
        >
          <FontAwesomeIcon icon={faImage} size="1x" />
        </CButton>
      </CTooltip>
      <CTooltip content={t('review.gridView')}>
        <CButton
          color={value === 'ria' ? 'primary' : 'secondary'}
          variant={value !== 'ria' ? 'outline' : undefined}
          onClick={() => {
            if (value !== 'ria') onChange('ria')
          }}
        >
          <FontAwesomeIcon icon={faTableCells} size="1x" />
        </CButton>
      </CTooltip>
    </CButtonGroup>
  )
}

export default ViewModeSwitch
