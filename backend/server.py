"""
Application de génération et de suivi de plans alimentaires personnalisés
Backend FastAPI
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, date
from enum import Enum
import os
import uuid
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# MongoDB Connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "mealplan_db")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
meal_plans_collection = db["meal_plans"]
weight_logs_collection = db["weight_logs"]
foods_collection = db["foods"]
admin_collection = db["admins"]

app = FastAPI(title="MealGoal - Plans Alimentaires Personnalisés")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ENUMS ====================

class ActivityLevel(str, Enum):
    SEDENTARY = "sedentaire"
    MODERATE = "modere"
    ACTIVE = "actif"
    VERY_ACTIVE = "tres_actif"

class Goal(str, Enum):
    FAT_LOSS = "perte_de_gras"
    MAINTENANCE = "maintien"
    MUSCLE_GAIN = "prise_de_muscle"

class Gender(str, Enum):
    MALE = "homme"
    FEMALE = "femme"

class MealMode(str, Enum):
    CLASSIC = "classique"
    INTERMITTENT_FASTING = "jeune_intermittent"

class AppetiteOnWakeup(str, Enum):
    YES = "oui"
    NO = "non"
    VARIABLE = "variable"

class CopyMealPreference(str, Enum):
    LUNCH = "midi"
    DINNER = "soir"

# ==================== MODELS ====================

class FoodPreferences(BaseModel):
    carbs: List[str] = []  # pates, riz, flocons_avoine, pommes_de_terre, pain_complet
    proteins: List[str] = []  # poulet, boeuf_hache, oeufs, poisson_blanc, whey, skyr
    fats: List[str] = []  # amandes, noix, jaune_oeuf, huile_olive, beurre_cacahuete

class UserProfile(BaseModel):
    email: EmailStr
    nom: str
    prenom: str
    age: int = Field(ge=16, le=100)
    sexe: Gender
    taille_cm: int = Field(ge=100, le=250)
    poids_initial_kg: float = Field(ge=30, le=300)
    date_demarrage: str  # Format: YYYY-MM-DD
    nombre_repas: int = Field(ge=1, le=5)
    mode_alimentaire: MealMode
    fenetre_alimentaire_debut: Optional[str] = None  # Format: HH:MM (for intermittent fasting)
    fenetre_alimentaire_fin: Optional[str] = None
    niveau_activite: ActivityLevel
    objectif: Goal
    preferences: FoodPreferences
    heure_reveil: str  # Format: HH:MM
    heure_entrainement: str
    heure_coucher: str
    appetit_reveil: AppetiteOnWakeup
    preference_repas_copieux: CopyMealPreference

class UserProfileResponse(UserProfile):
    id: str
    created_at: str
    calories_journalieres: int
    proteines_g: int
    glucides_g: int
    lipides_g: int

class WeightLog(BaseModel):
    user_id: str
    poids_kg: float = Field(ge=30, le=300)
    date: str  # Format: YYYY-MM-DD

class Food(BaseModel):
    nom: str
    categorie: str  # glucides, proteines, lipides
    calories_100g: float
    proteines_100g: float
    glucides_100g: float
    lipides_100g: float
    petit_dejeuner: bool = True
    dejeuner: bool = True
    diner: bool = True
    collation: bool = True
    unite_personnalisee: Optional[str] = None  # ex: "1 oeuf", "1 tranche", None = 100g

class FoodResponse(Food):
    id: str

class MealItemEquivalent(BaseModel):
    food_id: str
    food_name: str
    quantity: str  # "150g" or "1 oeuf" depending on unite_personnalisee
    unite_personnalisee: Optional[str] = None

class MealItem(BaseModel):
    food_id: str
    food_name: str
    quantity_g: float
    quantity_display: Optional[str] = None  # "150g" or "2 oeufs"
    calories: float
    proteines: float
    glucides: float
    lipides: float
    categorie: Optional[str] = None
    equivalents: Optional[List[MealItemEquivalent]] = None  # Alternative foods

class Meal(BaseModel):
    nom: str  # petit_dejeuner, dejeuner, collation, diner
    heure: str
    items: List[MealItem]
    total_calories: float
    total_proteines: float
    total_glucides: float
    total_lipides: float

class MealPlan(BaseModel):
    user_id: str
    date: str
    meals: List[Meal]
    total_calories: float
    total_proteines: float
    total_glucides: float
    total_lipides: float
    objectif_calories: int
    objectif_proteines: int
    objectif_glucides: int
    objectif_lipides: int

class MealPlanResponse(MealPlan):
    id: str
    created_at: str

# ==================== HELPER FUNCTIONS ====================

def calculate_bmr(sexe: Gender, poids_kg: float, taille_cm: int, age: int) -> float:
    """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
    if sexe == Gender.MALE:
        return 10 * poids_kg + 6.25 * taille_cm - 5 * age + 5
    else:
        return 10 * poids_kg + 6.25 * taille_cm - 5 * age - 161

def get_activity_multiplier(niveau: ActivityLevel) -> float:
    """Get activity level multiplier for TDEE calculation"""
    multipliers = {
        ActivityLevel.SEDENTARY: 1.2,
        ActivityLevel.MODERATE: 1.375,
        ActivityLevel.ACTIVE: 1.55,
        ActivityLevel.VERY_ACTIVE: 1.725
    }
    return multipliers.get(niveau, 1.2)

def calculate_tdee(bmr: float, niveau_activite: ActivityLevel) -> float:
    """Calculate Total Daily Energy Expenditure"""
    return bmr * get_activity_multiplier(niveau_activite)

