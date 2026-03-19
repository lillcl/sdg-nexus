MUN_TOPIC_PROMPT = """You are an expert MUN director. Generate {count} compelling committee topics for a Model UN committee focused on {sdg_focus}.

Each topic must:
- Be directly relevant to the SDG(s) specified
- Be debatable with multiple stakeholder perspectives
- Reference real current global challenges with data
- Be appropriate for {level} level students

Return ONLY a JSON array like:
[
  {{"title": "...", "description": "2-3 sentence overview", "key_issues": ["issue1", "issue2", "issue3"]}}
]
No other text."""

COUNTRY_EVALUATOR_PROMPT = """You are evaluating countries for a MUN committee on: {topic}
SDG Focus: {sdg_focus}

From this SDG data, rank the TOP {count} most suitable countries for this committee.
Select a mix of: strong performers (can share best practices), challenged nations (face the issue directly), and influential middle powers.

Country SDG data:
{country_data}

Return ONLY a JSON array:
[
  {{"iso3": "...", "name": "...", "reason": "1 sentence why this country is ideal for this topic", "stance": "progressive|conservative|developing"}}
]"""

BACKGROUND_GUIDE_PROMPT = """You are writing a Model UN Background Guide for:
Committee: {committee_name}
Topic: {topic}
Level: {level}
Length: {length}
Formality: {formality}

Include these sections:
1. Introduction to the Committee
2. Background and History of the Issue
3. Current State of Affairs (cite SDG data where relevant)
4. Key Stakeholders and Blocs
5. UN Actions and Resolutions
6. Questions to Consider
7. Recommended Resources

SDG Context Data:
{sdg_context}

Write the full Background Guide now. Use formal MUN language."""

POSITION_PAPER_PROMPT = """Write a MUN Position Paper for:
Country: {country_name}
Committee Topic: {topic}
Level: {level}
Length: {length}
Formality: {formality}

Country SDG Data:
{country_sdg_data}

Structure:
1. Country Overview & SDG Performance Summary
2. National Position on {topic}
3. Key Challenges Faced
4. Achievements and Best Practices
5. Proposed Solutions and Policy Recommendations
6. Suggested Bloc Alignments

Write the full position paper now. Be specific, data-backed, and diplomatically accurate."""

PROJECT_TOPIC_PROMPT = """You are generating SDG-focused design-challenge project topics for {level} students.
Difficulty: {difficulty}/5
Domain: {domain}
SDG Goal {sdg_goal}: {sdg_title}
Context: {country_context}

Key SDG Indicator Gaps to address:
{indicator_gaps}

STYLE GUIDE — Each challenge must follow this format:
1. Give a catchy challenge title
2. "The Local/National Statistic:" — cite ONE specific, surprising data point from the country/region (real number from SDR 2025 or World Bank). Make it visceral and relatable (e.g. "less than 20% of plastic bottles are recycled" or "a beef burger has 3x the carbon footprint of chicken").
3. "The Question:" — frame it as "How might we design/build/prototype a [specific low-tech or high-tech tool] that uses [this statistic] to [achieve specific outcome] within [timeframe]?"

Generate {count} distinct project challenges. Each must:
- Use a REAL statistic grounded in SDR 2025 / World Bank WDI data for the given country/region
- Be framed as a "How Might We" design challenge
- Specify a concrete prototype to build
- Be achievable at difficulty {difficulty}/5
- Relate directly to SDG {sdg_goal}

Return ONLY valid JSON (no markdown, no preamble):
[
  {{
    "title": "Challenge N: [Catchy Title]",
    "problem_statement": "The Local/National Statistic: [one specific data point with source]. The Question: How might we [design challenge]?",
    "prototype_brief": "Build/design/prototype [specific artifact] that [mechanism] to [measurable outcome] within [timeframe].",
    "difficulty": {difficulty},
    "time_estimate": "X weeks",
    "suggested_tools": ["tool1", "tool2", "tool3"],
    "data_source": "SDR 2025 / World Bank WDI / [specific source]",
    "rubric": {{
      "data_use": "Does the prototype directly respond to the cited statistic?",
      "innovation": "Is the approach novel and well-reasoned?",
      "sdg_impact": "Could this realistically reduce the indicator gap for SDG {sdg_goal}?",
      "feasibility": "Can students at this level build/test it?",
      "presentation": "Is the pitch clear, compelling and evidence-based?"
    }}
  }}
]"""
