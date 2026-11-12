// Static placeholder detail for the managed lead command center.
//
// outcome is 'success' or 'failed'. `at` is a local date and time. `from` says what reached out: the drip
// it belongs to (null for something an agent did by hand), the funnel, and the touch point inside it.
// Leads without an entry here get a short generic history from getLeadDetail so every card opens something.

const s = (drip, funnel, touch) => ({drip, funnel, touch})
const i = (type, at, outcome, summary, text, reason, from) => ({type, at, outcome, summary, text, reason, from})

export const LEAD_DETAILS = {
    1: {
        email: 'd.okafor@example.com',
        phone: '(206) 555-0142',
        location: 'Seattle, WA',
        employer: 'Northwind Labs (co-founder)',
        household: 'Married, 1 child (2)',
        source: 'LinkedIn reach out',
        managed_since: '2026-10-30',
        preferred: 'Email, then call',
        best_time: 'Weekdays after 4pm',
        coverage: '$1.5M 20-year term + key-person policy',
        premium: '$118 / month (term), key-person quote pending',
        interactions: [
            i('Email', '2026-10-28T09:12', 'success', 'Sent LinkedIn connection message', 'Hi David, I saw your post about starting a business. Many founders overlook key-person coverage, happy to share a short guide if useful.', undefined, s(null, 'Term Life', 'LinkedIn cold outreach')),
            i('Comment', '2026-10-29T13:40', 'success', 'Replied on LinkedIn', 'Sure, send it over. We just closed our seed round so this is timely.', undefined, s(null, 'Term Life', 'LinkedIn reply')),
            i('Drip', '2026-10-30T08:00', 'success', 'Enrolled in Founders Series drip', undefined, undefined, s('Founders Series', 'Term Life', 'Enrollment')),
            i('Email', '2026-10-31T10:05', 'failed', 'Sent: "Key-person coverage, explained"', undefined, 'Bounced: mailbox full, resent next day', s('Founders Series', 'Term Life', 'Step 1 of 4, email')),
            i('Email', '2026-11-01T10:20', 'success', 'Resent: "Key-person coverage, explained"', 'Resent from our second address in case the first was caught by a filter.', undefined, s('Founders Series', 'Term Life', 'Step 1 of 4, email resend')),
            i('Click', '2026-11-02T19:48', 'success', 'Clicked quote calculator', undefined, undefined, s('Founders Series', 'Term Life', 'Quote calculator link in step 1')),
            i('Call', '2026-11-04T16:10', 'failed', 'Outbound call', undefined, 'No answer, voicemail left', s(null, 'Term Life', 'Agent call')),
            i('Call', '2026-11-06T17:02', 'success', 'Discovery call, 18 min', 'Wants $1.5M 20-year term plus key-person policy for co-founder. Follow-up scheduled Friday.', undefined, s(null, 'Term Life', 'Agent call')),
            i('Text', '2026-11-09T07:45', 'success', 'Sent text reminder', 'Hi David, just confirming our call Friday at 4:30. Reply here to move it.', undefined, s(null, 'Term Life', 'Call reminder text')),
        ],
        summary: {
            text: 'David is a first-time founder who just closed his seed round and is moving fast. He answers email within a day, prefers short messages, and warmed up after the key-person guide. Price matters, but he opens the quote calculator more often than he replies, so he is comparing options quietly. His toddler turned two last month and he mentions being up at 5am with her.',
            action: 'Hold the Friday 4:30 call and bring a written key-person quote so he can decide on the spot.',
            bring_up: [
                'The seed round: congratulate him before any pitch',
                'His co-founder Priya as a second key-person policy',
                'His daughter\'s second birthday, he lit up about it last call',
                'Keep it under 20 minutes, he is short on time',
            ],
        },
        notes: [
            {at: '2026-11-06T17:25', author: 'You', text: 'Co-founder (Priya S.) is also a prospect for the key-person policy. Ask for an intro on Friday.'},
            {at: '2026-11-02T20:00', author: 'AI', text: 'Opened the quote calculator twice in a week. Price sensitive but serious.'},
        ],
    },
    4: {
        email: 'marcus.reed@example.com',
        phone: '(512) 555-0188',
        location: 'Austin, TX',
        employer: 'Brightside Software',
        household: 'Married, 2 kids',
        source: 'YouTube comment',
        managed_since: '2026-09-18',
        preferred: 'Email',
        best_time: 'Evenings',
        coverage: '$750K 30-year term',
        premium: '$64 / month',
        interactions: [
            i('Comment', '2026-09-12T21:14', 'success', 'Commented on "Term vs Whole Life"', 'Is term really cheaper long run? I\'m 34 with two kids and can\'t tell which one makes sense.', undefined, s(null, 'Term Life', 'YouTube comment on "Term vs Whole Life"')),
            i('Comment', '2026-09-13T09:30', 'success', 'We replied on YouTube', undefined, undefined, s(null, 'Term Life', 'YouTube reply')),
            i('Email', '2026-09-13T09:40', 'success', 'Sent: "Quick answer to your question"', undefined, undefined, s(null, 'Term Life', 'Follow-up email to comment')),
            i('Drip', '2026-09-15T08:00', 'success', 'Term Life drip, step 1 of 5 sent', undefined, undefined, s('Term Life Drip', 'Term Life', 'Step 1 of 5, email')),
            i('Call', '2026-09-17T18:20', 'success', 'Onboarding call, 24 min', 'Went with 30-year term. Medical exam scheduled for the 25th.', undefined, s(null, 'Term Life', 'Agent onboarding call')),
            i('Email', '2026-10-02T10:00', 'failed', 'Sent: "Your exam results"', undefined, 'Opened but no reply after 2 follow-ups', s(null, 'Term Life', 'Agent email')),
            i('Text', '2026-10-09T12:10', 'success', 'Text: exam results are in', 'Approved at standard rates, details by email.', undefined, s(null, 'Term Life', 'Agent text')),
            i('Drip', '2026-11-05T08:00', 'success', 'Beneficiary Update drip, step 1 of 3 sent', undefined, undefined, s('Beneficiary Update', 'Term Life', 'Step 1 of 3, email')),
        ],
        summary: {
            text: 'Marcus is a steady, family-first buyer who researches everything before committing. He just got promoted to senior engineer, which bumped his income and his coverage needs. His two daughters both play travel softball, so weekends and evenings are packed and he only answers messages late. He responds best to text and short emails, and has been quiet since his exam results came back.',
            action: 'Text him a congratulations on the promotion and offer a 10-minute call to raise his coverage.',
            bring_up: [
                'His promotion to senior engineer',
                'His daughters\' softball season, ask how the tournament went',
                'Raising coverage from $750K to match the new salary',
                'Naming Dana primary and the kids contingent on the beneficiary form',
            ],
        },
        notes: [
            {at: '2026-09-17T18:50', author: 'You', text: 'Wife is Dana. Wants her as primary beneficiary and the kids contingent.'},
        ],
    },
    8: {
        email: 'elena.park@example.com',
        phone: '(415) 555-0119',
        location: 'Oakland, CA',
        employer: 'Oakland Unified School District',
        household: 'Divorced, 1 adult child',
        source: 'YouTube community post',
        managed_since: '2026-10-05',
        preferred: 'Direct message',
        best_time: 'Weekends',
        coverage: 'Estate plan with revocable trust',
        premium: 'n/a, attorney referral pending',
        interactions: [
            i('Like', '2026-11-01T20:15', 'success', 'Liked community post "Estate taxes in 2026"', undefined, undefined, s(null, 'Estate Planning', 'YouTube community post')),
            i('Comment', '2026-11-01T20:19', 'success', 'Commented on community post', 'Does this apply if the house is already in a trust?', undefined, s(null, 'Estate Planning', 'YouTube community post')),
            i('Email', '2026-11-03T09:00', 'success', 'Sent: "Your estate planning checklist"', 'Hi Elena, attached is the checklist we mentioned. Trusts change a few of the items, which I\'ve highlighted in yellow.', undefined, s('Estate Checklist', 'Estate Planning', 'Step 1 of 5, email')),
            i('Click', '2026-11-04T21:30', 'success', 'Clicked checklist link in email', undefined, undefined, s('Estate Checklist', 'Estate Planning', 'Checklist link in step 1')),
            i('Call', '2026-11-05T17:30', 'failed', 'Outbound call', undefined, 'Declined: "I\'m at work, text me"', s(null, 'Estate Planning', 'Agent call')),
            i('Text', '2026-11-05T17:34', 'success', 'Sent text with two time options', undefined, undefined, s(null, 'Estate Planning', 'Agent text')),
            i('Drip', '2026-11-07T08:00', 'success', 'Estate Planning drip, step 2 of 5 sent', 'Subject: What most people miss about beneficiaries', undefined, s('Estate Checklist', 'Estate Planning', 'Step 2 of 5, email')),
        ],
        summary: {
            text: 'Elena is a careful, trust-minded planner who wants to protect what she has for her grown son. She teaches full time, so calls during school hours go nowhere, but she answers texts and engages most on weekends. Her questions are about trusts rather than policies, and her follow-up is now overdue. Her first grandchild is due in the spring and it is clearly on her mind.',
            action: 'Text her today with two weekend time slots and the attorney referral she has been waiting on.',
            bring_up: [
                'The grandchild due in spring and what she wants in place before then',
                'How her house sits in the trust and what still goes through probate',
                'Her class: she mentioned a field trip last week',
                'Apologize for the delay, then be brief',
            ],
        },
        notes: [
            {at: '2026-11-05T17:40', author: 'You', text: 'Prefers text over calls during school hours. Follow-up is overdue, send the attorney intro.'},
            {at: '2026-11-03T09:10', author: 'AI', text: 'Trust-related questions came up twice. Likely needs the attorney referral more than a policy.'},
        ],
    },
    11: {
        email: 'priya.n@example.com',
        phone: '(312) 555-0167',
        location: 'Chicago, IL',
        employer: 'Northwestern Memorial Hospital',
        household: 'Single',
        source: 'Instagram reel',
        managed_since: '2026-08-20',
        preferred: 'Email',
        best_time: 'Mornings',
        coverage: '$500K 20-year term',
        premium: '$41 / month',
        interactions: [
            i('Like', '2026-08-14T22:05', 'success', 'Liked our reel "3 myths about life insurance"', undefined, undefined, s(null, 'Term Life', 'Instagram reel "3 Myths"')),
            i('Email', '2026-08-15T10:00', 'success', 'Sent Instagram DM', 'Thanks for the like on our reel. If you ever want the full breakdown of those 3 myths, here is the blog post.', undefined, s(null, 'Term Life', 'Instagram DM')),
            i('Call', '2026-08-19T08:30', 'success', 'Onboarding call, 15 min', undefined, undefined, s(null, 'Term Life', 'Agent onboarding call')),
            i('Email', '2026-09-30T10:00', 'failed', 'Sent: "Policy anniversary check-in"', undefined, 'No reply', s('Annual Review', 'Term Life', 'Step 1 of 3, email')),
            i('Email', '2026-10-21T10:00', 'success', 'Sent: "Annual review invite"', 'Want to take 15 minutes to review your coverage together?', undefined, s('Annual Review', 'Term Life', 'Step 2 of 3, email')),
            i('Text', '2026-11-04T07:50', 'success', 'Review confirmed for Nov 12', 'Yes, Thursday at 8:30 works.', undefined, s('Annual Review', 'Term Life', 'Step 3 of 3, text')),
        ],
        summary: {
            text: 'Priya is organized, responds quickly to email, and shows up on time. She recently got a raise and a step up to charge nurse, so her income has changed since she bought. She lives alone and is thinking about buying a condo next year. Her review on Nov 12 is a natural place to revisit her coverage.',
            action: 'Send the review agenda by Wednesday and prepare a higher-coverage quote ahead of the Nov 12 meeting.',
            bring_up: [
                'Her promotion to charge nurse and the raise',
                'The condo she wants to buy next year',
                'Whether her parents should be listed as beneficiaries',
                'Her half marathon in the spring, she mentioned training',
            ],
        },
        notes: [
            {at: '2026-11-04T08:00', author: 'You', text: 'Got a raise recently. Mention increasing coverage at the review.'},
        ],
    },
    15: {
        email: 'carla.mendes@example.com',
        phone: '(305) 555-0103',
        location: 'Miami, FL',
        employer: 'Self-employed (catering)',
        household: 'Married, 3 kids',
        source: 'Instagram reel',
        managed_since: '2026-05-02',
        preferred: 'Text',
        best_time: 'Late mornings',
        coverage: '$400K 20-year term',
        premium: '$72 / month, last payment failed',
        interactions: [
            i('Email', '2026-05-02T11:00', 'success', 'Sent welcome email', undefined, undefined, s('Term Life Drip', 'Term Life', 'Step 1 of 5, welcome email')),
            i('Call', '2026-05-04T11:30', 'success', 'Onboarding call, 21 min', undefined, undefined, s(null, 'Term Life', 'Agent onboarding call')),
            i('Drip', '2026-06-01T08:00', 'success', 'Term Life drip completed', undefined, undefined, s('Term Life Drip', 'Term Life', 'Step 5 of 5, email')),
            i('Email', '2026-10-12T10:00', 'failed', 'Sent: "Payment did not go through"', undefined, 'No reply', s(null, 'Term Life', 'Billing notice email')),
            i('Call', '2026-10-18T11:15', 'failed', 'Outbound call', undefined, 'Number rang out, no voicemail set up', s(null, 'Term Life', 'Agent call')),
            i('Text', '2026-10-18T11:20', 'failed', 'Sent text about the missed payment', undefined, 'Delivered, no response', s(null, 'Term Life', 'Agent text')),
            i('Email', '2026-10-26T10:00', 'failed', 'Win-back email, step 1', undefined, 'Not opened', s('Win-back', 'Term Life', 'Step 1 of 4, email')),
        ],
        summary: {
            text: 'Carla runs a small catering business and is at real risk of letting her policy lapse. Her last payment failed, and four attempts across email, call and text have not reached her. Business has slowed after the summer events season, so money is likely the issue rather than disinterest. She sponsors her daughter\'s softball team, which is the one thing she has responded warmly to.',
            action: 'Skip email. Send a short personal text offering a lower-premium option before the grace period ends.',
            bring_up: [
                'Her daughter\'s softball team and the catering she did for their banquet',
                'A lower-premium plan so she keeps coverage through the slow season',
                'The grace period, and what happens to her coverage if it ends',
                'Do not lead with the missed payment',
            ],
        },
        notes: [
            {at: '2026-10-18T11:30', author: 'You', text: 'Catering season slowed down. Could offer a lower-premium option instead of letting it lapse.'},
            {at: '2026-10-26T10:05', author: 'AI', text: 'No successful contact in 4 attempts. Try a different channel or a personal message.'},
        ],
    },
    5: {
        email: 'linda.cho@example.com',
        phone: '(617) 555-0176',
        location: 'Boston, MA',
        employer: 'Cho & Rivera LLP',
        household: 'Married, no kids',
        source: 'LinkedIn reach out',
        managed_since: '2026-07-11',
        preferred: 'Email',
        best_time: 'Mornings',
        coverage: 'Estate plan, $2M umbrella',
        premium: '$210 / month',
        interactions: [
            i('Email', '2026-07-08T09:00', 'success', 'Sent LinkedIn intro message', undefined, undefined, s(null, 'Estate Planning', 'LinkedIn cold outreach')),
            i('Comment', '2026-07-08T15:20', 'success', 'Replied on LinkedIn', 'Happy to talk. I handle this for clients all day, so I\'m curious how you pitch it.', undefined, s(null, 'Estate Planning', 'LinkedIn reply')),
            i('Call', '2026-07-11T09:30', 'success', 'Discovery call, 32 min', undefined, undefined, s(null, 'Estate Planning', 'Agent call')),
            i('Drip', '2026-07-14T08:00', 'success', 'Estate Checklist drip started', undefined, undefined, s('Estate Checklist', 'Estate Planning', 'Enrollment')),
            i('Meeting', '2026-08-20T10:00', 'success', 'Policy review meeting', 'Reviewed umbrella limits and beneficiary designations.', undefined, s(null, 'Estate Planning', 'In-person meeting')),
            i('Call', '2026-11-05T10:00', 'failed', 'Outbound call', undefined, 'In court, asked to be called back', s(null, 'Estate Planning', 'Agent call')),
            i('Email', '2026-11-09T09:15', 'success', 'Sent: "Your updated estate checklist"', undefined, undefined, s('Estate Checklist', 'Estate Planning', 'Step 4 of 5, email')),
        ],
        summary: {
            text: 'Linda is an attorney who knows the subject well and values a short, precise conversation. She is also our best referral source and has sent two other attorneys. She is in court most mornings, so email works better than calls. She was recently made partner and has been traveling for a case.',
            action: 'Thank her for the referrals and send the updated checklist with a note offering to meet over coffee.',
            bring_up: [
                'Her promotion to partner at Cho & Rivera',
                'The two attorney referrals she sent over',
                'Her umbrella limits now that her income has gone up',
                'Her sailing trip in the spring',
            ],
        },
        notes: [
            {at: '2026-08-20T11:00', author: 'You', text: 'Referral source. Has sent two other attorneys our way, keep her happy.'},
        ],
    },
}

