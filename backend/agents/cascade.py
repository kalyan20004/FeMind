import networkx as nx
from data.simulator import ASSETS

# ─── Define the steel plant equipment dependency graph ──────────────────────
#
# Edge: A → B means "if A fails, B is at risk"
# edge_data: explains WHY and what the impact is
#
PLANT_DEPENDENCY_GRAPH = {
    "BF_FAN_12": {
        "downstream": [
            {
                "asset": "COOLER_BF_05",
                "failure_probability": 0.72,
                "time_to_impact_hours": 2,
                "impact_type": "Overheating",
                "reason": "BF Fan 12 provides primary cooling airflow to BF Cooler 05. Without cooling, furnace temperature rises beyond safe limits.",
                "severity": "CRITICAL",
            },
            {
                "asset": "MOTOR_BF_01",
                "failure_probability": 0.45,
                "time_to_impact_hours": 4,
                "impact_type": "Thermal overload",
                "reason": "Reduced cooling from BF Fan causes ambient temperature rise in motor area. Motor thermal protection may trip.",
                "severity": "HIGH",
            },
        ]
    },
    "COOLER_BF_05": {
        "downstream": [
            {
                "asset": "CONVEYOR_A1",
                "failure_probability": 0.60,
                "time_to_impact_hours": 1,
                "impact_type": "Emergency stop",
                "reason": "Blast furnace overtemperature triggers emergency shutdown of all connected material handling equipment.",
                "severity": "CRITICAL",
            }
        ]
    },
    "PUMP_CW_03": {
        "downstream": [
            {
                "asset": "COOLER_BF_05",
                "failure_probability": 0.80,
                "time_to_impact_hours": 1,
                "impact_type": "Coolant starvation",
                "reason": "CW-03 supplies cooling water to BF Cooler 05. Loss of water flow causes immediate temperature spike.",
                "severity": "CRITICAL",
            }
        ]
    },
    "MOTOR_BF_01": {
        "downstream": [
            {
                "asset": "BF_FAN_12",
                "failure_probability": 1.0,
                "time_to_impact_hours": 0,
                "impact_type": "Direct drive loss",
                "reason": "Motor BF-01 is the prime mover for BF Fan 12. Motor failure = immediate fan stop.",
                "severity": "CRITICAL",
            }
        ]
    },
}

# Production impact when each asset goes down (Rs per hour)
PRODUCTION_IMPACT = {
    "BF_FAN_12":    {"hourly_loss": 2500000,  "label": "₹25L/hr"},
    "COOLER_BF_05": {"hourly_loss": 3000000,  "label": "₹30L/hr"},
    "CONVEYOR_A1":  {"hourly_loss": 800000,   "label": "₹8L/hr"},
    "MOTOR_BF_01":  {"hourly_loss": 1800000,  "label": "₹18L/hr"},
    "PUMP_CW_03":   {"hourly_loss": 1200000,  "label": "₹12L/hr"},
}

class CascadeAgent:
    def __init__(self):
        self.graph = self._build_graph()

    def _build_graph(self):
        G = nx.DiGraph()
        for asset in ASSETS.keys():
            G.add_node(asset)

        for source, data in PLANT_DEPENDENCY_GRAPH.items():
            for dep in data["downstream"]:
                G.add_edge(
                    source,
                    dep["asset"],
                    failure_probability=dep["failure_probability"],
                    time_to_impact_hours=dep["time_to_impact_hours"],
                    impact_type=dep["impact_type"],
                    reason=dep["reason"],
                    severity=dep["severity"],
                )
        return G

    def get_cascade(self, asset_id: str) -> dict:
        """
        Given a failing asset, return the full cascade chain
        with cumulative production impact.
        """
        if asset_id not in self.graph:
            return {"chain": [], "total_hourly_impact": 0}

        chain = []
        visited = set()
        total_hourly_loss = PRODUCTION_IMPACT.get(asset_id, {}).get("hourly_loss", 0)

        # BFS to find all downstream affected assets
        queue = [(asset_id, 1.0, 0, 0)]  # (asset, cumulative_prob, depth, cumulative_time)

        while queue:
            current, cum_prob, depth, cum_time = queue.pop(0)
            if current in visited or depth > 5:
                continue
            visited.add(current)

            if current != asset_id:
                impact = PRODUCTION_IMPACT.get(current, {})
                chain.append({
                    "asset_id": current,
                    "depth": depth,
                    "failure_probability_pct": round(cum_prob * 100, 1),
                    "impact_type": self.graph[list(self.graph.predecessors(current))[0]][current]["impact_type"],
                    "reason": self.graph[list(self.graph.predecessors(current))[0]][current]["reason"],
                    "time_to_impact_hours": cum_time,
                    "severity": self.graph[list(self.graph.predecessors(current))[0]][current]["severity"],
                    "hourly_production_loss": impact.get("label", "Unknown"),
                    "hourly_loss_rs": impact.get("hourly_loss", 0),
                })
                total_hourly_loss += impact.get("hourly_loss", 0) * cum_prob

            # Queue downstream assets
            for successor in self.graph.successors(current):
                edge_data = self.graph[current][successor]
                next_prob = cum_prob * edge_data["failure_probability"]
                next_time = cum_time + edge_data["time_to_impact_hours"]
                queue.append((successor, next_prob, depth + 1, next_time))

        # Sort by severity then time to impact
        severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        chain.sort(key=lambda x: (severity_order.get(x["severity"], 9), x["time_to_impact_hours"]))

        return {
            "source_asset": asset_id,
            "cascade_chain": chain,
            "total_assets_at_risk": len(chain),
            "estimated_hourly_loss_rs": int(total_hourly_loss),
            "estimated_hourly_loss_label": f"₹{total_hourly_loss/100000:.1f}L/hr",
            "summary": f"Failure of {asset_id} puts {len(chain)} assets at risk with total production impact of ₹{total_hourly_loss/100000:.1f}L/hr",
        }

    def get_graph_for_visualization(self) -> dict:
        """Return graph data for React Flow visualization."""
        nodes = []
        edges = []

        for asset_id in self.graph.nodes():
            nodes.append({
                "id": asset_id,
                "label": asset_id,
                "asset_type": ASSETS.get(asset_id, {}).get("type", "unknown"),
            })

        for u, v, data in self.graph.edges(data=True):
            edges.append({
                "source": u,
                "target": v,
                "failure_probability": data["failure_probability"],
                "severity": data["severity"],
                "impact_type": data["impact_type"],
            })

        return {"nodes": nodes, "edges": edges}
