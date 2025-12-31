# python/rules_layer1.py
import sys
import json

def evaluate_rules(payload):
    flags = []

    print("📥 Received payload:", json.dumps(payload), file=sys.stderr)

    if payload.get('avs_check') is False:
        flags.append("AVS mismatch")
    if payload.get('cvv_matched') is False:
        flags.append("CVV mismatch")
    if payload.get('billing_address') != payload.get('shipping_address'):
        flags.append("Billing/Shipping mismatch")
    if payload.get('recent_txn_count', 0) > 3:
        flags.append("High transaction rate")

    # 🌐 Sales-based scoring
    total_sales_count = payload.get("total_sales_count", 0)
    total_sales_amount = payload.get("total_sales_amount", 0)
    refund_count = payload.get("refund_count", 0)
    chargeback_count = payload.get("chargeback_count", 0)
    refund_amount = payload.get("refund_amount", 0)
    chargeback_amount = payload.get("chargeback_amount", 0)
    successful_sales_count = payload.get("successful_sales_count", 0)

    refund_rate = refund_count / total_sales_count if total_sales_count else 0
    chargeback_rate = chargeback_count / total_sales_count if total_sales_count else 0
    refund_rate_amt = refund_amount / total_sales_amount if total_sales_amount else 0
    chargeback_rate_amt = chargeback_amount / total_sales_amount if total_sales_amount else 0

    # score = payload.get("fraud_score", 50)
    score = 50
    score -= refund_rate * 5
    score -= refund_rate_amt * 5
    score -= chargeback_rate * 20
    score -= chargeback_rate_amt * 30

    if refund_rate < 0.1 and chargeback_rate < 0.02:
        score += successful_sales_count * 0.75
        score += min(total_sales_amount, 10000) * 0.001

    score = max(0, min(score, 100))

    print(f"🧮 Computed Score: {score}", file=sys.stderr)
    print(f"✅ Total Flags: {len(flags)} → {flags}", file=sys.stderr)

    if len(flags) >= 2:
        status_flag = 'd'
    elif flags:
        status_flag = 'r'
    else:
        status_flag = 'a'

    if round(score, 2) > 60:
        status_score = 'a'
    elif round(score, 2) > 40:
        status_score = 'r'
    else:
        status_score = 'd'

    return {
        "flags": flags,
        "flag_result": status_flag,
        "score": round(score, 2),
        "status_score": status_score,
    }

def main():
    try:
        data = json.loads(sys.stdin.read())
        result = evaluate_rules(data)
        print(json.dumps(result))  # Output to Node.js
    except Exception as e:
        print(f"❌ Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
