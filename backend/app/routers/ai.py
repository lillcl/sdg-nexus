"""AI endpoints — SSE streaming, no auth required."""
from fastapi import Depends, Request
from app.core.rate_limit import check_rate_limit
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.ai.provider import ai
from app.services.sdg_data import get_all_countries, get_country

class ChatRequest(BaseModel):
    prompt: str
    system: str = ""

router = APIRouter(prefix="/ai", tags=["ai"])

SDG_TITLES = {
    1:"No Poverty",2:"Zero Hunger",3:"Good Health & Well-Being",4:"Quality Education",
    5:"Gender Equality",6:"Clean Water & Sanitation",7:"Affordable & Clean Energy",
    8:"Decent Work & Economic Growth",9:"Industry, Innovation & Infrastructure",
    10:"Reduced Inequalities",11:"Sustainable Cities & Communities",
    12:"Responsible Consumption & Production",13:"Climate Action",14:"Life Below Water",
    15:"Life on Land",16:"Peace, Justice & Strong Institutions",17:"Partnerships for the Goals",
}

async def _sse_stream(prompt: str, system: str = ""):
    async for chunk in ai.stream(prompt, system):
        yield f"data: {json.dumps({'text': chunk})}\n\n"
    yield "data: [DONE]\n\n"


# ── Auto-generate (committee → topics + countries in one SSE call) ────
class CommitteeAutoRequest(BaseModel):
    committee_id: str = ""
    committee_name: str
    delegation_size: int = 20
    level: str = "university"
    formality: str = "academic"
    sdg_focus: str = ""   # e.g. "SDG3: Good Health, SDG6: Clean Water"

@router.post("/mun/auto-generate")
async def auto_generate(req: CommitteeAutoRequest, _rl=Depends(check_rate_limit)):
    all_data = await get_all_countries()
    # Pick representative sample covering all regions
    by_region: dict = {}
    for c in all_data.values():
        r = c.get("region","Other")
        by_region.setdefault(r, []).append(c)
    sample = []
    for r_list in by_region.values():
        sample.extend(sorted(r_list, key=lambda x: x["overall_score"], reverse=True)[:12])
    sample = sample[:80]
    country_hint = "; ".join([f"{c['name']}({c['iso3']})" for c in sample])

    sdg_focus = req.sdg_focus or "SDG 1-17: Sustainable Development Goals"

    prompt = f"""You are a senior MUN director. Generate committee content for:
Committee: {req.committee_name}
SDG Focus: {sdg_focus}
Delegation size: {req.delegation_size} countries
Level: {req.level}
Formality: {req.formality}

Available countries (use real ISO3 codes only): {country_hint}

RESPOND WITH ONLY THIS EXACT JSON — no markdown, no code blocks, no extra text before or after:
{{
  "topics": [
    {{"title": "Topic 1 title here", "description": "2-3 sentence overview of the issue.", "key_issues": ["specific issue 1", "specific issue 2", "specific issue 3"]}},
    {{"title": "Topic 2 title here", "description": "2-3 sentence overview.", "key_issues": ["issue 1", "issue 2", "issue 3"]}}
  ],
  "recommended_countries": [
    {{"iso3": "USA", "name": "United States", "reason": "One sentence on why this country is relevant.", "stance": "progressive"}},
    {{"iso3": "CHN", "name": "China", "reason": "One sentence reason.", "stance": "conservative"}},
    {{"iso3": "BRA", "name": "Brazil", "reason": "One sentence reason.", "stance": "developing"}}
  ]
}}

Include exactly {req.delegation_size} entries in recommended_countries. Use only valid ISO3 codes from the list above."""

    return StreamingResponse(_sse_stream(prompt), media_type="text/event-stream")


# ── Background Guide ─────────────────────────────────────────────────
class BgGuideRequest(BaseModel):
    committee_name: str
    topic: str
    sdg_focus: str = ""
    level: str = "university"
    length: str = "medium"
    formality: str = "academic"

@router.post("/mun/background-guide")
async def generate_bg_guide(req: BgGuideRequest):
    all_data = await get_all_countries()
    top_countries = sorted(all_data.values(), key=lambda x: x["overall_score"], reverse=True)[:8]
    bottom_countries = sorted(all_data.values(), key=lambda x: x["overall_score"])[:5]
    sdg_context = "Top performers: " + ", ".join([f"{c['name']} ({c['overall_score']})" for c in top_countries])
    sdg_context += "\nMost challenged: " + ", ".join([f"{c['name']} ({c['overall_score']})" for c in bottom_countries])

    length_guide = {"short": "~1500 words", "medium": "~2500 words", "full": "~4000 words"}.get(req.length, "~2500 words")
    prompt = f"""Write a Model UN Background Guide ({length_guide}, {req.formality} register, {req.level} level):

Committee: {req.committee_name}
Topic: {req.topic}
SDG Focus: {req.sdg_focus}

Real SDG Data Context:
{sdg_context}

Include these sections with full content:
1. Introduction to the Committee
2. Background and History of the Issue (with specific data and statistics)
3. Current Global State (cite SDG index scores where relevant)
4. Key Stakeholders and Bloc Positions
5. Relevant UN Resolutions and Frameworks
6. Country-Specific Case Studies (3-4 specific examples with data)
7. Questions to Consider
8. Recommended Research Resources

Write the complete guide now in {req.formality} MUN style."""

    return StreamingResponse(_sse_stream(prompt), media_type="text/event-stream")


