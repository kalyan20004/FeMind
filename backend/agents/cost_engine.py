from data.simulator import ASSETS

# Estimated catastrophic failure costs (full replacement + extended downtime)
CATASTROPHIC_COSTS = {
    "BF_FAN_12":    {"repair_cost": 5000000,  "downtime_hours": 36, "label": "₹50L repair + 36h downtime"},
    "PUMP_CW_03":   {"repair_cost": 2000000,  "downtime_hours": 24, "label": "₹20L repair + 24h downtime"},
    "CONVEYOR_A1":  {"repair_cost": 3000000,  "downtime_hours": 48, "label": "₹30L repair + 48h downtime"},
    "MOTOR_BF_01":  {"repair_cost": 8000000,  "downtime_hours": 72, "label": "₹80L repair + 72h downtime"},
    "COOLER_BF_05": {"repair_cost": 15000000, "downtime_hours": 96, "label": "₹1.5Cr repair + 96h downtime"},
}

# Planned maintenance costs (much cheaper — planned vs unplanned)
PLANNED_MAINTENANCE_COSTS = {
    "BF_FAN_12":    {"labor": 25000,  "parts": 45000,  "downtime_hours": 6,  "label": "₹70K + 6h planned stop"},
    "PUMP_CW_03":   {"labor": 15000,  "parts": 30000,  "downtime_hours": 4,  "label": "₹45K + 4h planned stop"},
    "CONVEYOR_A1":  {"labor": 20000,  "parts": 35000,  "downtime_hours": 8,  "label": "₹55K + 8h planned stop"},
    "MOTOR_BF_01":  {"labor": 40000,  "parts": 80000,  "downtime_hours": 12, "label": "₹1.2L + 12h planned stop"},
    "COOLER_BF_05": {"labor": 35000,  "parts": 60000,  "downtime_hours": 10, "label": "₹95K + 10h planned stop"},
}

class CostEngine:
    def calculate(self, asset_id: str, failure_probability: float, rul_days: int) -> dict:
        """
        Calculate the expected cost of two decisions:
        A) Stop now and do planned maintenance
        B) Continue operating and risk catastrophic failure

        Returns structured comparison in rupees.
        """
        asset = ASSETS.get(asset_id, {})
        hourly_value = asset.get("production_value_per_hour", 1000000)

        planned = PLANNED_MAINTENANCE_COSTS.get(asset_id, {
            "labor": 30000, "parts": 50000, "downtime_hours": 8
        })
        catastrophic = CATASTROPHIC_COSTS.get(asset_id, {
            "repair_cost": 5000000, "downtime_hours": 48
        })

        # Option A: Planned maintenance NOW
        planned_downtime_cost = planned["downtime_hours"] * hourly_value
        option_a_total = planned["labor"] + planned["parts"] + planned_downtime_cost

        # Option B: Risk it — expected cost calculation
        # Expected cost = (failure_probability × catastrophic_cost) + (1-prob × 0)
        catastrophic_downtime_cost = catastrophic["downtime_hours"] * hourly_value
        catastrophic_total = catastrophic["repair_cost"] + catastrophic_downtime_cost
        expected_catastrophic_cost = failure_probability * catastrophic_total

        # Savings from acting now
        savings = expected_catastrophic_cost - option_a_total
        savings_pct = (savings / expected_catastrophic_cost * 100) if expected_catastrophic_cost > 0 else 0

        def fmt_rs(amount):
            if amount >= 10000000:
                return f"₹{amount/10000000:.2f}Cr"
            elif amount >= 100000:
                return f"₹{amount/100000:.1f}L"
            else:
                return f"₹{amount:,.0f}"

        recommendation = "STOP_AND_MAINTAIN" if savings > 0 else "CONTINUE_MONITORING"

        return {
            "asset_id": asset_id,
            "recommendation": recommendation,
            "option_a": {
                "label": "Stop now — planned maintenance",
                "description": planned["label"],
                "breakdown": {
                    "labor_cost": fmt_rs(planned["labor"]),
                    "parts_cost": fmt_rs(planned["parts"]),
                    "downtime_hours": planned["downtime_hours"],
                    "downtime_cost": fmt_rs(planned_downtime_cost),
                },
                "total_cost": fmt_rs(option_a_total),
                "total_cost_rs": option_a_total,
            },
            "option_b": {
                "label": "Continue operating — risk catastrophic failure",
                "failure_probability_pct": round(failure_probability * 100, 1),
                "rul_days": rul_days,
                "catastrophic_cost_if_fails": fmt_rs(catastrophic_total),
                "expected_cost": fmt_rs(expected_catastrophic_cost),
                "expected_cost_rs": expected_catastrophic_cost,
            },
            "decision_summary": {
                "acting_now_saves": fmt_rs(abs(savings)),
                "savings_pct": round(savings_pct, 1),
                "verdict": f"Planned maintenance saves {fmt_rs(abs(savings))} ({round(savings_pct,1)}%) compared to risking catastrophic failure.",
            },
        }
