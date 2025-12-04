export interface AvailableDatasetExportsResponse {
  exports: Export[]
}

export interface Export {
  datasetId: number
  filePath: string
  id: number
  progress: number
}
