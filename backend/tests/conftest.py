"""
Pytest configuration for MealGoal backend tests.

Uses mongomock to replace pymongo.MongoClient with an in-memory implementation,
so no real MongoDB connection is needed during tests.
"""
import sys
import os

# Make the backend directory importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Patch pymongo BEFORE server module is imported so create_indexes() uses in-memory DB
import mongomock
from unittest.mock import patch

_mongo_patcher = patch("pymongo.MongoClient", mongomock.MongoClient)
_mongo_patcher.start()

import pytest
from fastapi.testclient import TestClient
from server import app  # noqa: E402 — imported after patch


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def clean_collections():
    """Drop all collections and reset rate limits before each test."""
    from server import (
        users_collection,
        meal_plans_collection,
        weight_logs_collection,
        reset_tokens_collection,
        foods_collection,
        limiter,
    )
    users_collection.drop()
    meal_plans_collection.drop()
    weight_logs_collection.drop()
    reset_tokens_collection.drop()
    # Reset slowapi in-memory storage so rate limits don't bleed between tests
    limiter._storage.reset()
    yield


# Minimal valid user payload matching UserCreate schema
VALID_USER = {
    "email": "test@example.com",
    "password": "password123",
    "nom": "Dupont",
    "prenom": "Jean",
    "age": 28,
    "sexe": "homme",
    "taille_cm": 178,
    "poids_initial_kg": 75.0,
    "date_demarrage": "2025-01-01",
    "nombre_repas": 3,
    "mode_alimentaire": "classique",
    "niveau_activite": "modere",
    "objectif": "maintien",
    "preferences": {"carbs": [], "proteins": [], "fats": []},
    "heure_reveil": "07:00",
    "heure_entrainement": "18:00",
    "heure_coucher": "23:00",
    "appetit_reveil": "oui",
    "preference_repas_copieux": "midi",
}
