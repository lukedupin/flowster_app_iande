from flowster.tools.script_agent import ScriptState

sandler_convo = {
    "default": "bonding_and_rapport",
    "bonding_and_rapport": {
        "directives": {
            "prospect_name": (
                "Introduce yourself naturally and ask the prospect how they're doing. "
                "Establish a human connection before any business talk."
            ),
            "company": (
                "Reference something contextual — their industry, company, or how they found you. "
                "Show you've done minimal homework and aren't treating this as a cold spray-and-pray call."
            ),
            "initial_tone": (
                "Be disarmingly honest that you don't know yet if there's a fit. "
                "Lower the prospect's guard by removing sales pressure early."
            )
        },
        "prompts": [
            {
                "name": "intro",
                "prompt": (
                    "Hey [Name], thanks for making time today. I'll be upfront — "
                    "I don't know yet if what we do is even a fit for you. My goal is "
                    "just to figure that out together. That work for you?"
                ),
                "eval": ScriptState.is_first,
                "action": None
            },
            {
                "name": "warm_reentry",
                "prompt": (
                    "Good to reconnect, [Name]. Last time we spoke you mentioned [X] — "
                    "curious if anything has changed on that front."
                ),
                "eval": ScriptState.is_returning_contact,
                "action": None
            }
        ],
        "transitions": [
            {
                "condition": "Prospect responds positively and seems open to continue",
                "when": ScriptState.prospect_name,
                "next_section": "upfront_contract"
            },
            {
                "condition": "Prospect seems cold or rushed",
                "when": ScriptState.initial_tone,
                "next_section": "upfront_contract",
                "note": "Move faster to the contract to respect their time and re-establish control."
            }
        ],
        "data": {
            "global.prospect_name": "Highest priority: Full name of the prospect",
            "global.company": "Prospect's company or organization",
            "referral_source": "How or why this call was initiated",
            "initial_tone": "Prospect's initial energy — warm, neutral, cold, rushed"
        }
    },

    "upfront_contract": {
        "directives": {
            "agenda_accepted": (
                "Propose a clear agenda for the conversation and ask for agreement. "
                "Establishes mutual respect and prevents the conversation from going sideways. "
                "Explicitly give the prospect permission to say no at the end. "
                "Removes fear of commitment and makes them more honest throughout."
            ),
            "time_agreed": (
                "State roughly how long this will take. Respects the prospect's time "
                "and sets a contained, professional tone."
            )
        },
        "prompts": [
            {
                "name": "contract_open",
                "prompt": (
                    "Hey {Global_ProspectName},",
                    "Here's what I'd suggest — I'll ask you some questions about what's "
                    "going on in your world, you do the same to me, and at the end we "
                    "both decide honestly if there's a reason to keep talking. If there's "
                    "not, totally fine. This should take about 20–30 minutes. Does that work?"
                ),
                "eval": ScriptState.is_first,
                "action": None
            },
            {
                "name": "contract_confirm",
                "prompt": (
                    "So just to confirm — at the end of this, if it doesn't make sense, "
                    "you'll tell me straight and I'll do the same. Fair?"
                ),
                "eval": ScriptState.needs_reconfirm,
                "action": None
            }
        ],
        "transitions": [
            {
                "condition": "Prospect agrees to the agenda and mutual opt-out",
                "when": ScriptState.agenda_accepted,
                "next_section": "pain"
            },
            {
                "condition": "Prospect pushes back or wants to hear the pitch first",
                "when": ScriptState.prospect_objective,
                "next_section": "pain",
                "note": (
                    "Acknowledge their preference briefly, then redirect: "
                    "'Totally fair — let me ask just a couple quick questions first "
                    "so I'm not wasting your time with the wrong pitch.'"
                )
            }
        ],
        "data": {
            "time_agreed": "Agreed duration of the call",
            "agenda_accepted": "Boolean — did the prospect accept the mutual structure",
            "prospect_objective": "Any goal the prospect stated they want from this conversation"
        }
    },

    "pain": {
        "directives": {
            "surface_pain": (
                "Start with what prompted them to take this call or explore a solution now. "
                "Surfaces the triggering event, which reveals urgency and priority level."
            ),
            "emotional_impact": (
                "Peel back surface problems to find emotional and business impact. "
                "Sandler's 3-level pain model: surface issue → personal/emotional cost → "
                "business/financial impact. Ask how long they've lived with the problem "
                "and what they've already tried. Establishes pain duration and rules out "
                "easy fixes, deepening commitment to solving it."
            ),
            "cost_of_inaction": (
                "Ask what happens if nothing changes. "
                "Forces the prospect to articulate the cost of inaction — the most powerful motivator."
            ),
            "priority_score": (
                "Ask them to rate the priority of solving this on a scale of 1–10. "
                "A score below 7 means they're not a real prospect right now. Qualify or disqualify early."
            )
        },
        "prompts": [
            {
                "name": "pain_opener",
                "prompt": "What made you open to having this conversation today?",
                "eval": ScriptState.is_first,
                "action": None
            },
            {
                "name": "pain_low_priority",
                "prompt": (
                    "Sounds like it's not a burning priority right now — that's totally fine. "
                    "Would it make more sense to reconnect in [timeframe] when this moves up the list?"
                ),
                "eval": ScriptState.priority_score_low,
                "action": "ScriptState.schedule_followup"
            },
            {
                "name": "pain_summary",
                "prompt": (
                    "So if I'm hearing you right — [summarize pain in their words]. "
                    "Is that the core of it, or is there more underneath?"
                ),
                "eval": ScriptState.pain_collected,
                "action": None
            }
        ],
        "transitions": [
            {
                "condition": (
                    "Prospect has articulated clear pain with emotional and business impact "
                    "and rated priority 7 or above"
                ),
                "when": ScriptState.priority_score,
                "next_section": "budget"
            },
            {
                "condition": (
                    "Prospect rates priority below 7 or can't articulate real pain"
                ),
                "when": ScriptState.cost_of_inaction,
                "next_section": "exit",
                "note": (
                    "Don't force it. Offer a graceful follow-up touchpoint."
                )
            }
        ],
        "data": {
            "surface_pain": "The problem as the prospect first described it",
            "emotional_impact": "How this problem personally affects the prospect",
            "business_impact": "The financial or operational cost of the problem",
            "duration": "How long they've had this problem",
            "prior_attempts": "What they've already tried to solve it",
            "cost_of_inaction": "What happens if nothing changes",
            "priority_score": "1–10 rating of how urgent solving this is"
        }
    },

    "budget": {
        "directives": {
            "budget_allocated": (
                "Introduce the topic of investment early and without apology. "
                "Sandler principle: money conversations belong in the middle, not at the end. "
                "Ask whether a budget has been allocated or whether that's still being figured out. "
                "Reveals whether this is a real buying cycle or exploratory shopping."
            ),
            "budget_range": (
                "Anchor with a range rather than a single number. "
                "A range is less threatening and lets you gauge their reaction before quoting a "
                "specific price."
            ),
            "financial_objections": (
                "If they push back on price, revisit the pain — not the features. "
                "Budget objections are usually pain objections in disguise. "
                "Don't defend price; re-anchor to cost of inaction."
            )
        },
        "prompts": [
            {
                "name": "budget_range_intro",
                "prompt": (
                    "People typically invest somewhere between $X and $Y to solve a problem like this. "
                    "Is that in the range you've been thinking, or does that feel way off?"
                ),
                "eval": ScriptState.budget_not_discussed,
                "action": None
            },
            {
                "name": "budget_not_set",
                "prompt": (
                    "No worries if it's not locked in yet — is there a ballpark you'd be comfortable working within, even roughly?"
                ),
                "eval": ScriptState.no_budget_allocated,
                "action": None
            },
            {
                "name": "budget_objection",
                "prompt": (
                    "I hear you on the number. Can I ask — if we could show this pays for itself within [timeframe] "
                    "based on what you described earlier with [pain point], would that change the conversation?"
                ),
                "eval": ScriptState.price_objection_raised,
                "action": None
            }
        ],
        "transitions": [
            {
                "condition": (
                    "Prospect confirms budget is in range or expresses willingness to allocate"
                ),
                "when": ScriptState.budget_range,
                "next_section": "decision"
            },
            {
                "condition": (
                    "Prospect has no budget and no path to one"
                ),
                "when": ScriptState.budget_allocated,
                "next_section": "exit"
            }
        ],
        "data": {
            "budget_range": "The range the prospect acknowledged as plausible",
            "budget_allocated": "Boolean — has a budget already been set aside",
            "budget_owner": "Who controls the budget",
            "financial_objections": "Any price concerns raised and how they were addressed"
        }
    },

    "decision": {
        "directives": {
            "decision_process": (
                "Ask the prospect to walk you through how decisions like this get made at their company. "
                "Maps the buying process so there are no surprise blockers at the end."
            ),
            "stakeholders": (
                "Identify all stakeholders who will influence or veto the decision. "
                "Multi-stakeholder deals die when you only sell to one person."
            ),
            "decision_criteria": (
                "Clarify what criteria or conditions would need to be true for them to move forward. "
                "Surfaces hidden objections and tells you exactly what your proposal needs to address."
            ),
            "timeline": (
                "Establish a realistic timeline for their decision. "
                "Prevents endless follow-up cycles and helps you prioritize your pipeline."
            )
        },
        "prompts": [
            {
                "name": "decision_process",
                "prompt": "Walk me through how a decision like this typically gets made on your end.",
                "eval": ScriptState.decision_not_mapped,
                "action": None
            },
            {
                "name": "stakeholders",
                "prompt": "Besides yourself, who else would need to weigh in or sign off on something like this?",
                "eval": ScriptState.stakeholders_unknown,
                "action": None
            },
            {
                "name": "decision_criteria",
                "prompt": "What would need to be true — about us, the solution, the timeline — for you to feel confident moving forward?",
                "eval": ScriptState.criteria_not_stated,
                "action": None
            },
            {
                "name": "timeline",
                "prompt": "Is there a timeframe you're working toward, or is this more open-ended right now?",
                "eval": ScriptState.timeline_unknown,
                "action": None
            }
        ],
        "transitions": [
            {
                "condition": (
                    "Decision process, stakeholders, criteria, and timeline are all mapped"
                ),
                "when": ScriptState.decision_criteria,
                "next_section": "fulfillment"
            },
            {
                "condition": (
                    "Prospect is the sole decision maker with clear criteria and timeline"
                ),
                "when": ScriptState.decision_maker,
                "next_section": "fulfillment"
            }
        ],
        "data": {
            "decision_maker": "Primary person who makes the final call",
            "stakeholders": "List of others who influence or veto the decision",
            "decision_process": "How decisions of this type are made at their organization",
            "decision_criteria": "What conditions must be met to move forward",
            "timeline": "Timeframe for making a decision"
        }
    },

    "fulfillment": {
        "directives": {
            "solution_presented": (
                "Present the solution only after all prior sections are qualified. "
                "In Sandler, you never pitch until you've confirmed pain, budget, and decision process. "
                "Don't over-present. Say less than you know."
            ),
            "pain_addressed": (
                "Tie every feature or capability back to a specific pain the prospect stated. "
                "Generic pitches don't land. Mirror their exact language and problems."
            ),
            "prospect_reaction": (
                "Ask after each key point whether it connects to what they described. "
                "Keeps the prospect engaged and co-creating the solution rather than passively listening."
            )
        },
        "prompts": [
            {
                "name": "solution_bridge",
                "prompt": (
                    "Based on everything you've shared — especially [specific pain point] — here's where I think we can genuinely help. "
                    "[Present solution.] Does that connect to what you described earlier?"
                ),
                "eval": ScriptState.all_sections_qualified,
                "action": None
            },
            {
                "name": "relevance_check",
                "prompt": "Is this landing the way I'm describing it, or am I missing something about your situation?",
                "eval": ScriptState.mid_fulfillment,
                "action": None
            },
            {
                "name": "not_yet_qualified",
                "prompt": (
                    "Before I get into what we do, I want to make sure I'm showing you the right thing — "
                    "can I ask a couple more questions?"
                ),
                "eval": ScriptState.fulfillment_attempted_early,
                "action": "ScriptState.redirect_to_pain"
            }
        ],
        "transitions": [
            {
                "condition": (
                    "Prospect confirms the solution addresses their pain and expresses interest in next steps"
                ),
                "when": ScriptState.prospect_reaction,
                "next_section": "post_sell"
            },
            {
                "condition": (
                    "Prospect raises new objections or pain not previously discussed"
                ),
                "when": ScriptState.objections_raised,
                "next_section": "pain",
                "note": (
                    "Loop back to pain before continuing. Don't push forward with unresolved objections."
                )
            }
        ],
        "data": {
            "solution_presented": "Summary of the solution or offer presented",
            "pain_addressed": "Which specific pains were tied back to in the presentation",
            "prospect_reaction": "Prospect's response to the presentation — positive, skeptical, confused",
            "objections_raised": "Any new objections surfaced during fulfillment"
        }
    },

    "post_sell": {
        "directives": {
            "doubts_raised": (
                "Proactively surface any lingering doubts before ending the conversation. "
                "Buyer's remorse kills deals after the call. Surface it now while you can address it."
            ),
            "confidence_blockers": (
                "Ask what would make them feel completely confident moving forward. "
                "Gives the prospect space to voice hesitation and you the chance to resolve it."
            ),
            "next_step": (
                "Lock in a specific next step with a date and owner. "
                "Vague next steps kill momentum. 'I'll follow up soon' is not a next step."
            ),
            "deal_status": (
                "Do not over-celebrate or show excessive relief. "
                "Sandler principle: maintain equal business stature. "
                "Desperation and excitement both signal weakness."
            )
        },
        "prompts": [
            {
                "name": "post_sell_check",
                "prompt": (
                    "Before we wrap — any part of you that's second-guessing this, or anything that still feels unresolved?"
                ),
                "eval": ScriptState.deal_verbally_agreed,
                "action": None
            },
            {
                "name": "confidence_check",
                "prompt": "What would make you feel totally solid about moving forward?",
                "eval": ScriptState.prospect_hesitant,
                "action": None
            },
            {
                "name": "next_step_close",
                "prompt": (
                    "Let's lock in a next step so this doesn't fall through the cracks — "
                    "what does your calendar look like [this week / next week]?"
                ),
                "eval": ScriptState.no_next_step_set,
                "action": "ScriptState.schedule_next_step"
            },
            {
                "name": "exit_graceful",
                "prompt": (
                    "I appreciate your time and honesty today. Based on what we covered, I don't think the timing is right — "
                    "but let's stay in touch. Mind if I check back in [timeframe]?"
                ),
                "eval": ScriptState.deal_not_progressing,
                "action": "ScriptState.mark_nurture"
            }
        ],
        "transitions": [
            {
                "condition": (
                    "Prospect has no outstanding doubts and a next step is confirmed"
                ),
                "when": ScriptState.next_step,
                "next_section": "exit"
            },
            {
                "condition": (
                    "Prospect raises a doubt that re-opens a prior topic"
                ),
                "when": ScriptState.doubts_raised,
                "next_section": "pain",
                "note": (
                    "Don't panic. Loop back calmly — late objections are usually budget or decision process issues in disguise."
                )
            }
        ],
        "data": {
            "doubts_raised": "Any hesitations or second thoughts the prospect voiced",
            "confidence_blockers": "What the prospect said they'd need to feel fully committed",
            "next_step": "Agreed next action — demo, proposal, intro call with stakeholder, etc.",
            "next_step_date": "Date and time of the agreed next step",
            "deal_status": "Current status — advanced, nurture, disqualified"
        }
    }
}
