import os
import sys
import json
import csv
from sklearn.ensemble import RandomForestClassifier

# -------------------------------
# 🔁 Train model once globally
# -------------------------------
def train_model_from_csv():
    path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    X, y = [], []

    print("📁 Reading training data from:", path, file=sys.stderr)

    with open(path, newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Build feature vector
            X.append([
                float(row["refund_rate_count"]),
                float(row["chargeback_rate_count"]),
                float(row["refund_rate_amt"]),
                float(row["chargeback_rate_amt"]),
                float(row["successful_sales_count"]),
                float(row["total_sales_amount"]),
                float(row.get("unique_ip_count", 0)),  # number of IPs
                float(row.get("card_count", 0)),       # number of cards
            ])
            y.append(int(row["label"]))

    print("🚀 Training RandomForestClassifier...", file=sys.stderr)
    model = RandomForestClassifier(n_estimators=150, random_state=42)
    model.fit(X, y)
    print("✅ Model training complete.", file=sys.stderr)
    return model

MODEL = train_model_from_csv()

# -------------------------------
# Minimum thresholds to auto-label
# -------------------------------
MIN_TXN_THRESHOLD = 5
MIN_SALES_AMOUNT_THRESHOLD = 100

# -------------------------------
# Main processing
# -------------------------------
def main():
    try:
        items = json.loads(sys.stdin.read())
        results = []

        print(f"📥 Received {len(items)} input records.", file=sys.stderr)

        for i, item in enumerate(items):
            total_sales_count = item.get("total_sales_count", 0)
            total_sales_amount = item.get("total_sales_amount", 0)

            # 🆕 derive new signals
            unique_ip_count = len(set(item.get("ip_addresses", [])))
            card_count = len(item.get("attached_cards", []))

            # ---------------------------
            # 💡 Auto-label new/low activity users as "good"
            # ---------------------------
            if total_sales_count < MIN_TXN_THRESHOLD or total_sales_amount < MIN_SALES_AMOUNT_THRESHOLD:
                label = "good"
                confidence = 100.0
                print(f"🟢 User {item.get('email')} is new/low activity, auto-labeled as 'good'.", file=sys.stderr)
            else:
                # ---------------------------
                # 🧮 Build feature vector
                # ---------------------------
                features = [
                    item["refund_count"] / total_sales_count if total_sales_count else 0,
                    item["chargeback_count"] / total_sales_count if total_sales_count else 0,
                    item["refund_amount"] / total_sales_amount if total_sales_amount else 0,
                    item["chargeback_amount"] / total_sales_amount if total_sales_amount else 0,
                    item.get("successful_sales_count", 0),
                    item.get("total_sales_amount", 0),
                    unique_ip_count,
                    card_count,
                ]

                print(f"🧩 Features for email {item.get('email')}: {features}", file=sys.stderr)

                # 🔮 ML prediction
                ml_pred = MODEL.predict([features])[0]

                # Map numeric prediction to label
                if ml_pred == 0:
                    label = "fraud"
                elif ml_pred == 2:
                    label = "review"
                else:
                    label = "good"

                # AI confidence score
                proba = MODEL.predict_proba([features])[0]
                confidence = round(max(proba) * 100, 2)

                print(f"🔍 ML predicted {label} with confidence {confidence}%", file=sys.stderr)

            # ---------------------------
            # Append results
            # ---------------------------
            results.append({
                "email": item.get("email"),
                "ml_prediction": label,
                "layer2_score": confidence,
                "ip_count": unique_ip_count,
                "card_count": card_count
            })

        # ✅ Output JSON for Node.js
        print(json.dumps(results))

    except Exception as e:
        print(f"❌ Layer 2 error: {str(e)}", file=sys.stderr)
        sys.exit(1)

# -------------------------------
if __name__ == "__main__":
    main()
