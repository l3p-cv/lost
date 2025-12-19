import { CSpinner } from '@coreui/react'

type CenteredSpinnerProps = {
  color?: string
}

export const CenteredSpinner = ({ color = 'primary' }: CenteredSpinnerProps) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <CSpinner color={color} />
    </div>
  )
}

export default CenteredSpinner
