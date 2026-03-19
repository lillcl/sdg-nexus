"""
Games router — Educational geography games
"""
from fastapi import APIRouter
from typing import List, Dict
import random

router = APIRouter(prefix="/games", tags=["games"])

# Game data - countries with flags, capitals, neighbors
COUNTRIES_DATA = {
    "USA": {"name": "United States", "capital": "Washington, D.C.", "flag": "🇺🇸", "continent": "North America", "neighbors": ["CAN", "MEX"]},
    "CAN": {"name": "Canada", "capital": "Ottawa", "flag": "🇨🇦", "continent": "North America", "neighbors": ["USA"]},
    "MEX": {"name": "Mexico", "capital": "Mexico City", "flag": "🇲🇽", "continent": "North America", "neighbors": ["USA", "GTM", "BLZ"]},
    "GBR": {"name": "United Kingdom", "capital": "London", "flag": "🇬🇧", "continent": "Europe", "neighbors": ["IRL"]},
    "FRA": {"name": "France", "capital": "Paris", "flag": "🇫🇷", "continent": "Europe", "neighbors": ["ESP", "BEL", "DEU", "ITA", "CHE"]},
    "DEU": {"name": "Germany", "capital": "Berlin", "flag": "🇩🇪", "continent": "Europe", "neighbors": ["FRA", "POL", "AUT", "CHE", "DNK", "NLD", "BEL", "CZE"]},
    "ITA": {"name": "Italy", "capital": "Rome", "flag": "🇮🇹", "continent": "Europe", "neighbors": ["FRA", "CHE", "AUT", "SVN"]},
    "ESP": {"name": "Spain", "capital": "Madrid", "flag": "🇪🇸", "continent": "Europe", "neighbors": ["FRA", "PRT"]},
    "CHN": {"name": "China", "capital": "Beijing", "flag": "🇨🇳", "continent": "Asia", "neighbors": ["RUS", "IND", "PAK", "AFG", "KAZ", "KGZ", "TJK", "MNG", "NPL", "BTN", "MMR", "LAO", "VNM"]},
    "JPN": {"name": "Japan", "capital": "Tokyo", "flag": "🇯🇵", "continent": "Asia", "neighbors": []},
    "IND": {"name": "India", "capital": "New Delhi", "flag": "🇮🇳", "continent": "Asia", "neighbors": ["PAK", "CHN", "NPL", "BTN", "MMR", "BGD"]},
    "BRA": {"name": "Brazil", "capital": "Brasília", "flag": "🇧🇷", "continent": "South America", "neighbors": ["ARG", "BOL", "COL", "GUY", "PRY", "PER", "SUR", "URY", "VEN"]},
    "ARG": {"name": "Argentina", "capital": "Buenos Aires", "flag": "🇦🇷", "continent": "South America", "neighbors": ["CHL", "BOL", "PRY", "BRA", "URY"]},
    "AUS": {"name": "Australia", "capital": "Canberra", "flag": "🇦🇺", "continent": "Oceania", "neighbors": []},
    "RUS": {"name": "Russia", "capital": "Moscow", "flag": "🇷🇺", "continent": "Europe/Asia", "neighbors": ["NOR", "FIN", "EST", "LVA", "LTU", "POL", "BLR", "UKR", "GEO", "AZE", "KAZ", "CHN", "MNG"]},
    "ZAF": {"name": "South Africa", "capital": "Pretoria", "flag": "🇿🇦", "continent": "Africa", "neighbors": ["NAM", "BWA", "ZWE", "MOZ", "SWZ", "LSO"]},
    "EGY": {"name": "Egypt", "capital": "Cairo", "flag": "🇪🇬", "continent": "Africa", "neighbors": ["LBY", "SDN", "ISR"]},
    "NGA": {"name": "Nigeria", "capital": "Abuja", "flag": "🇳🇬", "continent": "Africa", "neighbors": ["BEN", "CMR", "TCD", "NER"]},
    "KOR": {"name": "South Korea", "capital": "Seoul", "flag": "🇰🇷", "continent": "Asia", "neighbors": ["PRK"]},
    "SAU": {"name": "Saudi Arabia", "capital": "Riyadh", "flag": "🇸🇦", "continent": "Asia", "neighbors": ["JOR", "IRQ", "KWT", "QAT", "ARE", "OMN", "YEM"]},
}


