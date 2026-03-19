"""
SDG Data Service — uses pre-built SDR 2025 data from sdr2025.json
Generated from official SDSN Sustainable Development Report 2025 Excel file.
193 countries × 126 indicators. No external API calls needed.
"""
import json, os
from typing import Dict, Any, Optional

_country_cache: Dict[str, Any] = {}
_loaded = False

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'sdr2025.json')

def _load():
    global _country_cache, _loaded
    if _loaded:
        return
    try:
        with open(DATA_FILE) as f:
            data = json.load(f)
        raw = data['countries']
        for iso3, c in raw.items():
            # Normalize to the shape the rest of the backend expects
            _country_cache[iso3] = {
                'iso3': iso3,
                'iso2': c.get('iso2', iso3.lower()[:2]),
                'name': c.get('name', iso3),
                'region': c.get('region', ''),
                'subregion': c.get('region', ''),
                'income_group': c.get('income_group', ''),
                'population': c.get('population', 0),
                'overall_score': c.get('score') or 0,
                'rank': c.get('rank') or 999,
                'scores': c.get('goal_scores', {}),
                'trends': c.get('goal_trends', {}),
                'indicators': {
                    k: v.get('v')
                    for k, v in c.get('indicators', {}).items()
                    if v.get('v') is not None
                },
                'indicators_full': c.get('indicators', {}),  # includes n, c, t, y
                'tags': c.get('tags', []),
            }
        _loaded = True
    except Exception as e:
        # Minimal fallback
        _country_cache = {}
        _loaded = True

async def load_country_data() -> Dict[str, Any]:
    _load()
    return _country_cache

async def get_country(iso3: str) -> Optional[Dict]:
    _load()
    return _country_cache.get(iso3.upper())

async def get_all_countries() -> Dict[str, Any]:
    _load()
    return _country_cache
