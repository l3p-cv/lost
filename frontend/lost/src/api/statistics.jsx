import axios from 'axios'
import { API_URL } from '../lost_settings'
import { useQuery } from 'react-query'

export const usePersonalStatistics = () => {
  return useQuery('personalStatistics', () =>
    axios.get(`${API_URL}/statistics/personal`).then((res) => res.data),
  )
}

export const useDesignerStatistics = () => {
  return useQuery('designerStatistics', () =>
    axios.get(`${API_URL}/statistics/designer`).then((res) => res.data),
  )
}
