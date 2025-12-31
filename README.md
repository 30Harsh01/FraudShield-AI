# FraudShield-AI
AI-powered payment fraud detection platform that trains and deploys intelligent models to identify suspicious payment activity in real time, improving security, accuracy, and trust.
**Hosted Link** https://paymentfrauddetector.netlify.app/

---

# Backend

A **two-layer fraud detection system** for monitoring transactions and detecting potential fraud using both **formula-based rules** and **AI/ML models**.

---

## ⚡ Features

1. **Layer 1 (Formula-Based)**
   Detects fraud using business rules and formulas on transaction data.
   ✅ Fast, real-time scoring for most cases.

2. **Layer 2 (AI/ML-Based)**
   Uses a **Random Forest Classifier** for edge cases missed by Layer 1.
   ✅ Can incorporate new edge cases to improve accuracy.

---

## 📦 Setup Instructions

### 1. Environment

* Install Node.js 18.x or above.
* Install project dependencies:

```bash
npm install
```

* Install TypeScript (if needed):

```bash
npm install -g typescript ts-node
```

---

### 2. Running Server Locally

```bash
npm run build
npm run start
```

* The server checks database connection and starts listening for API requests.

---

### 3. Database Sync

```bash
# Build project
npm run build

# Sync database
node dist/scripts/initDb.js
# OR
npx ts-node src/scripts/initDb.ts
# OR
npm run sync-db
```

> ⚠️ Make sure `db/index.db` has correct credentials before starting.

---

## 📝 Generating Training Data (Layer 2)

You can generate a dataset for Layer 2 using Python:

```bash
python generate_data.py
```

* The script creates a CSV file (`training_data_generic.csv`) in the current directory.
* You can **change the filename and path** in the Python script.
* Update **Layer 2 code** (`rules_layer2.py`) to use this file.

> ⚠️ Optionally, you can include fake IPs and card info for testing.

---

## 🌐 API Endpoints

### 1. Health Check

* **Endpoint:** `/health`
* **Method:** `GET`
* **Description:** Checks if the server is running.

---

### 2. Train Layer 1

* **Endpoint:** `/train`
* **Method:** `POST`
* **Payload Example:**

```json
{
  "bin": "123111",
  "last_4": "1211",
  "name": "Test User",
  "email": "test@example.com",
  "ip_address": "127.0.0.1",
  "order_id": "099998",
  "shopper_id": "199991",
  "merchant_id": "299991",
  "country_code": "IN",
  "currency": "INR",
  "sale": 1,
  "sale_amount": 4000,
  "refund": 0,
  "refund_amount": 0,
  "chargeback": 0,
  "chargeback_amount": 0,
  "billing_address": "123 Street",
  "shipping_address": "123 Street",
  "browser_info": "Chrome/117",
  "avs_check": true,
  "cvv_matched": false,
  "is_3ds_required": false
}
```

* **Behavior:**

  * Creates or updates a record in the database.
  * Maintains arrays for repeated emails.
  * Calculates **Layer 1 fraud score**.

---

### 3. Refresh Layer 2 Score (AI/ML)

* **Endpoint:** `/refreshscore`
* **Method:** `POST`
* **Payload Example:**

```json
{
  "email": "test@example.com"
}
```

* **Behavior:**

  1. Fetches records by email or ID.
  2. Prepares features like `unique_ip_count`, `card_count`, `total_sales_amount`, etc.
  3. Calls Python ML script (`rules_layer2.py`) for predictions.
  4. Updates `layer2_status` in the database.
  5. Returns updated status and AI confidence.

---

## 💡 Notes

* Layer 2 uses **Random Forest**, trained on `training_data_2.csv` or your generated CSV.
* Layer 1 can be customized with **business rules**.
* New users or low-activity accounts are labeled as “good” safely.
* Console logs provide debugging info for both layers.

---

### ✅ Quick Start

1. Generate dataset: `python generate_data.py`
2. Update `rules_layer2.py` to point to the CSV.
3. Run server: `npm run start`
4. Use `/train` and `/refreshscore` endpoints to test transactions.

---








---

## Frontend

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

## 🧪 Using the Fraud Detection Feature

1. Once the application is running, open it in your browser.
2. Click on the **Fraud Detection** card on the home page.
3. Paste the **raw payment payload** (the same payload typically used for payment processing) into the input box.
4. Click **Submit** to process the request.
5. The fraud detection result will be displayed after submission.

---


