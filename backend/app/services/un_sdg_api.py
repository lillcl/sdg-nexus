"""
UN SDG API integration — fetches real indicator data per country.
Endpoint: https://unstats.un.org/SDGAPI/v1/sdg/Indicator/Data

Free, no auth required. Returns data for specific indicators by country.
We cache aggressively (TTL 24h) since this data only updates annually.
"""
import httpx
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import json

UN_SDG_BASE = "https://unstats.un.org/SDGAPI/v1/sdg"
WORLD_BANK_BASE = "https://api.worldbank.org/v2/country/{iso2}/indicator/{indicator}?format=json&mrv=1&per_page=1"

# In-memory cache: {cache_key: {data, expires_at}}
_cache: Dict[str, Dict] = {}
CACHE_TTL_HOURS = 24

def _get_cache(key: str) -> Optional[Any]:
    if key in _cache:
        entry = _cache[key]
        if datetime.utcnow() < entry["expires_at"]:
            return entry["data"]
        del _cache[key]
    return None

def _set_cache(key: str, data: Any):
    _cache[key] = {"data": data, "expires_at": datetime.utcnow() + timedelta(hours=CACHE_TTL_HOURS)}

# Key SDG indicators with their UN series codes and World Bank codes
SDG_INDICATORS_CONFIG: Dict[int, list] = {
    1: [
        {"code": "1.1.1", "label": "Extreme poverty rate (<$2.15/day)", "unit": "%", "lower_better": True, "series": "SI_POV_DAY1"},
        {"code": "1.3.1", "label": "Social protection coverage", "unit": "%", "lower_better": False, "series": "SI_COV_BENFTS"},
    ],
    2: [
        {"code": "2.1.1", "label": "Prevalence of undernourishment", "unit": "%", "lower_better": True, "series": "SN_ITK_DEFC"},
        {"code": "2.2.1", "label": "Stunting in children under 5", "unit": "%", "lower_better": True, "series": "SH_STA_STNT"},
        {"code": "2.2.2", "label": "Wasting in children under 5", "unit": "%", "lower_better": True, "series": "SH_STA_WAST"},
    ],
    3: [
        {"code": "3.1.1", "label": "Maternal mortality ratio", "unit": "/100k live births", "lower_better": True, "series": "SH_STA_MORT"},
        {"code": "3.2.1", "label": "Under-5 mortality rate", "unit": "/1,000 live births", "lower_better": True, "series": "SH_DYN_MORT"},
        {"code": "3.2.2", "label": "Neonatal mortality rate", "unit": "/1,000 live births", "lower_better": True, "series": "SH_DYN_NMRT"},
        {"code": "3.3.1", "label": "HIV incidence per 1,000", "unit": "/1k pop", "lower_better": True, "series": "SH_HIV_INCD"},
        {"code": "3.3.2", "label": "TB incidence per 100,000", "unit": "/100k pop", "lower_better": True, "series": "SH_TBS_INCD"},
        {"code": "3.8.1", "label": "UHC service coverage index", "unit": "index", "lower_better": False, "series": "SH_ACS_UNHC"},
        {"code": "3.a.1", "label": "Daily smokers (15+ years)", "unit": "%", "lower_better": True, "series": "SH_PRV_SMOK"},
    ],
    4: [
        {"code": "4.1.1a", "label": "Reading proficiency, end of primary", "unit": "%", "lower_better": False, "series": "SE_ADT_EDUCTRN"},
        {"code": "4.6.1", "label": "Youth literacy rate (15-24)", "unit": "%", "lower_better": False, "series": "SE_ADT_LITR_FN"},
        {"code": "4.2.1", "label": "Early childhood education participation", "unit": "%", "lower_better": False, "series": "SE_PRE_PARTN"},
    ],
    5: [
        {"code": "5.5.1a", "label": "Women in national parliaments", "unit": "%", "lower_better": False, "series": "SG_GEN_PARL"},
        {"code": "5.5.2", "label": "Women in managerial positions", "unit": "%", "lower_better": False, "series": "IC_GEN_MGTN"},
        {"code": "5.b.1", "label": "Women owning mobile phones", "unit": "%", "lower_better": False, "series": "IT_MOB_OWN"},
    ],
    6: [
        {"code": "6.1.1", "label": "Safe drinking water access", "unit": "%", "lower_better": False, "series": "SH_H2O_SAFE"},
        {"code": "6.2.1a", "label": "Safe sanitation services", "unit": "%", "lower_better": False, "series": "SH_SAN_SAFE"},
        {"code": "6.4.2", "label": "Water stress level", "unit": "%", "lower_better": True, "series": "ER_H2O_STRESS"},
    ],
    7: [
        {"code": "7.1.1", "label": "Access to electricity", "unit": "%", "lower_better": False, "series": "EG_ELC_ACCS"},
        {"code": "7.1.2", "label": "Clean cooking fuels access", "unit": "%", "lower_better": False, "series": "EG_CFT_FOSL"},
        {"code": "7.2.1", "label": "Renewable energy share", "unit": "%", "lower_better": False, "series": "EG_FEC_RNEW"},
        {"code": "7.3.1", "label": "Energy intensity (MJ/$2017 PPP)", "unit": "MJ/$", "lower_better": True, "series": "EG_EGY_PRIM"},
    ],
    8: [
        {"code": "8.5.2", "label": "Unemployment rate (total)", "unit": "%", "lower_better": True, "series": "SL_UEM_TOTL"},
        {"code": "8.7.1", "label": "Child labour rate (5-17 years)", "unit": "%", "lower_better": True, "series": "SL_TLF_CHLD"},
        {"code": "8.10.2", "label": "Adults with bank/fin. account", "unit": "%", "lower_better": False, "series": "FB_ATM_TOTL"},
        {"code": "8.6.1", "label": "Youth not in education/employment", "unit": "%", "lower_better": True, "series": "SL_TLF_NEET"},
    ],
    9: [
        {"code": "9.c.1", "label": "Mobile broadband subscriptions", "unit": "/100 pop", "lower_better": False, "series": "IT_MOB_BROADBAND"},
        {"code": "9.1.2b", "label": "Passengers carried (air transport)", "unit": "M passengers", "lower_better": False, "series": "IS_AIR_GOOD_FREIGHT_PC"},
    ],
    10: [
        {"code": "10.1.1", "label": "Bottom 40% income growth rate", "unit": "%/yr", "lower_better": False, "series": "SI_POV_NAHC"},
        {"code": "10.4.1", "label": "Labour share of GDP", "unit": "%", "lower_better": False, "series": "SL_EMP_SMGN"},
    ],
    11: [
        {"code": "11.1.1", "label": "Urban slum dwellers", "unit": "%", "lower_better": True, "series": "EN_LND_SLUM"},
        {"code": "11.6.2", "label": "PM2.5 air pollution (µg/m³)", "unit": "µg/m³", "lower_better": True, "series": "EN_ATM_PM25"},
    ],
    12: [
        {"code": "12.2.2", "label": "Domestic material consumption per capita", "unit": "tonnes/cap", "lower_better": True, "series": "EN_MAT_DOMCMPG"},
    ],
    13: [
        {"code": "13.2.2", "label": "GHG emissions (MtCO₂e)", "unit": "MtCO₂e", "lower_better": True, "series": "EN_ATM_GHGT"},
        {"code": "13.1.1", "label": "Deaths from disasters per 100k", "unit": "/100k", "lower_better": True, "series": "VC_DSR_MORT"},
    ],
    14: [
        {"code": "14.4.1", "label": "Sustainable fish stocks", "unit": "%", "lower_better": False, "series": "ER_FSH_INVST"},
        {"code": "14.5.1", "label": "Marine protected areas", "unit": "% coverage", "lower_better": False, "series": "ER_MRN_MPA"},
    ],
    15: [
        {"code": "15.1.1", "label": "Forest area (% of land)", "unit": "%", "lower_better": False, "series": "AG_LND_FRST"},
        {"code": "15.5.1", "label": "Red List Index (biodiversity)", "unit": "0–1 index", "lower_better": False, "series": "ER_RSK_LST"},
        {"code": "15.1.2b", "label": "Terrestrial protected areas", "unit": "%", "lower_better": False, "series": "ER_PTD_TERR"},
    ],
    16: [
        {"code": "16.1.1", "label": "Homicide rate per 100,000", "unit": "/100k pop", "lower_better": True, "series": "VC_IHR_PSRC"},
        {"code": "16.6.2", "label": "Satisfaction with public services", "unit": "%", "lower_better": False, "series": "SG_INF_ACCSS"},
        {"code": "16.9.1", "label": "Birth registration rate", "unit": "%", "lower_better": False, "series": "SG_REG_BRTH90"},
    ],
    17: [
        {"code": "17.8.1", "label": "Internet users", "unit": "%", "lower_better": False, "series": "IT_USE_II99"},
        {"code": "17.4.1", "label": "Debt service as % of exports", "unit": "%", "lower_better": True, "series": "DC_TOF_TRNSFGDP"},
        {"code": "17.6.2", "label": "Fixed broadband subscriptions", "unit": "/100 pop", "lower_better": False, "series": "IT_NET_BBND"},
    ],
}