def adjust_calories_for_goal(tdee: float, objectif: Goal) -> int:
    """Adjust calories based on user's goal"""
    if objectif == Goal.FAT_LOSS:
        return int(tdee * 0.80)  # 20% deficit
    elif objectif == Goal.MUSCLE_GAIN:
        return int(tdee * 1.15)  # 15% surplus
    else:
        return int(tdee)

def calculate_macros(calories: int, objectif: Goal, poids_kg: float):
    """Calculate macronutrient distribution based on goal"""
    if objectif == Goal.FAT_LOSS:
        proteines_g = int(poids_kg * 2.2)  # High protein for fat loss
        lipides_g = int(poids_kg * 0.8)
        proteines_cal = proteines_g * 4
        lipides_cal = lipides_g * 9
        glucides_cal = calories - proteines_cal - lipides_cal
        glucides_g = int(glucides_cal / 4)
    elif objectif == Goal.MUSCLE_GAIN:
        proteines_g = int(poids_kg * 2.0)
        lipides_g = int(poids_kg * 1.0)
        proteines_cal = proteines_g * 4
        lipides_cal = lipides_g * 9
        glucides_cal = calories - proteines_cal - lipides_cal
        glucides_g = int(glucides_cal / 4)
    else:  # Maintenance
        proteines_g = int(poids_kg * 1.8)
        lipides_g = int(poids_kg * 0.9)
        proteines_cal = proteines_g * 4
        lipides_cal = lipides_g * 9
        glucides_cal = calories - proteines_cal - lipides_cal
        glucides_g = int(glucides_cal / 4)
    
    return {
        "proteines_g": max(proteines_g, 0),
        "glucides_g": max(glucides_g, 0),
        "lipides_g": max(lipides_g, 0)
    }

def init_default_foods():
    """Initialize default food database if empty"""
    if foods_collection.count_documents({}) == 0:
        default_foods = [
            # Glucides
            {"id": str(uuid.uuid4()), "nom": "Pâtes (cuites)", "categorie": "glucides", "calories_100g": 131, "proteines_100g": 5, "glucides_100g": 25, "lipides_100g": 1.1, "petit_dejeuner": False, "dejeuner": True, "diner": True, "collation": False},
            {"id": str(uuid.uuid4()), "nom": "Riz blanc (cuit)", "categorie": "glucides", "calories_100g": 130, "proteines_100g": 2.7, "glucides_100g": 28, "lipides_100g": 0.3, "petit_dejeuner": False, "dejeuner": True, "diner": True, "collation": False},
            {"id": str(uuid.uuid4()), "nom": "Flocons d'avoine", "categorie": "glucides", "calories_100g": 379, "proteines_100g": 13.5, "glucides_100g": 67.7, "lipides_100g": 6.5, "petit_dejeuner": True, "dejeuner": False, "diner": False, "collation": True},
            {"id": str(uuid.uuid4()), "nom": "Pommes de terre (cuites)", "categorie": "glucides", "calories_100g": 87, "proteines_100g": 1.9, "glucides_100g": 20.1, "lipides_100g": 0.1, "petit_dejeuner": False, "dejeuner": True, "diner": True, "collation": False},
            {"id": str(uuid.uuid4()), "nom": "Patate douce (cuite)", "categorie": "glucides", "calories_100g": 90, "proteines_100g": 2, "glucides_100g": 20.7, "lipides_100g": 0.1, "petit_dejeuner": False, "dejeuner": True, "diner": True, "collation": False},
            {"id": str(uuid.uuid4()), "nom": "Pain complet", "categorie": "glucides", "calories_100g": 247, "proteines_100g": 13, "glucides_100g": 41, "lipides_100g": 3.4, "petit_dejeuner": True, "dejeuner": True, "diner": False, "collation": True},
            {"id": str(uuid.uuid4()), "nom": "Banane", "categorie": "glucides", "calories_100g": 89, "proteines_100g": 1.1, "glucides_100g": 22.8, "lipides_100g": 0.3, "petit_dejeuner": True, "dejeuner": False, "diner": False, "collation": True},
            {"id": str(uuid.uuid4()), "nom": "Pomme", "categorie": "glucides", "calories_100g": 52, "proteines_100g": 0.3, "glucides_100g": 14, "lipides_100g": 0.2, "petit_dejeuner": True, "dejeuner": False, "diner": False, "collation": True},
            {"id": str(uuid.uuid4()), "nom": "Miel", "categorie": "glucides", "calories_100g": 304, "proteines_100g": 0.3, "glucides_100g": 82, "lipides_100g": 0, "petit_dejeuner": True, "dejeuner": False, "diner": False, "collation": True},
            
            # Protéines
            {"id": str(uuid.uuid4()), "nom": "Poulet (blanc)", "categorie": "proteines", "calories_100g": 165, "proteines_100g": 31, "glucides_100g": 0, "lipides_100g": 3.6, "petit_dejeuner": False, "dejeuner": True, "diner": True, "collation": False},
            {"id": str(uuid.uuid4()), "nom": "Boeuf haché 5%", "categorie": "proteines", "calories_100g": 137, "proteines_100g": 21, "glucides_100g": 0, "lipides_100g": 5, "petit_dejeuner": False, "dejeuner": True, "diner": True, "collation": False},
            {"id": str(uuid.uuid4()), "nom": "Oeufs entiers", "categorie": "proteines", "calories_100g": 93, "proteines_100g": 8, "glucides_100g": 0.7, "lipides_100g": 7, "petit_dejeuner": True, "dejeuner": True, "diner": True, "collation": False, "unite_personnalisee": "1 oeuf"},
            {"id": str(uuid.uuid4()), "nom": "Blanc d'oeuf", "categorie": "proteines", "calories_100g": 17, "proteines_100g": 3.6, "glucides_100g": 0.2, "lipides_100g": 0.1, "petit_dejeuner": True, "dejeuner": True, "diner": True, "collation": False, "unite_personnalisee": "1 blanc"},
            {"id": str(uuid.uuid4()), "nom": "Cabillaud", "categorie": "proteines", "calories_100g": 82, "proteines_100g": 18, "glucides_100g": 0, "lipides_100g": 0.7, "petit_dejeuner": False, "dejeuner": True, "diner": True, "collation": False},
            {"id": str(uuid.uuid4()), "nom": "Colin", "categorie": "proteines", "calories_100g": 85, "proteines_100g": 19, "glucides_100g": 0, "lipides_100g": 0.8, "petit_dejeuner": False, "dejeuner": True, "diner": True, "collation": False},
            {"id": str(uuid.uuid4()), "nom": "Whey protéine", "categorie": "proteines", "calories_100g": 400, "proteines_100g": 80, "glucides_100g": 8, "lipides_100g": 6, "petit_dejeuner": True, "dejeuner": False, "diner": False, "collation": True},
            {"id": str(uuid.uuid4()), "nom": "Skyr", "categorie": "proteines", "calories_100g": 63, "proteines_100g": 11, "glucides_100g": 4, "lipides_100g": 0.2, "petit_dejeuner": True, "dejeuner": False, "diner": False, "collation": True},
            {"id": str(uuid.uuid4()), "nom": "Fromage blanc 0%", "categorie": "proteines", "calories_100g": 45, "proteines_100g": 8, "glucides_100g": 4, "lipides_100g": 0.1, "petit_dejeuner": True, "dejeuner": False, "diner": False, "collation": True},
            
            # Lipides
            {"id": str(uuid.uuid4()), "nom": "Amandes", "categorie": "lipides", "calories_100g": 579, "proteines_100g": 21, "glucides_100g": 22, "lipides_100g": 49, "petit_dejeuner": True, "dejeuner": True, "diner": True, "collation": True},
            {"id": str(uuid.uuid4()), "nom": "Noix", "categorie": "lipides", "calories_100g": 654, "proteines_100g": 15, "glucides_100g": 14, "lipides_100g": 65, "petit_dejeuner": True, "dejeuner": True, "diner": True, "collation": True},
            {"id": str(uuid.uuid4()), "nom": "Huile d'olive", "categorie": "lipides", "calories_100g": 884, "proteines_100g": 0, "glucides_100g": 0, "lipides_100g": 100, "petit_dejeuner": False, "dejeuner": True, "diner": True, "collation": False},
            {"id": str(uuid.uuid4()), "nom": "Beurre de cacahuète", "categorie": "lipides", "calories_100g": 588, "proteines_100g": 25, "glucides_100g": 20, "lipides_100g": 50, "petit_dejeuner": True, "dejeuner": False, "diner": False, "collation": True},
            {"id": str(uuid.uuid4()), "nom": "Huile de coco", "categorie": "lipides", "calories_100g": 862, "proteines_100g": 0, "glucides_100g": 0, "lipides_100g": 100, "petit_dejeuner": False, "dejeuner": True, "diner": True, "collation": False},
            {"id": str(uuid.uuid4()), "nom": "Avocat", "categorie": "lipides", "calories_100g": 160, "proteines_100g": 2, "glucides_100g": 9, "lipides_100g": 15, "petit_dejeuner": True, "dejeuner": True, "diner": True, "collation": True},
        ]
        foods_collection.insert_many(default_foods)

