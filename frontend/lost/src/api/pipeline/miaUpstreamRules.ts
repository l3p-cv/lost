export interface MiaUpstreamRule {
  typeLocked: boolean
  proposedLabelApplicable: boolean
}

const MIA_UPSTREAM_SCRIPT_RULES: Record<string, MiaUpstreamRule> = {
  'request_annos.py': { typeLocked: true, proposedLabelApplicable: false },
  'request_annos_again.py': { typeLocked: false, proposedLabelApplicable: true },
  'cluster_using_prev_stage.py': { typeLocked: true, proposedLabelApplicable: true },
}

const DEFAULT_RULE: MiaUpstreamRule = { typeLocked: false, proposedLabelApplicable: true }

export const resolveMiaUpstreamRule = (
  elements: { peN: number; peOut?: number[] | null; script?: { path?: string } }[] | null | undefined,
  annotaskPeN: number,
): MiaUpstreamRule => {
  if (!elements) return DEFAULT_RULE
  const upstream = elements.find((el) => el.peOut?.includes(annotaskPeN) && el.script)
  if (!upstream?.script?.path) return DEFAULT_RULE
  const basename = upstream.script.path.split('/').pop() ?? ''
  return MIA_UPSTREAM_SCRIPT_RULES[basename] ?? DEFAULT_RULE
}