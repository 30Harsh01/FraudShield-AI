import csv
import random
import json

NUM_SAMPLES = 20  # Number of samples to generate
INCLUDE_SENSITIVE = False  # Set True to include ip_addresses & attached_cards

header = [
    "refund_rate_count", "chargeback_rate_count",
    "refund_rate_amt", "chargeback_rate_amt",
    "successful_sales_count", "total_sales_amount",
    "unique_ip_count", "card_count",
    "total_txn", "total_sales", "total_sale_amount",
    "total_refunds", "total_refund_amount",
    "total_chargebacks", "total_chargeback_amount",
    "label"
]

if INCLUDE_SENSITIVE:
    header += ["ip_addresses", "attached_cards"]

def generate_sample():
    total_sales_count = random.randint(10, 1000)
    successful_sales_count = total_sales_count
    total_sales_amount = round(successful_sales_count * random.uniform(50, 500), 2)

    refund_count = random.randint(0, int(total_sales_count * 0.4))
    chargeback_count = random.randint(0, int(total_sales_count * 0.3))

    refund_amount = round(refund_count * random.uniform(50, 500), 2)
    chargeback_amount = round(chargeback_count * random.uniform(50, 500), 2)

    refund_rate_count = round(refund_count / total_sales_count, 4) if total_sales_count else 0
    chargeback_rate_count = round(chargeback_count / total_sales_count, 4) if total_sales_count else 0
    refund_rate_amt = round(refund_amount / total_sales_amount, 4) if total_sales_amount else 0
    chargeback_rate_amt = round(chargeback_amount / total_sales_amount, 4) if total_sales_amount else 0

    unique_ip_count = random.randint(1, 5)
    card_count = random.randint(1, 4)

    total_txn = total_sales_count + random.randint(0, 50)
    total_sales = successful_sales_count + random.randint(0, 20)
    total_sale_amount = round(total_sales_amount + random.uniform(0, 5000), 2)
    total_refunds = refund_count
    total_refund_amount = refund_amount
    total_chargebacks = chargeback_count
    total_chargeback_amount = chargeback_amount

    # 🎯 Label
    if chargeback_rate_count > 0.2 or chargeback_rate_amt > 0.3:
        label = 0  # fraud
    elif chargeback_rate_count > 0.1 or chargeback_rate_amt > 0.1:
        label = 2  # review
    else:
        label = 1  # good

    row = [
        refund_rate_count, chargeback_rate_count,
        refund_rate_amt, chargeback_rate_amt,
        successful_sales_count, total_sales_amount,
        unique_ip_count, card_count,
        total_txn, total_sales, total_sale_amount,
        total_refunds, total_refund_amount,
        total_chargebacks, total_chargeback_amount,
        label
    ]

    if INCLUDE_SENSITIVE:
        # Generate fake IPs
        ips = [f"192.168.0.{random.randint(1,254)}" for _ in range(unique_ip_count)]
        # Generate fake card info
        cards = [{"bin": f"{random.randint(400000,999999)}", "last_4": f"{random.randint(1000,9999)}"} for _ in range(card_count)]
        row += [json.dumps(ips), json.dumps(cards)]

    return row

# Write CSV
with open("training_data_generic.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    for _ in range(NUM_SAMPLES):
        writer.writerow(generate_sample())

print(f"✅ {NUM_SAMPLES} rows written to training_data_generic.csv")
