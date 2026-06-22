import requests
import json
import time

BASE_URL = "http://localhost:8000"

def run_test(test_id, func):
    try:
        func()
        print(f"{test_id}: PASS")
    except Exception as e:
        print(f"{test_id}: FAIL - {e}")

def tc_api_01():
    res = requests.get(f"{BASE_URL}/assets/health").json()
    assert len(res["assets"]) == 5, f"Expected 5 assets, got {len(res['assets'])}"
    bf = next((a for a in res["assets"] if a["asset_id"] == "BF_FAN_12"), None)
    assert bf["status"] == "CRITICAL", f"BF_FAN_12 status is {bf['status']}, expected CRITICAL"
    assert bf["health_score"] < 50, f"BF_FAN_12 health score {bf['health_score']} >= 50"

def tc_api_02():
    res = requests.post(f"{BASE_URL}/analyze/sensor", json={
        "asset_id": "PUMP_CW_03", "vibration": 1.4, "temperature": 42.0,
        "pressure": 3.8, "current": 28.0, "rpm": 960
    }).json()
    assert not res["is_anomaly"], "is_anomaly is True"
    assert 75 <= res["health_score"] <= 100, f"health_score {res['health_score']} out of bounds"
    assert res["status"] == "HEALTHY", f"status is {res['status']}"

def tc_api_03():
    res = requests.post(f"{BASE_URL}/analyze/sensor", json={
        "asset_id": "BF_FAN_12", "vibration": 4.7, "temperature": 91.3,
        "pressure": 1.18, "current": 51.2, "rpm": 1448
    }).json()
    assert res["is_anomaly"], "is_anomaly is False"
    assert res["health_score"] < 50, f"health score {res['health_score']} >= 50"
    assert res["status"] == "CRITICAL", f"status is {res['status']}"
    assert "vibration" in res["anomaly_details"], "vibration not in anomaly_details"

def tc_api_04():
    res = requests.post(f"{BASE_URL}/analyze/cascade", json={
        "asset_id": "BF_FAN_12", "vibration": 4.7, "temperature": 91.3,
        "pressure": 1.18, "current": 51.2, "rpm": 1448
    }).json()
    assert len(res["cascade_chain"]) >= 2, "cascade_chain length < 2"
    assert res["cascade_chain"][0]["asset_id"] == "COOLER_BF_05", "COOLER_BF_05 not first"
    assert res["total_assets_at_risk"] == len(res["cascade_chain"]), "total_assets_at_risk mismatch"
    assert "₹" in res["estimated_hourly_loss_label"], "₹ not in loss label"

def tc_api_05():
    res = requests.post(f"{BASE_URL}/analyze/cost", json={
        "asset_id": "BF_FAN_12", "failure_probability": 0.47, "rul_days": 18
    }).json()
    assert res["recommendation"] == "STOP_AND_MAINTAIN", "wrong recommendation"
    assert res["option_a"]["total_cost_rs"] < res["option_b"]["expected_cost_rs"], "option A not cheaper"
    assert res["decision_summary"]["savings_pct"] > 0, "savings not positive"
    assert "₹" in res["decision_summary"]["acting_now_saves"], "₹ not in acting_now_saves"

def tc_api_06():
    res = requests.post(f"{BASE_URL}/query/knowledge", json={
        "query": "What are the normal vibration limits for BF Fan 12 and what causes bearing failure?",
        "asset_id": "BF_FAN_12", "conversation_history": []
    }).json()
    assert len(res["answer"]) > 100, "answer too short"
    assert "2.0" in res["answer"] or "2.3" in res["answer"], "vibration values missing"
    assert res["sources_used"] > 0, "sources_used is 0"

def tc_api_08():
    res = requests.post(f"{BASE_URL}/plan/maintenance", json={
        "asset_id": "BF_FAN_12", "fault_type": "Bearing Wear — Stage 3",
        "severity": "HIGH", "rul_days": 18, "conversation_history": []
    }).json()
    assert len(res.get("maintenance_plan", "")) > 500, "plan too short"
    assert res.get("sources_consulted", 0) > 0, "no sources consulted"

def tc_api_12():
    res = requests.get(f"{BASE_URL}/alerts/active").json()
    bf = next((a for a in res["alerts"] if a["asset_id"] == "BF_FAN_12"), None)
    assert bf is not None, "BF_FAN_12 not in alerts"
    assert bf["severity"] == "CRITICAL", "severity not CRITICAL"

if __name__ == "__main__":
    run_test("TC-API-01", tc_api_01)
    run_test("TC-API-02", tc_api_02)
    run_test("TC-API-03", tc_api_03)
    run_test("TC-API-04", tc_api_04)
    run_test("TC-API-05", tc_api_05)
    run_test("TC-API-06", tc_api_06)
    # Skipping 07 (multi-turn), 09 (file upload), 10 (feedback), 11 (PDF) for simplicity, will test if needed
    run_test("TC-API-08", tc_api_08)
    run_test("TC-API-12", tc_api_12)
