import { useContext } from 'react'
import { LostConfigContext } from '../contexts/LostConfigContext'

export const useLostConfig = () => {
    const context = useContext(LostConfigContext)
    if (!context) {
        throw new Error('useLostConfig must be used within a LostConfigProvider')
    }
    return context
}
