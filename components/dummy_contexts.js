export const slugify = title => title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

export const makeUniqueKey = (title, existing) => {
    const base = slugify(title) || 'context'
    const keys = new Set(existing.map(c => c.key))

    let key = base
    let n = 2
    while (keys.has(key)) {
        key = `${base}_${n}`
        n++
    }

    return key
}
