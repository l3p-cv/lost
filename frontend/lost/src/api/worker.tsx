import { useQuery } from 'react-query'
import { httpClient } from './http_client'

export const useWorkers = () => {
  return useQuery({
    queryKey: ['workers'],
    queryFn: () => {
      return httpClient.get('/worker')
    },
    // refetchInterval: 5000,
  })
}
