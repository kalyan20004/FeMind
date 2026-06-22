import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import os

class RULPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()

    def load_or_train(self):
        """Train RUL predictor on simulated degradation data."""
        try:
            df = pd.read_csv("data/generated/sensor_data.csv")
        except FileNotFoundError:
            from data.simulator import generate_sensor_data
            df = generate_sensor_data()

        # Use only BF_FAN_12 data (the one with injected degradation)
        fan_data = df[df["asset_id"] == "BF_FAN_12"].copy()

        # RUL = days remaining until failure (failure at day 90 in our simulation)
        FAILURE_DAY = 90
        fan_data["rul"] = FAILURE_DAY - fan_data["day"]
        fan_data["rul"] = fan_data["rul"].clip(lower=0)

        features = ["vibration", "temperature", "current"]
        X = fan_data[features]
        y = fan_data["rul"]

        X_scaled = self.scaler.fit_transform(X)
        self.model = XGBRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_scaled, y)
        print("RUL predictor trained")

    def predict(self, asset_id: str, readings: dict) -> int:
        """Returns predicted remaining useful life in days."""
        if self.model is None:
            return 18  # fallback for demo

        features = ["vibration", "temperature", "current"]
        X = np.array([[readings[f] for f in features]])
        X_scaled = self.scaler.transform(X)
        rul = self.model.predict(X_scaled)[0]
        return max(0, int(rul))
