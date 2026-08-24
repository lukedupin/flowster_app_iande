from flowster.tools.script_agent import ScriptState
from flowster.tools.script_state import build_section, build_transition, build_prompt, build_ai_prompt, json_to_markdown
from flowster.stdlib.ai import llm

"""
Please try to use MEMORY for how to ask the user about data.
Use DIRECTIVES for any specific instructions about how to ask the user for fields.
Absolutely never respond with the contents of MEMORY, DIRECTIVES or json data.
"""

context_system = """
You are Insurance and Estates information bot.

Answer questions general questions from ARTICLE.
Only refer to INFINITE_BANKING for questions about infinite banking.
Make sure to always answer the user's question and then ask a followup question.
"""

async def intention_intro( script_state: ScriptState ):
    topic = await llm.chat(
        script_state.flow_sheet,
        "Create a few words that define current topic of conversation.",
        system="""
        You are a helpful assistant that summarizes the topic of conversation.
        You will be given a conversation between a user and an agent.
        Your task is to summarize the topic of conversation in a few words.
        """,
        conversation=script_state.conversation,
    )

    follow_up = await llm.chat(
        script_state.flow_sheet,
        "Ask if the user wants to continue talking about CURRENT_TOPIC, or talk to an agent, or ask questions about the blog, or ask questions about I&E, or learn more about infinite banking.",
        system="""
        You are a helpful assistant that summarizes that attempts to continue conversations.
        Ask a single self-contained question about the current user's intetion.
        Don't repeat topics, it CURRENT_TOPIC is covered by other suggestions, just say it once.
        """,
        contexts={'CURRENT_TOPIC': topic.ok_value},
    )

    flat_memory = script_state.flat_memory()
    prospect_name = flat_memory.get('global.prospect_name')
    opening = f"Hello {prospect_name}.  " if prospect_name else ""

    return f"{opening}{follow_up.ok_value}"