async def fetch_un_indicator(indicator_code: str, area_code: str = "", timeout: int = 10) -> list:
    """Fetch indicator data from UN SDG API."""
    cache_key = f"un_{indicator_code}_{area_code}"
    cached = _get_cache(cache_key)
    if cached is not None:
        return cached

    try:
        url = f"{UN_SDG_BASE}/Indicator/Data?indicator={indicator_code}&areaCode={area_code}&timePeriodStart=2018&timePeriodEnd=2023&pageSize=50"
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.get(url)
            if r.status_code == 200:
                data = r.json()
                result = data.get("data", [])
                _set_cache(cache_key, result)
                return result
    except Exception:
        pass
    return []

async def get_country_indicators(iso3: str, goals: list[int] = None) -> Dict[str, Any]:
    """Get all indicator values for a country from UN SDG API."""
    cache_key = f"country_indicators_{iso3}"
    cached = _get_cache(cache_key)
    if cached is not None:
        return cached

    goals_to_fetch = goals or list(range(1, 18))
    result = {}

    # Fetch in parallel, but limit concurrency
    async def fetch_one(goal: int):
        indicators = SDG_INDICATORS_CONFIG.get(goal, [])
        for ind in indicators:
            try:
                rows = await fetch_un_indicator(ind["code"], iso3)
                if rows:
                    # Get most recent value
                    sorted_rows = sorted(rows, key=lambda x: x.get("timePeriod", 0), reverse=True)
                    for row in sorted_rows:
                        val = row.get("value")
                        if val is not None:
                            try:
                                result[ind["code"]] = {
                                    "value": float(val),
                                    "label": ind["label"],
                                    "unit": ind["unit"],
                                    "lower_better": ind.get("lower_better", False),
                                    "year": row.get("timePeriod", ""),
                                    "source": "UN SDG API",
                                }
                            except (ValueError, TypeError):
                                pass
                            break
            except Exception:
                continue

    # Run all goal fetches concurrently
    await asyncio.gather(*[fetch_one(g) for g in goals_to_fetch], return_exceptions=True)

    _set_cache(cache_key, result)
    return result

def get_indicators_for_goal(goal: int) -> list:
    """Return indicator metadata for a given SDG goal."""
    return SDG_INDICATORS_CONFIG.get(goal, [])
