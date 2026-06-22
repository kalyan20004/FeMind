import pandas as pd
import numpy as np
from datetime import datetime, timedelta

ASSETS = {
    "BF_FAN_12": {
        "type": "centrifugal_fan",
        "criticality": 10,
        "production_value_per_hour": 2500000,  # Rs 25 lakhs/hour
        "normal": {"vibration": 2.1, "temperature": 65, "pressure": 1.2, "current": 45, "rpm": 1480},
    },
    "PUMP_CW_03": {
        "type": "cooling_water_pump",
        "criticality": 8,
        "production_value_per_hour": 1200000,
        "normal": {"vibration": 1.4, "temperature": 42, "pressure": 3.8, "current": 28, "rpm": 960},
    },
    "CONVEYOR_A1": {
        "type": "belt_conveyor",
        "criticality": 7,
        "production_value_per_hour": 800000,
        "normal": {"vibration": 0.9, "temperature": 38, "pressure": 0.0, "current": 55, "rpm": 120},
    },
    "MOTOR_BF_01": {
        "type": "induction_motor",
        "criticality": 9,
        "production_value_per_hour": 1800000,
        "normal": {"vibration": 1.8, "temperature": 72, "pressure": 0.0, "current": 120, "rpm": 1490},
    },
    "COOLER_BF_05": {
        "type": "blast_furnace_cooler",
        "criticality": 10,
        "production_value_per_hour": 3000000,
        "normal": {"vibration": 0.5, "temperature": 85, "pressure": 4.2, "current": 35, "rpm": 0},
    },
}

def generate_sensor_data(days=90):
    """
    Generate 90 days of sensor data with realistic failure injected
    into BF_FAN_12 starting at day 60 (bearing wear scenario).
    """
    records = []
    start_date = datetime.now() - timedelta(days=days)

    for asset_id, asset in ASSETS.items():
        normal = asset["normal"]
        for day in range(days):
            for hour in range(24):
                ts = start_date + timedelta(days=day, hours=hour)

                # Base values with slight random variation
                vibration = normal["vibration"] + np.random.normal(0, 0.05)
                temperature = normal["temperature"] + np.random.normal(0, 0.8)
                pressure = normal["pressure"] + np.random.normal(0, 0.02)
                current = normal["current"] + np.random.normal(0, 0.5)
                rpm = normal["rpm"] + np.random.normal(0, 5)

                # INJECT BEARING FAILURE into BF_FAN_12 from day 60
                if asset_id == "BF_FAN_12" and day >= 60:
                    degradation_day = day - 60  # 0 to 29
                    # Vibration increases exponentially (bearing wear signature)
                    vibration += degradation_day * 0.15 + (degradation_day ** 1.4) * 0.02
                    # Temperature rises (friction from worn bearing)
                    temperature += degradation_day * 0.4
                    # Current increases slightly (mechanical resistance)
                    current += degradation_day * 0.3
                    # RPM drops slightly (load increase)
                    rpm -= degradation_day * 1.2

                records.append({
                    "timestamp": ts.isoformat(),
                    "asset_id": asset_id,
                    "asset_type": asset["type"],
                    "vibration": round(max(0, vibration), 3),
                    "temperature": round(max(0, temperature), 2),
                    "pressure": round(max(0, pressure), 3),
                    "current": round(max(0, current), 2),
                    "rpm": round(max(0, rpm), 1),
                    "day": day,
                    "is_fault": 1 if (asset_id == "BF_FAN_12" and day >= 75) else 0,
                })

    df = pd.DataFrame(records)
    # create the generated dir if it doesn't exist
    import os
    os.makedirs("data/generated", exist_ok=True)
    df.to_csv("data/generated/sensor_data.csv", index=False)
    print(f"Generated {len(df)} sensor records")
    return df


def get_current_readings():
    """Return simulated 'live' readings for all assets."""
    import random
    readings = {}
    for asset_id, asset in ASSETS.items():
        normal = asset["normal"]
        health_score = random.uniform(85, 98)

        if asset_id == "BF_FAN_12":
            # Show it in degraded state for demo
            health_score = 42
            readings[asset_id] = {
                "asset_id": asset_id,
                "asset_type": asset["type"],
                "health_score": health_score,
                "vibration": 4.7,   # 2.24x baseline — classic bearing wear
                "temperature": 91.3, # elevated
                "pressure": 1.18,
                "current": 51.2,
                "rpm": 1448,
                "status": "CRITICAL",
                "production_value_per_hour": asset["production_value_per_hour"],
            }
        else:
            readings[asset_id] = {
                "asset_id": asset_id,
                "asset_type": asset["type"],
                "health_score": round(health_score, 1),
                "vibration": round(normal["vibration"] + random.uniform(-0.1, 0.1), 3),
                "temperature": round(normal["temperature"] + random.uniform(-1, 1), 2),
                "pressure": round(normal["pressure"] + random.uniform(-0.05, 0.05), 3),
                "current": round(normal["current"] + random.uniform(-1, 1), 2),
                "rpm": round(normal["rpm"] + random.uniform(-10, 10), 1),
                "status": "HEALTHY",
                "production_value_per_hour": asset["production_value_per_hour"],
            }
    return readings


if __name__ == "__main__":
    generate_sensor_data()
