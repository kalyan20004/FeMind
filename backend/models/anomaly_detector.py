import numpy as np
import pandas as pd
import pickle
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

BASELINES = {
    "BF_FAN_12":    {"vibration": 2.1, "temperature": 65, "pressure": 1.2, "current": 45, "rpm": 1480},
    "PUMP_CW_03":   {"vibration": 1.4, "temperature": 42, "pressure": 3.8, "current": 28, "rpm": 960},
    "CONVEYOR_A1":  {"vibration": 0.9, "temperature": 38, "pressure": 0.0, "current": 55, "rpm": 120},
    "MOTOR_BF_01":  {"vibration": 1.8, "temperature": 72, "pressure": 0.0, "current": 120,"rpm": 1490},
    "COOLER_BF_05": {"vibration": 0.5, "temperature": 85, "pressure": 4.2, "current": 35, "rpm": 0},
}

class AnomalyDetector:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_dir = "models/saved"
        os.makedirs(self.model_dir, exist_ok=True)

    def load_or_train(self):
        """Train one Isolation Forest per asset on normal data."""
        try:
            df = pd.read_csv("data/generated/sensor_data.csv")
        except FileNotFoundError:
            from data.simulator import generate_sensor_data
            df = generate_sensor_data()

        features = ["vibration", "temperature", "pressure", "current", "rpm"]

        for asset_id in df["asset_id"].unique():
            # Train only on healthy data (first 60 days = no injected fault)
            normal_data = df[(df["asset_id"] == asset_id) & (df["day"] < 60)][features]

            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(normal_data)

            model = IsolationForest(
                n_estimators=100,
                contamination=0.05,
                random_state=42,
            )
            model.fit(X_scaled)

            self.models[asset_id] = model
            self.scalers[asset_id] = scaler

        print(f"Anomaly detectors trained for {len(self.models)} assets")

    def analyze(self, asset_id: str, readings: dict):
        """
        Returns: (is_anomaly, health_score, details)
        health_score: 0-100 (100 = perfect health)
        """
        features = ["vibration", "temperature", "pressure", "current", "rpm"]
        X = np.array([[readings[f] for f in features]])

        if asset_id not in self.models:
            return False, 100, {}

        model = self.models[asset_id]
        scaler = self.scalers[asset_id]
        baseline = BASELINES[asset_id]

        X_scaled = scaler.transform(X)
        prediction = model.predict(X_scaled)[0]  # 1 = normal, -1 = anomaly
        anomaly_score = model.decision_function(X_scaled)[0]  # more negative = more anomalous

        is_anomaly = bool(prediction == -1)

        # Identify which parameters are abnormal
        anomaly_details = {}
        max_dev = 0
        for feature in features:
            baseline_val = baseline[feature]
            current_val = readings[feature]
            if baseline_val > 0:
                deviation_pct = abs((current_val - baseline_val) / baseline_val) * 100
                if deviation_pct > max_dev:
                    max_dev = deviation_pct
                if deviation_pct > 15:
                    anomaly_details[feature] = {
                        "baseline": baseline_val,
                        "current": current_val,
                        "deviation_pct": round(deviation_pct, 1),
                        "status": "ABNORMAL" if deviation_pct > 30 else "ELEVATED",
                    }

        # Health score: deterministic mapping from deviation to 0-100 range
        if max_dev < 15:
            health_score = int(100 - max_dev)
        elif max_dev < 50:
            # Map up to 50% deviation smoothly into the Warning range (50-75)
            health_score = int(max(50, 85 - max_dev))
        else:
            # Map >50% deviation into Critical range (<50)
            health_score = int(max(0, 50 - (max_dev / 2)))

        return is_anomaly, health_score, anomaly_details
