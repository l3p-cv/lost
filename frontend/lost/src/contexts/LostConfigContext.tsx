import { createContext, useState } from 'react'
import { useQuery } from 'react-query'
import { httpClient } from '../actions/http-client'

interface Settings {
    autoLogoutWarnTime: number
    autoLogoutTime: number
    isDevMode: boolean
}

interface LostConfigContextType {
    settings: Settings
    version: string
    jupyterLabUrl: string
    refetchJupyterLabUrl: () => void
    roles: string[]
    setRoles: (roles: string[]) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const LostConfigContext = createContext<LostConfigContextType | null>(null)

// NOTE: Put only data which doesn't need to be updated frequently! (e.g. settings, version)
// so that it doesn't trigger unnecessary re-renders

export const LostConfigProvider = ({ children }) => {
    const [roles, setRoles] = useState<string[]>([])

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: () => {
            return httpClient.get<Settings>(`/system/settings`)
        },
        initialData: {
            autoLogoutWarnTime: 300,
            autoLogoutTime: 3600,
            isDevMode: true,
        },
    })

    const { data: version } = useQuery({
        queryKey: ['version'],
        queryFn: () => {
            return httpClient.get<string>(`/system/version`)
        },
        initialData: '',
    })

    // Note: This requires jwt hence it is not enabled by default
    const { data: jupyterLabUrl, refetch: refetchJupyterLabUrl } = useQuery({
        queryKey: ['jupyterLabUrl'],
        queryFn: () => {
            return httpClient.get<string>(`/system/jupyter`)
        },
        initialData: '',
        enabled: false,
    })

    return (
        <LostConfigContext.Provider
            value={{
                // @ts-expect-error - since initial data is provided, the value will not be undefined
                settings,
                // @ts-expect-error - since initial data is provided, the value will not be undefined
                version,
                // @ts-expect-error - since initial data is provided, the value will not be undefined
                jupyterLabUrl,
                refetchJupyterLabUrl,
                roles,
                setRoles,
            }}
        >
            {children}
        </LostConfigContext.Provider>
    )
}