# Initialize foods on startup
init_default_foods()

def get_user_preferred_foods(preferences: FoodPreferences):
    """Get foods based on user preferences"""
    preferred_foods = {"glucides": [], "proteines": [], "lipides": []}
    
    # Map preference keys to food names
    carb_map = {
        "pates": "Pâtes (cuites)",
        "riz": "Riz blanc (cuit)",
        "flocons_avoine": "Flocons d'avoine",
        "pommes_de_terre": "Pommes de terre (cuites)",
        "patates_douces": "Patate douce (cuite)",
        "pain_complet": "Pain complet"
    }
    
    protein_map = {
        "poulet": "Poulet (blanc)",
        "boeuf_hache": "Boeuf haché 5%",
        "oeufs": "Oeufs entiers",
        "poisson_blanc": "Cabillaud",
        "whey": "Whey protéine",
        "skyr": "Skyr"
    }
    
    fat_map = {
        "amandes": "Amandes",
        "noix": "Noix",
        "huile_olive": "Huile d'olive",
        "beurre_cacahuete": "Beurre de cacahuète"
    }
    
    for pref in preferences.carbs:
        if pref in carb_map:
            food = foods_collection.find_one({"nom": carb_map[pref]})
            if food:
                preferred_foods["glucides"].append(food)
    
    for pref in preferences.proteins:
        if pref in protein_map:
            food = foods_collection.find_one({"nom": protein_map[pref]})
            if food:
                preferred_foods["proteines"].append(food)
    
    for pref in preferences.fats:
        if pref in fat_map:
            food = foods_collection.find_one({"nom": fat_map[pref]})
            if food:
                preferred_foods["lipides"].append(food)
    
    return preferred_foods

def time_to_minutes(time_str: str) -> int:
    """Convert HH:MM to minutes from midnight"""
    parts = time_str.split(":")
    return int(parts[0]) * 60 + int(parts[1])

