import { CSpinner } from '@coreui/react'

export const CenteredSpinner = () => {
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
            <CSpinner color="primary" />
        </div>
    )
}