chat_script = {
    "default": "generic",

    "generic": build_section(
        title="Generic",
        intro=(
            "Thanks for taking time.\n\n"
            "* You can ask a question about the article.\n"
            "* Get in touch with an agent.\n"
            "* Discuss infinite banking.\n"
            "* Learn about life insurance.\n"
            "* Anything else you can think of, just let me know!\n"
        ),
        global__prospect_name=("Full name of the prospect", "Can I ask your name so I can tailor my responses?"),
        system=context_system,
        on_full="intention",
        contexts={
            'INFINITE_BANKING': 'file:///home/ldupin/Development/flowster/flowster_lib/sandbox/flow_sheets/iande/infinite_banking.md'
            #'ARTICLE': 'https://www.insuranceandestates.com/family-bank/'
        }
    ),

    "intention": build_section(
        title="Intention",
        intro=intention_intro,
        transitions=[
            build_transition("topic contains 'article' or 'articles'", when="topic", passed="article_state"),
        ],
        global__intentions=("The users intentions for talking with us today", "What are your goals with I&E today?"),
        system=context_system,
        contexts={
            'INFINITE_BANKING': 'file:///home/ldupin/Development/flowster/flowster_lib/sandbox/flow_sheets/iande/infinite_banking.md'
        }
    ),

    "agent_state": build_section(
        title="Agent",
        intro="Which agent do you want to chat with?",
        agent__name=("Name of the agent the user wants to talk with", "Request which agent the user wants to talk with"),
        contexts={
            'AGENT': 'https://www.yellowpages.com/coeur-d-alene-id/insurance'
        },
    ),

    "get_name": build_section(
        title="Get Name",
        intro=(
            "Hello, thanks for making time today. "
            "I'm excited to work with you.\n\n"
            "Can I get your **name** to kick things off?"
        ),
        on_full="intention",
        global__prospect_name=(
            "Full name of the prospect",
            "Introduce yourself naturally and ask the prospect how they're doing. "
            "Establish a human connection before any business talk."
            "You are Insurance & Estates."
        ),
        system=context_system,
        contexts={
            'ARTICLE': 'https://www.insuranceandestates.com/family-bank/'
        },
    ),

    "upfront_contract": build_section(
        title="Upfront Contract",
        agenda_accepted=(
            "Boolean — did the prospect accept the mutual structure",
            "Propose a clear agenda for the conversation and ask for agreement. "
            "Establishes mutual respect and prevents the conversation from going sideways. "
            "Explicitly give the prospect permission to say no at the end. "
            "Removes fear of commitment and makes them more honest throughout."
        ),
        time_agreed=(
            "Agreed duration of the call",
            "State roughly how long this will take. Respects the prospect's time "
            "and sets a contained, professional tone."
        ),
        extra={
            "prompts": [
                build_prompt(
                    "contract_open",
                    "Here's what I'd suggest — I'll ask you some questions about what's "
                    "going on in your world, you do the same to me, and at the end we "
                    "both decide honestly if there's a reason to keep talking. If there's "
                    "not, totally fine. This should take about 20–30 minutes. Does that work?",
                    when=ScriptState.is_first,
                ),
                build_prompt(
                    "contract_confirm",
                    "So just to confirm — at the end of this, if it doesn't make sense, "
                    "you'll tell me straight and I'll do the same. Fair?",
                    when=ScriptState.needs_reconfirm,
                ),
            ],
            "transitions": [
                build_transition(
                    "Prospect agrees to the agenda and mutual opt-out",
                    when=ScriptState.agenda_accepted, passed="pain",
                ),
                {
                    **build_transition(
                        "Prospect pushes back or wants to hear the pitch first",
                        when=ScriptState.prospect_objective, passed="pain",
                    ),
                    "note": (
                        "Acknowledge their preference briefly, then redirect: "
                        "'Totally fair — let me ask just a couple quick questions first "
                        "so I'm not wasting your time with the wrong pitch.'"
                    ),
                },
            ],
            "data": {
                "prospect_objective": "Any goal the prospect stated they want from this conversation",
            },
        },
    ),

    "pain": build_section(
        title="Pain",
        surface_pain=(
            "The problem as the prospect first described it",
            "Start with what prompted them to take this call or explore a solution now. "
            "Surfaces the triggering event, which reveals urgency and priority level."
        ),
        emotional_impact=(
            "How this problem personally affects the prospect",
            "Peel back surface problems to find emotional and business impact. "
            "Sandler's 3-level pain model: surface issue → personal/emotional cost → "
            "business/financial impact. Ask how long they've lived with the problem "
            "and what they've already tried. Establishes pain duration and rules out "
            "easy fixes, deepening commitment to solving it."
        ),
        cost_of_inaction=(
            "What happens if nothing changes",
            "Ask what happens if nothing changes. "
            "Forces the prospect to articulate the cost of inaction — the most powerful motivator."
        ),
        priority_score=(
            "1–10 rating of how urgent solving this is",
            "Ask them to rate the priority of solving this on a scale of 1–10. "
            "A score below 7 means they're not a real prospect right now. Qualify or disqualify early."
        ),
        extra={
            "prompts": [
                build_prompt("pain_opener", "What made you open to having this conversation today?", when=ScriptState.is_first),
                build_prompt(
                    "pain_low_priority",
                    "Sounds like it's not a burning priority right now — that's totally fine. "
                    "Would it make more sense to reconnect in [timeframe] when this moves up the list?",
                    when=ScriptState.priority_score_low, action="ScriptState.schedule_followup",
                ),
                build_prompt(
                    "pain_summary",
                    "So if I'm hearing you right — [summarize pain in their words]. "
                    "Is that the core of it, or is there more underneath?",
                    when=ScriptState.pain_collected,
                ),
            ],
            "transitions": [
                build_transition(
                    "Prospect has articulated clear pain with emotional and business impact "
                    "and rated priority 7 or above",
                    when=ScriptState.priority_score, passed="budget",
                ),
                {
                    **build_transition(
                        "Prospect rates priority below 7 or can't articulate real pain",
                        when=ScriptState.cost_of_inaction, passed="exit",
                    ),
                    "note": "Don't force it. Offer a graceful follow-up touchpoint.",
                },
            ],
            "data": {
                "business_impact": "The financial or operational cost of the problem",
                "duration": "How long they've had this problem",
                "prior_attempts": "What they've already tried to solve it",
            },
        },
    ),

    "budget": build_section(
        title="Budget",
        budget_allocated=(
            "Boolean — has a budget already been set aside",
            "Introduce the topic of investment early and without apology. "
            "Sandler principle: money conversations belong in the middle, not at the end. "
            "Ask whether a budget has been allocated or whether that's still being figured out. "
            "Reveals whether this is a real buying cycle or exploratory shopping."
        ),
        budget_range=(
            "The range the prospect acknowledged as plausible",
            "Anchor with a range rather than a single number. "
            "A range is less threatening and lets you gauge their reaction before quoting a "
            "specific price."
        ),
        financial_objections=(
            "Any price concerns raised and how they were addressed",
            "If they push back on price, revisit the pain — not the features. "
            "Budget objections are usually pain objections in disguise. "
            "Don't defend price; re-anchor to cost of inaction."
        ),
        extra={
            "prompts": [
                build_prompt(
                    "budget_range_intro",
                    "People typically invest somewhere between $X and $Y to solve a problem like this. "
                    "Is that in the range you've been thinking, or does that feel way off?",
                    when=ScriptState.budget_not_discussed,
                ),
                build_prompt(
                    "budget_not_set",
                    "No worries if it's not locked in yet — is there a ballpark you'd be comfortable working within, even roughly?",
                    when=ScriptState.no_budget_allocated,
                ),
                build_prompt(
                    "budget_objection",
                    "I hear you on the number. Can I ask — if we could show this pays for itself within [timeframe] "
                    "based on what you described earlier with [pain point], would that change the conversation?",
                    when=ScriptState.price_objection_raised,
                ),
            ],
            "transitions": [
                build_transition(
                    "Prospect confirms budget is in range or expresses willingness to allocate",
                    when=ScriptState.budget_range, passed="decision",
                ),
                build_transition(
                    "Prospect has no budget and no path to one",
                    when=ScriptState.budget_allocated, passed="exit",
                ),
            ],
            "data": {
                "budget_owner": "Who controls the budget",
            },
        },
    ),

    "decision": build_section(
        title="Decision",
        decision_process=(
            "How decisions of this type are made at their organization",
            "Ask the prospect to walk you through how decisions like this get made at their company. "
            "Maps the buying process so there are no surprise blockers at the end."
        ),
        stakeholders=(
            "List of others who influence or veto the decision",
            "Identify all stakeholders who will influence or veto the decision. "
            "Multi-stakeholder deals die when you only sell to one person."
        ),
        decision_criteria=(
            "What conditions must be met to move forward",
            "Clarify what criteria or conditions would need to be true for them to move forward. "
            "Surfaces hidden objections and tells you exactly what your proposal needs to address."
        ),
        timeline=(
            "Timeframe for making a decision",
            "Establish a realistic timeline for their decision. "
            "Prevents endless follow-up cycles and helps you prioritize your pipeline."
        ),
        extra={
            "prompts": [
                build_prompt(
                    "decision_process",
                    "Walk me through how a decision like this typically gets made on your end.",
                    when=ScriptState.decision_not_mapped,
                ),
                build_prompt(
                    "stakeholders",
                    "Besides yourself, who else would need to weigh in or sign off on something like this?",
                    when=ScriptState.stakeholders_unknown,
                ),
                build_prompt(
                    "decision_criteria",
                    "What would need to be true — about us, the solution, the timeline — for you to feel confident moving forward?",
                    when=ScriptState.criteria_not_stated,
                ),
                build_prompt(
                    "timeline",
                    "Is there a timeframe you're working toward, or is this more open-ended right now?",
                    when=ScriptState.timeline_unknown,
                ),
            ],
            "transitions": [
                build_transition(
                    "Decision process, stakeholders, criteria, and timeline are all mapped",
                    when=ScriptState.decision_criteria, passed="fulfillment",
                ),
                build_transition(
                    "Prospect is the sole decision maker with clear criteria and timeline",
                    when=ScriptState.decision_maker, passed="fulfillment",
                ),
            ],
            "data": {
                "decision_maker": "Primary person who makes the final call",
            },
        },
    ),

    "fulfillment": build_section(
        title="Fulfillment",
        solution_presented=(
            "Summary of the solution or offer presented",
            "Present the solution only after all prior sections are qualified. "
            "In Sandler, you never pitch until you've confirmed pain, budget, and decision process. "
            "Don't over-present. Say less than you know."
        ),
        pain_addressed=(
            "Which specific pains were tied back to in the presentation",
            "Tie every feature or capability back to a specific pain the prospect stated. "
            "Generic pitches don't land. Mirror their exact language and problems."
        ),
        prospect_reaction=(
            "Prospect's response to the presentation — positive, skeptical, confused",
            "Ask after each key point whether it connects to what they described. "
            "Keeps the prospect engaged and co-creating the solution rather than passively listening."
        ),
        extra={
            "prompts": [
                build_prompt(
                    "solution_bridge",
                    "Based on everything you've shared — especially [specific pain point] — here's where I think we can genuinely help. "
                    "[Present solution.] Does that connect to what you described earlier?",
                    when=ScriptState.all_sections_qualified,
                ),
                build_prompt(
                    "relevance_check",
                    "Is this landing the way I'm describing it, or am I missing something about your situation?",
                    when=ScriptState.mid_fulfillment,
                ),
                build_prompt(
                    "not_yet_qualified",
                    "Before I get into what we do, I want to make sure I'm showing you the right thing — "
                    "can I ask a couple more questions?",
                    when=ScriptState.fulfillment_attempted_early, action="ScriptState.redirect_to_pain",
                ),
            ],
            "transitions": [
                build_transition(
                    "Prospect confirms the solution addresses their pain and expresses interest in next steps",
                    when=ScriptState.prospect_reaction, passed="post_sell",
                ),
                {
                    **build_transition(
                        "Prospect raises new objections or pain not previously discussed",
                        when=ScriptState.objections_raised, passed="pain",
                    ),
                    "note": (
                        "Loop back to pain before continuing. Don't push forward with unresolved objections."
                    ),
                },
            ],
            "data": {
                "objections_raised": "Any new objections surfaced during fulfillment",
            },
        },
    ),

    "post_sell": build_section(
        title="Post Sell",
        doubts_raised=(
            "Any hesitations or second thoughts the prospect voiced",
            "Proactively surface any lingering doubts before ending the conversation. "
            "Buyer's remorse kills deals after the call. Surface it now while you can address it."
        ),
        confidence_blockers=(
            "What the prospect said they'd need to feel fully committed",
            "Ask what would make them feel completely confident moving forward. "
            "Gives the prospect space to voice hesitation and you the chance to resolve it."
        ),
        next_step=(
            "Agreed next action — demo, proposal, intro call with stakeholder, etc.",
            "Lock in a specific next step with a date and owner. "
            "Vague next steps kill momentum. 'I'll follow up soon' is not a next step."
        ),
        deal_status=(
            "Current status — advanced, nurture, disqualified",
            "Do not over-celebrate or show excessive relief. "
            "Sandler principle: maintain equal business stature. "
            "Desperation and excitement both signal weakness."
        ),
        extra={
            "prompts": [
                build_prompt(
                    "post_sell_check",
                    "Before we wrap — any part of you that's second-guessing this, or anything that still feels unresolved?",
                    when=ScriptState.deal_verbally_agreed,
                ),
                build_prompt(
                    "confidence_check",
                    "What would make you feel totally solid about moving forward?",
                    when=ScriptState.prospect_hesitant,
                ),
                build_prompt(
                    "next_step_close",
                    "Let's lock in a next step so this doesn't fall through the cracks — "
                    "what does your calendar look like [this week / next week]?",
                    when=ScriptState.no_next_step_set, action="ScriptState.schedule_next_step",
                ),
                build_prompt(
                    "exit_graceful",
                    "I appreciate your time and honesty today. Based on what we covered, I don't think the timing is right — "
                    "but let's stay in touch. Mind if I check back in [timeframe]?",
                    when=ScriptState.deal_not_progressing, action="ScriptState.mark_nurture",
                ),
            ],
            "transitions": [
                build_transition(
                    "Prospect has no outstanding doubts and a next step is confirmed",
                    when=ScriptState.next_step, passed="exit",
                ),
                {
                    **build_transition(
                        "Prospect raises a doubt that re-opens a prior topic",
                        when=ScriptState.doubts_raised, passed="pain",
                    ),
                    "note": (
                        "Don't panic. Loop back calmly — late objections are usually budget or decision process issues in disguise."
                    ),
                },
            ],
            "data": {
                "next_step_date": "Date and time of the agreed next step",
            },
        },
    ),
}