def minutes_to_time(minutes: int) -> str:
    """Convert minutes from midnight to HH:MM"""
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"

def generate_meal_schedule(user: dict) -> List[dict]:
    """Generate meal schedule based on user preferences and constraints"""
    nombre_repas = user["nombre_repas"]
    mode = user["mode_alimentaire"]
    heure_reveil = time_to_minutes(user["heure_reveil"])
    heure_entrainement = time_to_minutes(user["heure_entrainement"])
    heure_coucher = time_to_minutes(user["heure_coucher"])
    appetit_reveil = user["appetit_reveil"]
    pref_copieux = user["preference_repas_copieux"]
    
    meals = []
    meal_names = ["Petit-déjeuner", "Déjeuner", "Collation", "Dîner", "Collation tardive"]
    
    if mode == "jeune_intermittent":
        fenetre_debut = time_to_minutes(user.get("fenetre_alimentaire_debut", "12:00"))
        fenetre_fin = time_to_minutes(user.get("fenetre_alimentaire_fin", "20:00"))
        
        # Distribute meals within fasting window
        window_duration = fenetre_fin - fenetre_debut
        interval = window_duration // (nombre_repas + 1)
        
        for i in range(nombre_repas):
            meal_time = fenetre_debut + interval * (i + 1)
            # Ensure no meal within 3 hours of bedtime
            if meal_time <= heure_coucher - 180:
                meals.append({
                    "nom": f"Repas {i + 1}",
                    "heure": minutes_to_time(meal_time),
                    "is_main": (pref_copieux == "midi" and i == 0) or (pref_copieux == "soir" and i == nombre_repas - 1)
                })
    else:
        # Classic mode
        available_start = heure_reveil + 30 if appetit_reveil != "non" else heure_reveil + 120
        available_end = heure_coucher - 180  # No meal 3h before bed
        
        # Calculate pre-training meal time (3h before)
        pre_training_time = heure_entrainement - 180
        
        available_duration = available_end - available_start
        interval = available_duration // (nombre_repas + 1)
        
        for i in range(nombre_repas):
            meal_time = available_start + interval * (i + 1)
            
            # Determine meal name based on time
            if meal_time < 660:  # Before 11:00
                nom = "Petit-déjeuner"
            elif meal_time < 840:  # Before 14:00
                nom = "Déjeuner"
            elif meal_time < 1020:  # Before 17:00
                nom = "Collation"
            else:
                nom = "Dîner"
            
            # Check if this should be the main meal (3h before training)
            is_main = abs(meal_time - pre_training_time) < 60
            if not is_main:
                is_main = (pref_copieux == "midi" and nom == "Déjeuner") or (pref_copieux == "soir" and nom == "Dîner")
            
            meals.append({
                "nom": nom,
                "heure": minutes_to_time(meal_time),
                "is_main": is_main
            })
    
    return meals

