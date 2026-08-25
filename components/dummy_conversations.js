export const STATUS = {
    bounce: {label: 'Bounce', color: 'bg-red-500'},
    named: {label: 'Have Name', color: 'bg-orange-500'},
    follow_up: {label: 'Needs Follow Up', color: 'bg-yellow-500'},
    requested_contact: {label: 'Requested Contact', color: 'bg-blue-500'},
    full_contact: {label: 'Full Contact Info', color: 'bg-green-500'},
}
const STATUS_KEYS = Object.keys(STATUS)

const NAMES = [
    'Jane Doe', 'Robert Kim', 'Maria Garcia', 'Alan Chen', 'Priya Patel',
    'Tom Wilson', 'Linda Nguyen', 'James Carter', 'Sofia Rossi', 'David Brown',
    'Emily Clark', 'Marcus Lee', 'Grace Walker', 'Noah Adams', 'Olivia Scott',
    'Ethan Turner', 'Ava Mitchell', 'Liam Foster', 'Zoe Bennett', 'Lucas Reed',
    'Chloe Bailey', 'Owen Price', 'Nina Coleman', 'Jack Murphy', 'Ella Ward',
    'Ryan Sanders', 'Mia Torres',
]

const SUMMARIES = [
    'Asked about term life premiums and wanted a follow up call next week',
    'Bounced after the first message, never responded to any follow up attempts',
    'Chatted briefly about coverage options but went quiet before sharing contact info',
    'Requested a quote for whole life insurance and shared their phone number',
    'Discussed estate planning basics and asked several questions about trusts',
    'Shared full contact info and scheduled a call with an agent',
    'Asked general questions about probate timelines, no clear next step yet',
    'Wanted pricing comparison between term and whole life policies',
    'Engaged for a few minutes then dropped off mid conversation',
    'Provided their name and asked about beneficiary designation rules',
]

const USER_LINES = [
    "Hi, I saw your ad about life insurance and had a few questions.",
    "What's the difference between term and whole life?",
    "How much coverage would you recommend for someone my age?",
    "Can you send me a quote?",
    "What documents do I need to get started?",
    "Is there a medical exam required?",
    "How long does the application process usually take?",
    "Can I add my spouse to the same policy?",
]

const ASSISTANT_LINES = [
    "Hi! Happy to help, what would you like to know?",
    "Term life covers a set number of years, whole life covers you for life and builds cash value.",
    "That depends on your income and dependents, typically 10-15x your annual income is a good starting point.",
    "Sure, I can put together a quote, can I get your date of birth and zip code?",
    "We'll just need a government ID and some basic health history.",
    "For most policies under $500k, no exam is required.",
    "Usually 1-2 weeks once we have all your information.",
    "Yes, we offer joint policies as well as individual ones for each spouse.",
]

const randomFrom = (arr, seed) => arr[seed % arr.length]

export const buildDummyConversations = () => {
    return Array.from({length: NAMES.length}, (_, idx) => ({
        id: idx + 1,
        name: NAMES[idx],
        status: randomFrom(STATUS_KEYS, idx * 3 + 1),
        summary: randomFrom(SUMMARIES, idx * 7 + 2),
        chat_count: (idx % 6) + 1,
        date: new Date(Date.now() - idx * 86400000).toLocaleDateString(),
    }))
}

export const buildDummyMessages = (convo) => {
    const pair_count = Math.min(Math.max(convo.chat_count, 2), USER_LINES.length)
    const messages = []

    for (let i = 0; i < pair_count; i++) {
        const timestamp = new Date(Date.now() - convo.id * 86400000 + i * 5 * 60000)
            .toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})

        messages.push({
            sender: 'user',
            text: randomFrom(USER_LINES, convo.id + i),
            timestamp,
        })
        messages.push({
            sender: 'assistant',
            text: randomFrom(ASSISTANT_LINES, convo.id + i),
            timestamp,
        })
    }

    return messages
}

export const initials = name => name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
