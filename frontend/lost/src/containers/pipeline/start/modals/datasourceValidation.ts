import { PipelineTemplateElement } from '../../../../types/pipelines/pipeline-template-response'

export type DatasourceFamily = 'imageFolder' | 'datasetFile' | 'unknown'

export interface DatasourceFamilyInfo {
  family: DatasourceFamily
  validExtensions: string[]
  recursive: boolean
}

interface ScriptArg {
  value: string
  help: string
}

type ScriptArgs = Record<string, ScriptArg> | null | undefined

export function parseValidImgtypes(str: string | undefined): string[] {
  if (!str) return []
  try {
    const jsonStr = str.replace(/'/g, '"')
    const parsed = JSON.parse(jsonStr)
    if (Array.isArray(parsed)) {
      return parsed
        .map((e: unknown) => String(e).toLowerCase().replace(/^\.+/, ''))
        .filter((e: string) => e.length > 0)
    }
  } catch {
    // fallback: regex for .ext tokens
    const matches = str.match(/\.(\w+)/g)
    if (matches) {
      return matches.map((m) => m.slice(1).toLowerCase())
    }
  }
  return []
}

export function parseBoolArg(str: string | undefined): boolean {
  if (!str) return false
  const lower = str.toLowerCase().trim()
  return lower === 'true' || lower === 't' || lower === 'yes'
}

export function detectDatasourceFamily(
  elements: PipelineTemplateElement[],
  nodeId: string,
  liveScriptArgs?: ScriptArgs,
): DatasourceFamilyInfo {
  const peN = parseInt(nodeId)
  const dsElement = elements.find((e) => e.peN === peN)
  if (!dsElement || !dsElement.peOut || dsElement.peOut.length === 0) {
    return { family: 'unknown', validExtensions: [], recursive: false }
  }

  const scriptPeN = dsElement.peOut[0]
  const scriptElement = elements.find((e) => e.peN === scriptPeN)
  if (!scriptElement || !scriptElement.script) {
    return { family: 'unknown', validExtensions: [], recursive: false }
  }

  const args = (liveScriptArgs ?? scriptElement.script.arguments) as ScriptArgs
  if (!args) {
    return { family: 'unknown', validExtensions: [], recursive: false }
  }

  if ('valid_imgtypes' in args && args.valid_imgtypes) {
    return {
      family: 'imageFolder',
      validExtensions: parseValidImgtypes(args.valid_imgtypes.value),
      recursive: parseBoolArg(args.recursive?.value),
    }
  }

  if ('img_path_key' in args && args.img_path_key) {
    return {
      family: 'datasetFile',
      validExtensions: ['csv', 'parquet'],
      recursive: false,
    }
  }

  return { family: 'unknown', validExtensions: [], recursive: false }
}