def generate_meal_plan(user: dict, target_date: str) -> dict:
    """Generate a complete meal plan for a user"""
    preferences = FoodPreferences(**user["preferences"])
    preferred_foods = get_user_preferred_foods(preferences)
    
    # Get caloric targets
    calories_target = user["calories_journalieres"]
    proteines_target = user["proteines_g"]
    glucides_target = user["glucides_g"]
    lipides_target = user["lipides_g"]
    
    # Generate meal schedule
    meal_schedule = generate_meal_schedule(user)
    
    # Calculate calories per meal
    main_meal_count = sum(1 for m in meal_schedule if m["is_main"])
    regular_meal_count = len(meal_schedule) - main_meal_count
    
    if main_meal_count > 0:
        main_meal_calories = calories_target * 0.35
        remaining_calories = calories_target - (main_meal_calories * main_meal_count)
        regular_meal_calories = remaining_calories / max(regular_meal_count, 1)
    else:
        regular_meal_calories = calories_target / len(meal_schedule)
        main_meal_calories = regular_meal_calories
    
    meals = []
    total_cal = 0
    total_prot = 0
    total_carb = 0
    total_fat = 0
    
    for schedule in meal_schedule:
        meal_calories = main_meal_calories if schedule["is_main"] else regular_meal_calories
        meal_items = []
        meal_prot = 0
        meal_carb = 0
        meal_fat = 0
        meal_cal = 0
        
        # Distribute macros for this meal
        meal_prot_target = proteines_target / len(meal_schedule)
        meal_carb_target = glucides_target / len(meal_schedule)
        meal_fat_target = lipides_target / len(meal_schedule)
        
        if schedule["is_main"]:
            meal_prot_target *= 1.3
            meal_carb_target *= 1.3
            meal_fat_target *= 1.3
        
        # Add protein source
        if preferred_foods["proteines"]:
            protein_food = preferred_foods["proteines"][len(meals) % len(preferred_foods["proteines"])]
            quantity = (meal_prot_target / protein_food["proteines_100g"]) * 100
            quantity = round(quantity / 10) * 10  # Round to nearest 10g
            
            item_cal = (protein_food["calories_100g"] / 100) * quantity
            item_prot = (protein_food["proteines_100g"] / 100) * quantity
            item_carb = (protein_food["glucides_100g"] / 100) * quantity
            item_fat = (protein_food["lipides_100g"] / 100) * quantity
            
            meal_items.append({
                "food_id": protein_food["id"],
                "food_name": protein_food["nom"],
                "quantity_g": quantity,
                "calories": round(item_cal, 1),
                "proteines": round(item_prot, 1),
                "glucides": round(item_carb, 1),
                "lipides": round(item_fat, 1)
            })
            meal_cal += item_cal
            meal_prot += item_prot
            meal_carb += item_carb
            meal_fat += item_fat
        
        # Add carb source
        if preferred_foods["glucides"]:
            carb_food = preferred_foods["glucides"][len(meals) % len(preferred_foods["glucides"])]
            remaining_carb = meal_carb_target - meal_carb
            if remaining_carb > 0:
                quantity = (remaining_carb / carb_food["glucides_100g"]) * 100
                quantity = round(quantity / 10) * 10
                
                item_cal = (carb_food["calories_100g"] / 100) * quantity
                item_prot = (carb_food["proteines_100g"] / 100) * quantity
                item_carb = (carb_food["glucides_100g"] / 100) * quantity
                item_fat = (carb_food["lipides_100g"] / 100) * quantity
                
                meal_items.append({
                    "food_id": carb_food["id"],
                    "food_name": carb_food["nom"],
                    "quantity_g": quantity,
                    "calories": round(item_cal, 1),
                    "proteines": round(item_prot, 1),
                    "glucides": round(item_carb, 1),
                    "lipides": round(item_fat, 1)
                })
                meal_cal += item_cal
                meal_prot += item_prot
                meal_carb += item_carb
                meal_fat += item_fat
        
        # Add fat source
        if preferred_foods["lipides"]:
            fat_food = preferred_foods["lipides"][len(meals) % len(preferred_foods["lipides"])]
            remaining_fat = meal_fat_target - meal_fat
            if remaining_fat > 0:
                quantity = (remaining_fat / fat_food["lipides_100g"]) * 100
                quantity = round(quantity / 5) * 5  # Round to nearest 5g for fats
                quantity = min(quantity, 30)  # Cap fat portions
                
                item_cal = (fat_food["calories_100g"] / 100) * quantity
                item_prot = (fat_food["proteines_100g"] / 100) * quantity
                item_carb = (fat_food["glucides_100g"] / 100) * quantity
                item_fat = (fat_food["lipides_100g"] / 100) * quantity
                
                meal_items.append({
                    "food_id": fat_food["id"],
                    "food_name": fat_food["nom"],
                    "quantity_g": quantity,
                    "calories": round(item_cal, 1),
                    "proteines": round(item_prot, 1),
                    "glucides": round(item_carb, 1),
                    "lipides": round(item_fat, 1)
                })
                meal_cal += item_cal
                meal_prot += item_prot
                meal_carb += item_carb
                meal_fat += item_fat
        
        meals.append({
            "nom": schedule["nom"],
            "heure": schedule["heure"],
            "items": meal_items,
            "total_calories": round(meal_cal, 1),
            "total_proteines": round(meal_prot, 1),
            "total_glucides": round(meal_carb, 1),
            "total_lipides": round(meal_fat, 1)
        })
        
        total_cal += meal_cal
        total_prot += meal_prot
        total_carb += meal_carb
        total_fat += meal_fat
    
    return {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "date": target_date,
        "meals": meals,
        "total_calories": round(total_cal, 1),
        "total_proteines": round(total_prot, 1),
        "total_glucides": round(total_carb, 1),
        "total_lipides": round(total_fat, 1),
        "objectif_calories": calories_target,
        "objectif_proteines": proteines_target,
        "objectif_glucides": glucides_target,
        "objectif_lipides": lipides_target,
        "created_at": datetime.now().isoformat()
    }

# ==================== API ENDPOINTS ====================

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ==================== USER ENDPOINTS ====================

@app.post("/api/users", response_model=UserProfileResponse)
async def create_user(user: UserProfile):
    """Create a new user profile and calculate nutritional targets"""
    
    # Check if email already exists
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")
    
    # Calculate BMR and TDEE
    bmr = calculate_bmr(user.sexe, user.poids_initial_kg, user.taille_cm, user.age)
    tdee = calculate_tdee(bmr, user.niveau_activite)
    calories = adjust_calories_for_goal(tdee, user.objectif)
    macros = calculate_macros(calories, user.objectif, user.poids_initial_kg)
    
    user_data = user.model_dump()
    user_data["id"] = str(uuid.uuid4())
    user_data["created_at"] = datetime.now().isoformat()
    user_data["calories_journalieres"] = calories
    user_data["proteines_g"] = macros["proteines_g"]
    user_data["glucides_g"] = macros["glucides_g"]
    user_data["lipides_g"] = macros["lipides_g"]
    
    users_collection.insert_one(user_data)
    
    # Create initial weight log
    weight_log = {
        "id": str(uuid.uuid4()),
        "user_id": user_data["id"],
        "poids_kg": user.poids_initial_kg,
        "date": user.date_demarrage,
        "created_at": datetime.now().isoformat()
    }
    weight_logs_collection.insert_one(weight_log)
    
    return UserProfileResponse(**user_data)

@app.get("/api/users/{user_id}", response_model=UserProfileResponse)
async def get_user(user_id: str):
    """Get user profile by ID"""
    user = users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return UserProfileResponse(**user)

@app.get("/api/users/email/{email}", response_model=UserProfileResponse)
async def get_user_by_email(email: str):
    """Get user profile by email"""
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return UserProfileResponse(**user)

