export const formatLength = len => {
    const k = len / 1000
    if (k < 10) {
        return `${k.toFixed(1)}k`
    }
    return `${Math.round(k)}k`
}
