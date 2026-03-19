from fastapi import APIRouter, HTTPException
from app.services.sdg_data import get_all_countries, get_country

router = APIRouter(prefix="/map", tags=["map"])

@router.get("/countries")
async def countries():
    data = await get_all_countries()
    return [
        {
            "iso3": c["iso3"], "iso2": c["iso2"], "name": c["name"],
            "overall_score": c["overall_score"], "rank": c["rank"],
            "region": c["region"], "subregion": c.get("subregion",""),
            "income_group": c.get("income_group",""),
            "population": c.get("population", 0),
            "scores": c["scores"], "trends": c["trends"],
            "indicators": c.get("indicators", {}),
            "tags": c.get("tags", []),
        }
        for c in data.values()
    ]

@router.get("/country/{iso3}")
async def country_detail(iso3: str):
    c = await get_country(iso3)
    if not c: raise HTTPException(404, f"Country {iso3} not found")
    return c

from app.services.un_sdg_api import get_country_indicators, SDG_INDICATORS_CONFIG

@router.get("/indicators/{iso3}")
async def country_indicators(iso3: str, goal: int = 0):
    """Fetch real indicator values for a country from UN SDG API."""
    goals = [goal] if goal > 0 else list(range(1, 18))
    data = await get_country_indicators(iso3.upper(), goals)
    return {
        "iso3": iso3.upper(),
        "indicators": data,
        "metadata": {str(g): SDG_INDICATORS_CONFIG.get(g, []) for g in goals},
    }

@router.get("/indicator-metadata/{goal}")
async def indicator_metadata(goal: int):
    """Get indicator metadata for a specific SDG goal."""
    return SDG_INDICATORS_CONFIG.get(goal, [])
