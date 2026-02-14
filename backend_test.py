#!/usr/bin/env python3
"""
Backend API Testing for MealGoal Application
Tests all backend endpoints with realistic data
"""

import requests
import json
import uuid
from datetime import datetime, date
import sys

# Base URL from frontend environment
BASE_URL = "https://macro-planner-5.preview.emergentagent.com/api"

class MealGoalTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_user_id = None
        self.test_email = f"marie.dupont.{uuid.uuid4().hex[:8]}@gmail.com"
        self.results = {
            "health_check": False,
            "user_creation": False,
            "user_retrieval": False,
            "meal_plan_generation": False,
            "today_meal_plan": False,
            "weight_logging": False,
            "weight_stats": False,
            "foods_list": False,
            "admin_stats": False,
            "nutritional_rules": False,
            "duplicate_email_handling": False
        }
        self.errors = []

    def log_error(self, test_name, error):
        error_msg = f"❌ {test_name}: {str(error)}"
        self.errors.append(error_msg)
        print(error_msg)

    def log_success(self, test_name, details=""):
        success_msg = f"✅ {test_name}"
        if details:
            success_msg += f": {details}"
        print(success_msg)

    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.results["health_check"] = True
                    self.log_success("Health Check", f"Status: {data.get('status')}")
                else:
                    self.log_error("Health Check", f"Unexpected status: {data}")
            else:
                self.log_error("Health Check", f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_error("Health Check", e)

    def test_user_creation(self):
        """Test user creation with calorie calculation"""
        try:
            user_data = {
                "email": self.test_email,
                "nom": "Dupont",
                "prenom": "Marie",
                "age": 28,
                "sexe": "femme",
                "taille_cm": 165,
                "poids_initial_kg": 68.5,
                "date_demarrage": "2026-01-17",
                "nombre_repas": 4,
                "mode_alimentaire": "classique",
                "niveau_activite": "actif",
                "objectif": "perte_de_gras",
                "preferences": {
                    "carbs": ["riz", "flocons_avoine", "patates_douces"],
                    "proteins": ["poulet", "oeufs", "skyr"],
                    "fats": ["amandes", "huile_olive"]
                },
                "heure_reveil": "06:30",
                "heure_entrainement": "18:30",
                "heure_coucher": "22:30",
                "appetit_reveil": "variable",
                "preference_repas_copieux": "soir"
            }

            response = requests.post(f"{self.base_url}/users", json=user_data, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                self.test_user_id = data.get("id")
                
                # Verify calorie calculation
                expected_bmr = 10 * 68.5 + 6.25 * 165 - 5 * 28 - 161  # Female BMR formula
                expected_tdee = expected_bmr * 1.55  # Active level
                expected_calories = int(expected_tdee * 0.80)  # Fat loss (20% deficit)
                
                actual_calories = data.get("calories_journalieres")
                
                if abs(actual_calories - expected_calories) <= 50:  # Allow 50 cal tolerance
                    self.results["user_creation"] = True
                    self.log_success("User Creation", 
                        f"ID: {self.test_user_id}, Calories: {actual_calories} (expected ~{expected_calories})")
                else:
                    self.log_error("User Creation", 
                        f"Calorie calculation incorrect: got {actual_calories}, expected ~{expected_calories}")
                
                # Verify macros are calculated
                if not (data.get("proteines_g") and data.get("glucides_g") and data.get("lipides_g")):
                    self.log_error("User Creation", "Missing macro calculations")
                    
            else:
                self.log_error("User Creation", f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_error("User Creation", e)

    def test_duplicate_email(self):
        """Test duplicate email handling"""
        if not self.test_user_id:
            self.log_error("Duplicate Email Test", "No test user created, skipping")
            return
            
        try:
            # Try to create user with same email
            duplicate_data = {
                "email": self.test_email,
                "nom": "Test",
                "prenom": "Duplicate",
                "age": 25,
                "sexe": "homme",
                "taille_cm": 180,
                "poids_initial_kg": 75,
                "date_demarrage": "2026-01-17",
                "nombre_repas": 3,
                "mode_alimentaire": "classique",
                "niveau_activite": "modere",
                "objectif": "maintien",
                "preferences": {
                    "carbs": ["riz"],
                    "proteins": ["poulet"],
                    "fats": ["amandes"]
                },
                "heure_reveil": "07:00",
                "heure_entrainement": "18:00",
                "heure_coucher": "23:00",
                "appetit_reveil": "oui",
                "preference_repas_copieux": "midi"
            }

            response = requests.post(f"{self.base_url}/users", json=duplicate_data, timeout=10)
            
            if response.status_code == 400:
                self.results["duplicate_email_handling"] = True
                self.log_success("Duplicate Email Handling", "Correctly rejected duplicate email")
            else:
                self.log_error("Duplicate Email Handling", 
                    f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_error("Duplicate Email Handling", e)

    def test_user_retrieval(self):
        """Test user retrieval by ID"""
        if not self.test_user_id:
            self.log_error("User Retrieval", "No test user ID available")
            return
            
        try:
            response = requests.get(f"{self.base_url}/users/{self.test_user_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == self.test_user_id and data.get("email") == self.test_email:
                    self.results["user_retrieval"] = True
                    self.log_success("User Retrieval", f"Retrieved user: {data.get('prenom')} {data.get('nom')}")
                else:
                    self.log_error("User Retrieval", "User data mismatch")
            else:
                self.log_error("User Retrieval", f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_error("User Retrieval", e)

    def test_meal_plan_generation(self):
        """Test meal plan generation"""
        if not self.test_user_id:
            self.log_error("Meal Plan Generation", "No test user ID available")
            return
            
        try:
            target_date = "2026-01-20"
            response = requests.post(f"{self.base_url}/meal-plans/{self.test_user_id}?target_date={target_date}", timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify meal plan structure
                if (data.get("meals") and 
                    data.get("total_calories") and 
                    data.get("objectif_calories") and
                    len(data.get("meals", [])) > 0):
                    
                    # Check if meals have proper structure
                    first_meal = data["meals"][0]
                    if (first_meal.get("nom") and 
                        first_meal.get("heure") and 
                        first_meal.get("items") and
                        len(first_meal.get("items", [])) > 0):
                        
                        self.results["meal_plan_generation"] = True
                        self.log_success("Meal Plan Generation", 
                            f"Generated {len(data['meals'])} meals, {data['total_calories']} total calories")
                    else:
                        self.log_error("Meal Plan Generation", "Invalid meal structure")
                else:
                    self.log_error("Meal Plan Generation", "Missing required meal plan fields")
            else:
                self.log_error("Meal Plan Generation", f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_error("Meal Plan Generation", e)

    def test_today_meal_plan(self):
        """Test today's meal plan endpoint"""
        if not self.test_user_id:
            self.log_error("Today Meal Plan", "No test user ID available")
            return
            
        try:
            response = requests.get(f"{self.base_url}/meal-plans/{self.test_user_id}/today", timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("meals") and data.get("date"):
                    self.results["today_meal_plan"] = True
                    self.log_success("Today Meal Plan", f"Date: {data['date']}, Meals: {len(data['meals'])}")
                else:
                    self.log_error("Today Meal Plan", "Invalid meal plan structure")
            else:
                self.log_error("Today Meal Plan", f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_error("Today Meal Plan", e)

    def test_weight_logging(self):
        """Test weight logging"""
        if not self.test_user_id:
            self.log_error("Weight Logging", "No test user ID available")
            return
            
        try:
            weight_data = {
                "user_id": self.test_user_id,
                "poids_kg": 67.8,
                "date": "2026-01-18"
            }
            
            response = requests.post(f"{self.base_url}/weight-logs", json=weight_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("poids_kg") == 67.8 and data.get("user_id") == self.test_user_id:
                    self.results["weight_logging"] = True
                    self.log_success("Weight Logging", f"Logged weight: {data['poids_kg']}kg on {data['date']}")
                else:
                    self.log_error("Weight Logging", "Weight data mismatch")
            else:
                self.log_error("Weight Logging", f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_error("Weight Logging", e)

    def test_weight_stats(self):
        """Test weight statistics"""
        if not self.test_user_id:
            self.log_error("Weight Stats", "No test user ID available")
            return
            
        try:
            response = requests.get(f"{self.base_url}/weight-logs/{self.test_user_id}/stats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["poids_initial", "poids_actuel", "evolution", "tendance"]
                
                if all(field in data for field in required_fields):
                    self.results["weight_stats"] = True
                    self.log_success("Weight Stats", 
                        f"Evolution: {data['evolution']}kg, Trend: {data['tendance']}")
                else:
                    self.log_error("Weight Stats", f"Missing required fields: {required_fields}")
            else:
                self.log_error("Weight Stats", f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_error("Weight Stats", e)

    def test_foods_list(self):
        """Test foods listing"""
        try:
            response = requests.get(f"{self.base_url}/foods", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check first food structure
                    first_food = data[0]
                    required_fields = ["nom", "categorie", "calories_100g", "proteines_100g", "glucides_100g", "lipides_100g"]
                    
                    if all(field in first_food for field in required_fields):
                        self.results["foods_list"] = True
                        self.log_success("Foods List", f"Retrieved {len(data)} foods")
                    else:
                        self.log_error("Foods List", "Invalid food structure")
                else:
                    self.log_error("Foods List", "No foods returned or invalid format")
            else:
                self.log_error("Foods List", f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_error("Foods List", e)

    def test_admin_stats(self):
        """Test admin statistics"""
        try:
            response = requests.get(f"{self.base_url}/admin/stats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "total_clients" in data and "distribution_objectifs" in data:
                    self.results["admin_stats"] = True
                    self.log_success("Admin Stats", f"Total clients: {data['total_clients']}")
                else:
                    self.log_error("Admin Stats", "Missing required admin stats fields")
            else:
                self.log_error("Admin Stats", f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_error("Admin Stats", e)

    def test_nutritional_rules(self):
        """Test nutritional rules endpoint"""
        try:
            response = requests.get(f"{self.base_url}/nutritional-rules", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "regles" in data and isinstance(data["regles"], list) and len(data["regles"]) == 8:
                    self.results["nutritional_rules"] = True
                    self.log_success("Nutritional Rules", f"Retrieved {len(data['regles'])} rules")
                else:
                    self.log_error("Nutritional Rules", "Invalid rules structure or count")
            else:
                self.log_error("Nutritional Rules", f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_error("Nutritional Rules", e)

    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting MealGoal Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test in logical order
        self.test_health_check()
        self.test_user_creation()
        self.test_duplicate_email()
        self.test_user_retrieval()
        self.test_meal_plan_generation()
        self.test_today_meal_plan()
        self.test_weight_logging()
        self.test_weight_stats()
        self.test_foods_list()
        self.test_admin_stats()
        self.test_nutritional_rules()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.results.values() if result)
        total = len(self.results)
        
        for test_name, result in self.results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name.replace('_', ' ').title()}")
        
        print(f"\n🎯 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if self.errors:
            print(f"\n🚨 ERRORS ENCOUNTERED:")
            for error in self.errors:
                print(f"  {error}")
        
        return passed == total

if __name__ == "__main__":
    tester = MealGoalTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)