@router.get("/flags/quiz")
async def get_flag_quiz(count: int = 5):
    """Get random countries for flag identification game"""
    countries = random.sample(list(COUNTRIES_DATA.keys()), min(count, len(COUNTRIES_DATA)))
    
    quiz = []
    for code in countries:
        country = COUNTRIES_DATA[code]
        # Create multiple choice options
        options = [country["name"]]
        other_countries = [c["name"] for k, c in COUNTRIES_DATA.items() if k != code]
        options.extend(random.sample(other_countries, 3))
        random.shuffle(options)
        
        quiz.append({
            "flag": country["flag"],
            "code": code,
            "options": options,
            "correct_answer": country["name"]
        })
    
    return {"questions": quiz}


@router.get("/countries/quiz")
async def get_country_quiz(count: int = 5):
    """Get random countries for country identification game"""
    countries = random.sample(list(COUNTRIES_DATA.keys()), min(count, len(COUNTRIES_DATA)))
    
    quiz = []
    for code in countries:
        country = COUNTRIES_DATA[code]
        quiz.append({
            "name": country["name"],
            "code": code,
            "capital": country["capital"],
            "continent": country["continent"],
            "flag": country["flag"]
        })
    
    return {"questions": quiz}


@router.get("/capitals/quiz")
async def get_capital_quiz(count: int = 10):
    """Capital Connect game - match countries to capitals"""
    countries = random.sample(list(COUNTRIES_DATA.keys()), min(count, len(COUNTRIES_DATA)))
    
    quiz = []
    for code in countries:
        country = COUNTRIES_DATA[code]
        # Create multiple choice options
        options = [country["capital"]]
        other_capitals = [c["capital"] for k, c in COUNTRIES_DATA.items() if k != code]
        options.extend(random.sample(other_capitals, 3))
        random.shuffle(options)
        
        quiz.append({
            "country": country["name"],
            "flag": country["flag"],
            "code": code,
            "options": options,
            "correct_answer": country["capital"]
        })
    
    return {"questions": quiz}


@router.get("/neighbors/quiz")
async def get_neighbors_quiz(count: int = 5):
    """Neighborhood Navigator game - identify neighboring countries"""
    # Filter countries that have neighbors
    countries_with_neighbors = [k for k, v in COUNTRIES_DATA.items() if v["neighbors"]]
    
    if not countries_with_neighbors:
        return {"questions": []}
    
    selected = random.sample(countries_with_neighbors, min(count, len(countries_with_neighbors)))
    
    quiz = []
    for code in selected:
        country = COUNTRIES_DATA[code]
        neighbor_codes = country["neighbors"]
        
        # Get neighbor names
        neighbors = [COUNTRIES_DATA[n]["name"] for n in neighbor_codes if n in COUNTRIES_DATA]
        
        # Create false options
        non_neighbors = [c["name"] for k, c in COUNTRIES_DATA.items() 
                        if k not in neighbor_codes and k != code]
        
        # For each neighbor, create a true/false question
        if neighbors and non_neighbors:
            # Pick one real neighbor and one fake
            real_neighbor = random.choice(neighbors)
            fake_neighbor = random.choice(non_neighbors)
            
            # Randomly decide which to ask about
            if random.choice([True, False]):
                quiz.append({
                    "country": country["name"],
                    "flag": country["flag"],
                    "question": f"Is {real_neighbor} a neighbor of {country['name']}?",
                    "correct_answer": True
                })
            else:
                quiz.append({
                    "country": country["name"],
                    "flag": country["flag"],
                    "question": f"Is {fake_neighbor} a neighbor of {country['name']}?",
                    "correct_answer": False
                })
    
    return {"questions": quiz}


@router.get("/counties")
async def get_counties_data():
    """Get all countries data for county identification game"""
    return {
        "countries": [
            {
                "code": code,
                "name": data["name"],
                "capital": data["capital"],
                "flag": data["flag"],
                "continent": data["continent"]
            }
            for code, data in COUNTRIES_DATA.items()
        ]
    }
