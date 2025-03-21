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
