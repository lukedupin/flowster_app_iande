export const INITIAL_CONTEXTS = [
    {
        id: 1,
        title: 'Company Overview',
        key: 'company_overview',
        content: '# Company Overview\n\nInsurance and Estates helps clients navigate **life insurance** and **estate planning** decisions.\n\n- Founded in 2015\n- Licensed in all 50 states\n- Specializes in term, whole, and final expense policies',
        url: 'https://www.insuranceandestates.com/about',
    },
    {
        id: 2,
        title: 'Product FAQ',
        key: 'product_faq',
        content: '## Frequently Asked Questions\n\n**What is the difference between term and whole life?**\n\nTerm life covers a set number of years. Whole life covers you for life and builds cash value.',
        url: '',
    },
    {
        id: 3,
        title: 'Pricing Sheet',
        key: 'pricing_sheet',
        content: '## Pricing\n\n| Plan | Monthly |\n| --- | --- |\n| Term 20yr | $25 |\n| Whole Life | $80 |',
        url: '',
    },
]

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
