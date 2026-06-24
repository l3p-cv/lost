const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const expandHex = (hex: string): string => {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  return hex
}

const rgbDistance = (a: string, b: string): number => {
  const parse = (hex: string) => {
    const h = expandHex(hex)
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const [ar, ag, ab] = parse(a)
  const [br, bg, bb] = parse(b)
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2)
}

export const generateRandomColor = (existingColors: string[] = []): string => {
  let bestColor = ''
  let bestScore = -1

  for (let i = 0; i < 40; i++) {
    const h = Math.random() * 360
    const s = Math.random() * 30 + 60 // 60–90%: vivid, non-grey
    const l = Math.random() * 20 + 45 // 45–65%: mirrors backend Lab L 55–85, avoids white/black

    const candidate = hslToHex(h, s, l)

    const minDist =
      existingColors.length > 0
        ? Math.min(...existingColors.map((c) => rgbDistance(candidate, c)))
        : Infinity

    if (minDist > bestScore) {
      bestScore = minDist
      bestColor = candidate
    }
  }

  return bestColor
}

export const getContrastColor = (hex: string) => {
  hex = hex.replace(/^#/, '')

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}