# ── Position Paper ───────────────────────────────────────────────────
class PositionPaperRequest(BaseModel):
    country_iso3: str
    topic: str
    level: str = "university"
    length: str = "medium"
    formality: str = "academic"

@router.post("/mun/position-paper")
async def generate_position_paper(req: PositionPaperRequest):
    country = await get_country(req.country_iso3)
    if not country:
        country = {"name": req.country_iso3, "overall_score": "N/A", "scores": {}, "region": "Unknown", "income_group": "Unknown", "indicators": {}}
    
    scores_str = "\n".join([f"  SDG{g} ({SDG_TITLES.get(int(g),'')[:20]}): {v:.1f}/100" for g, v in country.get("scores", {}).items()])
    indicators = country.get("indicators", {})
    ind_str = ""
    if indicators:
        ind_str = "\nKey indicators: " + ", ".join([f"{k}={v}" for k,v in list(indicators.items())[:6]])
    
    length_guide = {"short": "~600 words", "medium": "~1000 words", "full": "~1500 words"}.get(req.length, "~1000 words")
    
    prompt = f"""Write a MUN Position Paper ({length_guide}, {req.formality}, {req.level} level):

Country: {country['name']} ({req.country_iso3})
Region: {country['region']} | Income Group: {country['income_group']}
Overall SDG Score: {country['overall_score']}/100
Topic: {req.topic}

Country SDG Performance:
{scores_str}
{ind_str}

Structure:
1. Country Overview — key statistics and SDG profile
2. National Position on {req.topic}
3. Key Challenges Faced (cite specific indicator data)
4. National Achievements and Best Practices
5. Proposed Policy Recommendations (3-4 concrete proposals)
6. Suggested Bloc Alignments

Write the complete position paper now, citing the SDG data above."""

    return StreamingResponse(_sse_stream(prompt), media_type="text/event-stream")


# ── MUN Topics (standalone) ───────────────────────────────────────────
class MunTopicRequest(BaseModel):
    sdg_focus: str
    count: int = 5
    level: str = "university"

@router.post("/mun/topics")
async def generate_mun_topics(req: MunTopicRequest):
    prompt = f"""Generate {req.count} compelling MUN committee topics for {req.level} level.
SDG Focus: {req.sdg_focus}

Return ONLY a JSON array:
[{{"title":"...","description":"2-3 sentences.","key_issues":["issue1","issue2","issue3"]}}]"""
    return StreamingResponse(_sse_stream(prompt), media_type="text/event-stream")


# ── Classroom Topics — data-backed ────────────────────────────────────
class ProjectTopicRequest(BaseModel):
    sdg_goal: int
    level: str = "secondary"
    difficulty: int = 3
    domain: str = "tech"
    count: int = 5
    country: str = ""   # optional: focus on specific country

@router.post("/classroom/topics")
async def generate_topics(req: dict):
    """Generate SDG project topics using real SDR indicator data"""
    sdg_goal = req.get("sdg_goal", 1)
    level = req.get("level", "secondary")
    difficulty = req.get("difficulty", 3)
    domain = req.get("domain", "tech")
    count = req.get("count", 5)
    country_context = req.get("country_context", "No specific country")
    indicator_data = req.get("indicator_data", [])

    sdg_titles = SDG_TITLES.get(sdg_goal, f"SDG {sdg_goal}")

    # Build indicator summary for prompt
    indicator_text = ""
    if indicator_data:
        indicator_text = "\n\nACTUAL MEASURED INDICATORS FROM SDR 2025:\n"
        for ind in indicator_data:
            status_emoji = "🟢" if ind.get("status") == "good" else "🟡" if ind.get("status") == "moderate" else "🔴"
            indicator_text += f"  {status_emoji} {ind['label']}: {ind['value']}\n"

    prompt = f"""Generate exactly {count} SDG project topics for {level} students.

SDG: {sdg_goal} — {sdg_titles}
Domain: {domain} | Difficulty: {difficulty}/5
{country_context}{indicator_text}

IMPORTANT: Each topic MUST be grounded in the specific data above. Reference actual indicator values in problem statements.

Return ONLY a JSON array with NO other text:
[
  {{
    "title": "Project title (specific, action-oriented)",
    "problem": "Specific problem referencing real indicator values (1-2 sentences)",
    "approach": "Concrete methodology students will use (1-2 sentences)",
    "skills": ["skill1", "skill2", "skill3"],
    "data_sources": "Specific datasets: SDR 2025, World Bank, etc.",
    "sdg_targets": ["1.1", "1.2"]
  }}
]"""

    system = "You are an expert SDG education consultant. Generate project topics grounded in real data. Always return valid JSON only with no preamble or markdown."

    async def stream_response():
        async for chunk in ai.stream(prompt, system):
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.post("/chat")
async def chat(req: ChatRequest):
    """Simple chat endpoint for Canvas AI Coach"""
    try:
        text = await ai.generate(req.prompt, req.system)
        return {"text": text}
    except Exception as e:
        raise HTTPException(503, f"AI unavailable: {e}")
