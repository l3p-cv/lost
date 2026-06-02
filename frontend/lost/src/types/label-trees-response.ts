export interface LabelTreesResponse {
  idx: number
  name: string
  abbreviation: string
  description: null | string
  timestamp: null
  external_id: null | string
  is_deleted: boolean | null
  parent_leaf_id: number | null
  is_root: boolean | null
  group_id: number | null
  color: null | string
  children: LabelTreesResponse[]
}