const pad = n => String(n).padStart(2, '0')

// Real detail if there is some, otherwise a short generic history built from what the card knows
export const getLeadDetail = lead => {
    const detail = LEAD_DETAILS[lead.id]
    if (detail) {
        return detail
    }

    const emailName = lead.name.toLowerCase().replace(/[^a-z ]/g, '').replace(/ +/g, '.')
    const drip = lead.campaigns[0] || null
    const funnel = lead.product

    return {
        email: `${emailName}@example.com`,
        phone: `(555) 010-${pad(lead.id)}00`,
        location: null,
        employer: null,
        household: null,
        source: 'Website',
        managed_since: '2026-09-01',
        preferred: 'Email',
        best_time: null,
        coverage: lead.product,
        premium: null,
        interactions: [
            i('Email', '2026-10-20T10:15', 'success', 'Sent welcome email', undefined, undefined, s(drip, funnel, 'Step 1, welcome email')),
            i('Call', '2026-10-27T14:30', 'failed', 'Check-in call', undefined, 'No answer, voicemail left', s(null, funnel, 'Agent call')),
            i('Drip', '2026-11-03T08:00', 'success', 'Drip step sent', undefined, undefined, s(drip, funnel, 'Step 2, email')),
        ],
        summary: {
            text: `We do not know much about ${lead.name} yet. They came in through ${lead.product.toLowerCase()} and have ${lead.interactions} recorded interactions. Add what you learn in the notes and this summary will get more specific.`,
            action: 'Reach out on their preferred channel and ask one open question about their family and plans.',
            bring_up: [
                'What prompted them to look at coverage',
                'Family and any big changes coming up',
                'Their work, and whether it changed recently',
            ],
        },
        notes: [],
    }
}