@app.put("/api/users/{user_id}", response_model=UserProfileResponse)
async def update_user(user_id: str, user: UserProfile):
    """Update user profile and recalculate nutritional targets"""
    existing = users_collection.find_one({"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Recalculate nutritional targets
    bmr = calculate_bmr(user.sexe, user.poids_initial_kg, user.taille_cm, user.age)
    tdee = calculate_tdee(bmr, user.niveau_activite)
    calories = adjust_calories_for_goal(tdee, user.objectif)
    macros = calculate_macros(calories, user.objectif, user.poids_initial_kg)
    
    user_data = user.model_dump()
    user_data["id"] = user_id
    user_data["created_at"] = existing["created_at"]
    user_data["calories_journalieres"] = calories
    user_data["proteines_g"] = macros["proteines_g"]
    user_data["glucides_g"] = macros["glucides_g"]
    user_data["lipides_g"] = macros["lipides_g"]
    
    users_collection.update_one({"id": user_id}, {"$set": user_data})
    
    return UserProfileResponse(**user_data)

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str):
    """Delete a user and all associated data"""
    existing = users_collection.find_one({"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Delete user
    users_collection.delete_one({"id": user_id})
    
    # Delete associated weight logs
    weight_logs_collection.delete_many({"user_id": user_id})
    
    # Delete associated meal plans
    meal_plans_collection.delete_many({"user_id": user_id})
    
    return {"message": "Utilisateur et données associées supprimés"}

@app.get("/api/users")
async def list_users():
    """List all users (admin)"""
    users = list(users_collection.find({}, {"_id": 0}))
    return users

# ==================== MEAL PLAN ENDPOINTS ====================

@app.post("/api/meal-plans/{user_id}")
async def create_meal_plan(user_id: str, target_date: str = Query(default=None)):
    """Generate a meal plan for a user"""
    user = users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if not target_date:
        target_date = date.today().isoformat()
    
    # Check if plan already exists for this date
    existing = meal_plans_collection.find_one({"user_id": user_id, "date": target_date})
    if existing:
        return existing
    
    meal_plan = generate_meal_plan(user, target_date)
    meal_plans_collection.insert_one(meal_plan)
    
    # Remove MongoDB _id from response
    meal_plan.pop("_id", None)
    return meal_plan

@app.get("/api/meal-plans/{user_id}")
async def get_meal_plans(user_id: str, date_from: str = None, date_to: str = None, limit: int = 30):
    """Get meal plans for a user with history"""
    query = {"user_id": user_id}
    if date_from and date_to:
        query["date"] = {"$gte": date_from, "$lte": date_to}
    elif date_from:
        query["date"] = {"$gte": date_from}
    
    plans = list(meal_plans_collection.find(query, {"_id": 0}).sort("date", -1).limit(limit))
    return plans

@app.put("/api/meal-plans/{plan_id}")
async def update_meal_plan(plan_id: str, updated_plan: dict):
    """Update a meal plan (admin modification)"""
    existing = meal_plans_collection.find_one({"id": plan_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Plan alimentaire non trouvé")
    
    # Recalculate totals from meals
    total_calories = 0
    total_proteines = 0
    total_glucides = 0
    total_lipides = 0
    
    for meal in updated_plan.get("meals", []):
        meal_cal = 0
        meal_prot = 0
        meal_carb = 0
        meal_fat = 0
        
        for item in meal.get("items", []):
            meal_cal += item.get("calories", 0)
            meal_prot += item.get("proteines", 0)
            meal_carb += item.get("glucides", 0)
            meal_fat += item.get("lipides", 0)
        
        meal["total_calories"] = round(meal_cal, 1)
        meal["total_proteines"] = round(meal_prot, 1)
        meal["total_glucides"] = round(meal_carb, 1)
        meal["total_lipides"] = round(meal_fat, 1)
        
        total_calories += meal_cal
        total_proteines += meal_prot
        total_glucides += meal_carb
        total_lipides += meal_fat
    
    updated_plan["total_calories"] = round(total_calories, 1)
    updated_plan["total_proteines"] = round(total_proteines, 1)
    updated_plan["total_glucides"] = round(total_glucides, 1)
    updated_plan["total_lipides"] = round(total_lipides, 1)
    updated_plan["modified_at"] = datetime.now().isoformat()
    updated_plan["modified_by_admin"] = True
    
    # Preserve original fields
    updated_plan["id"] = plan_id
    updated_plan["user_id"] = existing["user_id"]
    updated_plan["date"] = existing["date"]
    updated_plan["created_at"] = existing["created_at"]
    updated_plan["objectif_calories"] = existing["objectif_calories"]
    updated_plan["objectif_proteines"] = existing["objectif_proteines"]
    updated_plan["objectif_glucides"] = existing["objectif_glucides"]
    updated_plan["objectif_lipides"] = existing["objectif_lipides"]
    
    meal_plans_collection.update_one({"id": plan_id}, {"$set": updated_plan})
    updated_plan.pop("_id", None)
    return updated_plan

@app.delete("/api/meal-plans/{plan_id}")
async def delete_meal_plan(plan_id: str):
    """Delete a meal plan"""
    result = meal_plans_collection.delete_one({"id": plan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan alimentaire non trouvé")
    return {"message": "Plan supprimé"}

@app.post("/api/meal-plans/{user_id}/regenerate")
async def regenerate_meal_plan(user_id: str, target_date: str = Query(default=None)):
    """Regenerate a meal plan for a specific date"""
    user = users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if not target_date:
        target_date = date.today().isoformat()
    
    # Delete existing plan for this date
    meal_plans_collection.delete_one({"user_id": user_id, "date": target_date})
    
    # Generate new plan
    meal_plan = generate_meal_plan(user, target_date)
    meal_plans_collection.insert_one(meal_plan)
    meal_plan.pop("_id", None)
    return meal_plan

@app.get("/api/meal-plans/{user_id}/today")
async def get_today_meal_plan(user_id: str):
    """Get or generate today's meal plan"""
    user = users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    today = date.today().isoformat()
    existing = meal_plans_collection.find_one({"user_id": user_id, "date": today})
    
    if existing:
        existing.pop("_id", None)
        return existing
    
    meal_plan = generate_meal_plan(user, today)
    meal_plans_collection.insert_one(meal_plan)
    meal_plan.pop("_id", None)
    return meal_plan

# ==================== WEIGHT LOG ENDPOINTS ====================

@app.post("/api/weight-logs")
async def create_weight_log(log: WeightLog):
    """Log a weight entry"""
    user = users_collection.find_one({"id": log.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Check if log exists for this date
    existing = weight_logs_collection.find_one({"user_id": log.user_id, "date": log.date})
    if existing:
        # Update existing
        weight_logs_collection.update_one(
            {"user_id": log.user_id, "date": log.date},
            {"$set": {"poids_kg": log.poids_kg}}
        )
        existing["poids_kg"] = log.poids_kg
        existing.pop("_id", None)
        return existing
    
    log_data = log.model_dump()
    log_data["id"] = str(uuid.uuid4())
    log_data["created_at"] = datetime.now().isoformat()
    
    weight_logs_collection.insert_one(log_data)
    log_data.pop("_id", None)
    return log_data

@app.get("/api/weight-logs/{user_id}")
async def get_weight_logs(user_id: str):
    """Get all weight logs for a user"""
    logs = list(weight_logs_collection.find({"user_id": user_id}, {"_id": 0}).sort("date", 1))
    return logs

@app.get("/api/weight-logs/{user_id}/stats")
async def get_weight_stats(user_id: str):
    """Get weight statistics for a user"""
    user = users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    logs = list(weight_logs_collection.find({"user_id": user_id}, {"_id": 0}).sort("date", 1))
    
    if not logs:
        return {
            "poids_initial": user["poids_initial_kg"],
            "poids_actuel": user["poids_initial_kg"],
            "evolution": 0,
            "tendance": "stable",
            "historique": []
        }
    
    poids_initial = logs[0]["poids_kg"]
    poids_actuel = logs[-1]["poids_kg"]
    evolution = poids_actuel - poids_initial
    
    # Determine trend
    if len(logs) >= 2:
        recent_change = logs[-1]["poids_kg"] - logs[-2]["poids_kg"]
        if recent_change < -0.3:
            tendance = "baisse"
        elif recent_change > 0.3:
            tendance = "hausse"
        else:
            tendance = "stable"
    else:
        tendance = "stable"
    
    return {
        "poids_initial": poids_initial,
        "poids_actuel": poids_actuel,
        "evolution": round(evolution, 1),
        "tendance": tendance,
        "historique": logs
    }

# ==================== FOOD ENDPOINTS ====================

@app.get("/api/foods")
async def list_foods():
    """List all foods in the database"""
    foods = list(foods_collection.find({}, {"_id": 0}))
    return foods

@app.post("/api/foods", response_model=FoodResponse)
async def create_food(food: Food):
    """Add a new food to the database (admin)"""
    food_data = food.model_dump()
    food_data["id"] = str(uuid.uuid4())
    foods_collection.insert_one(food_data)
    return FoodResponse(**food_data)

@app.put("/api/foods/{food_id}", response_model=FoodResponse)
async def update_food(food_id: str, food: Food):
    """Update a food in the database (admin)"""
    existing = foods_collection.find_one({"id": food_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Aliment non trouvé")
    
    food_data = food.model_dump()
    food_data["id"] = food_id
    foods_collection.update_one({"id": food_id}, {"$set": food_data})
    return FoodResponse(**food_data)

@app.delete("/api/foods/{food_id}")
async def delete_food(food_id: str):
    """Delete a food from the database (admin)"""
    result = foods_collection.delete_one({"id": food_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Aliment non trouvé")
    return {"message": "Aliment supprimé"}

# ==================== ADMIN ENDPOINTS ====================

@app.get("/api/admin/stats")
async def get_admin_stats():
    """Get comprehensive admin dashboard statistics"""
    from datetime import timedelta
    
    today = date.today()
    two_weeks_ago = (today - timedelta(days=14)).isoformat()
    one_month_ago = (today - timedelta(days=30)).isoformat()
    one_week_ago = (today - timedelta(days=7)).isoformat()
    
    # Basic counts
    total_users = users_collection.count_documents({})
    users = list(users_collection.find({}, {"_id": 0}))
    
    # New clients this month
    new_clients_month = users_collection.count_documents({
        "created_at": {"$gte": one_month_ago}
    })
    
    # Goal distribution
    goal_pipeline = [
        {"$group": {"_id": "$objectif", "count": {"$sum": 1}}}
    ]
    goal_distribution = list(users_collection.aggregate(goal_pipeline))
    
    # Analyze each client
    clients_needing_followup = []  # No weigh-in for 14+ days
    clients_on_track = []  # Progressing well
    clients_struggling = []  # Not progressing as expected
    clients_success = []  # Reached their goal
    recent_weigh_ins = []  # Last 7 days
    recent_registrations = []  # Last 7 days
    
    for user in users:
        user_id = user["id"]
        logs = list(weight_logs_collection.find({"user_id": user_id}, {"_id": 0}).sort("date", 1))
        
        user_summary = {
            "id": user_id,
            "nom": user["nom"],
            "prenom": user["prenom"],
            "objectif": user["objectif"],
            "poids_initial": user["poids_initial_kg"],
            "calories": user["calories_journalieres"]
        }
        
        if logs:
            last_log = logs[-1]
            first_log = logs[0]
            user_summary["poids_actuel"] = last_log["poids_kg"]
            user_summary["derniere_pesee"] = last_log["date"]
            user_summary["evolution"] = round(last_log["poids_kg"] - first_log["poids_kg"], 1)
            user_summary["nombre_pesees"] = len(logs)
            
            # Check if needs follow-up (no weigh-in for 14+ days)
            if last_log["date"] < two_weeks_ago:
                days_since = (today - date.fromisoformat(last_log["date"])).days
                user_summary["jours_sans_pesee"] = days_since
                clients_needing_followup.append(user_summary)
            
            # Check recent weigh-ins (last 7 days)
            if last_log["date"] >= one_week_ago:
                recent_weigh_ins.append({
                    **user_summary,
                    "date_pesee": last_log["date"],
                    "poids": last_log["poids_kg"]
                })
            
            # Analyze progression based on goal
            evolution = last_log["poids_kg"] - first_log["poids_kg"]
            objectif = user["objectif"]
            
            if objectif == "perte_de_gras":
                if evolution <= -2:  # Lost 2kg or more = on track
                    clients_on_track.append(user_summary)
                elif evolution >= 0:  # Gained or stable = struggling
                    clients_struggling.append(user_summary)
                if evolution <= -5:  # Lost 5kg+ = success
                    clients_success.append(user_summary)
            elif objectif == "prise_de_muscle":
                if evolution >= 2:  # Gained 2kg or more = on track
                    clients_on_track.append(user_summary)
                elif evolution <= 0:  # Lost or stable = struggling
                    clients_struggling.append(user_summary)
                if evolution >= 5:  # Gained 5kg+ = success
                    clients_success.append(user_summary)
            else:  # Maintien
                if abs(evolution) <= 1:  # Stable within 1kg = on track
                    clients_on_track.append(user_summary)
                else:
                    clients_struggling.append(user_summary)
        else:
            user_summary["poids_actuel"] = user["poids_initial_kg"]
            user_summary["derniere_pesee"] = None
            user_summary["evolution"] = 0
            user_summary["nombre_pesees"] = 0
            user_summary["jours_sans_pesee"] = (today - date.fromisoformat(user.get("date_demarrage", today.isoformat()))).days
            if user_summary["jours_sans_pesee"] > 0:
                clients_needing_followup.append(user_summary)
        
        # Check recent registrations
        if user.get("created_at", "") >= one_week_ago:
            recent_registrations.append(user_summary)
    
    # Sort lists
    clients_needing_followup.sort(key=lambda x: x.get("jours_sans_pesee", 0), reverse=True)
    recent_weigh_ins.sort(key=lambda x: x.get("date_pesee", ""), reverse=True)
    
    return {
        "overview": {
            "total_clients": total_users,
            "nouveaux_ce_mois": new_clients_month,
            "en_attente_pesee": len(clients_needing_followup),
            "en_bonne_voie": len(clients_on_track),
            "en_difficulte": len(clients_struggling),
            "objectif_atteint": len(clients_success)
        },
        "distribution_objectifs": {item["_id"]: item["count"] for item in goal_distribution},
        "alertes": {
            "clients_a_relancer": clients_needing_followup[:10],  # Top 10
            "clients_en_difficulte": clients_struggling[:5]
        },
        "progression": {
            "en_bonne_voie": clients_on_track[:5],
            "succes": clients_success[:5]
        },
        "activite_recente": {
            "dernieres_pesees": recent_weigh_ins[:8],
            "nouveaux_clients": recent_registrations[:5]
        }
    }

@app.get("/api/admin/users")
async def get_all_users_admin():
    """Get all users with their stats (admin)"""
    users = list(users_collection.find({}, {"_id": 0}))
    
    for user in users:
        logs = list(weight_logs_collection.find({"user_id": user["id"]}, {"_id": 0}).sort("date", 1))
        if logs:
            user["poids_actuel"] = logs[-1]["poids_kg"]
            user["evolution_poids"] = round(logs[-1]["poids_kg"] - logs[0]["poids_kg"], 1)
            user["nombre_pesees"] = len(logs)
        else:
            user["poids_actuel"] = user["poids_initial_kg"]
            user["evolution_poids"] = 0
            user["nombre_pesees"] = 0
    
    return users

# ==================== NUTRITIONAL RULES ENDPOINT ====================

@app.get("/api/nutritional-rules")
async def get_nutritional_rules():
    """Get the golden nutritional rules"""
    return {
        "regles": [
            {
                "titre": "Cuisson",
                "description": "Pas de cuisson avec huile d'olive, beurre ou huile de tournesol. Favoriser exclusivement l'huile de coco."
            },
            {
                "titre": "Hydratation",
                "description": "Boire minimum 3L d'eau par jour."
            },
            {
                "titre": "Viande rouge",
                "description": "Maximum 2 fois par semaine."
            },
            {
                "titre": "Sel",
                "description": "2 à 3g de sel rose par jour."
            },
            {
                "titre": "Café",
                "description": "Maximum 2 cafés par jour. Privilégier le thé si consommation de boisson chaude."
            },
            {
                "titre": "À éviter",
                "description": "Éviter au maximum les boissons gazeuses, fritures et aliments très piquants."
            },
            {
                "titre": "Boissons ZERO",
                "description": "Autorisées avec modération."
            },
            {
                "titre": "Assaisonnements",
                "description": "Autorisés : poivre, cannelle, curcuma."
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
