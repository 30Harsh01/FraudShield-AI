"use client";
import React, { useState } from "react";

type Payload = {
  bin: string;
  last_4: string;
  name: string;
  email: string;
  ip_address: string;
  order_id: string;
  shopper_id: string;
  merchant_id: string;
  country_code: string;
  currency: string;
  sale: number;
  sale_amount: number;
  refund: number;
  refund_amount: number;
  chargeback: number;
  chargeback_amount: number;
  billing_address: string;
  shipping_address: string;
  browser_info: string;
  avs_check: boolean;
  cvv_matched: boolean;
  is_3ds_required: boolean;
};

const defaultPayload: Payload = {
  bin: "123456",
  last_4: "7890",
  name: "Test User",
  email: "test@example.com",
  ip_address: "127.0.0.1",
  order_id: "ORD001",
  shopper_id: "SHOP001",
  merchant_id: "MERCH001",
  country_code: "gb",
  currency: "gbp",
  sale: 1,
  sale_amount: 1000,
  refund: 0,
  refund_amount: 0,
  chargeback: 0,
  chargeback_amount: 0,
  billing_address: "123 Street",
  shipping_address: "123 Street",
  browser_info: "Chrome/117",
  avs_check: true,
  cvv_matched: false,
  is_3ds_required: false,
};

export default function fraudDetector() {
  const [payloadText, setPayloadText] = useState(JSON.stringify(defaultPayload, null, 2));
  const [step, setStep] = useState(0);

  const [flagDecision, setFlagDecision] = useState<string | null>(null);
  const [triggeredFlags, setTriggeredFlags] = useState<string[] | null>(null);
  const [formulaDecision, setFormulaDecision] = useState<string | null>(null);
  const [formulaScore, setFormulaScore] = useState<number | null>(null);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateScoring = async () => {
    try {
      const data: Payload = JSON.parse(payloadText);
      console.log("📤 Sending to backend:", data);
      setStep(1);

      const response = await fetch("http://localhost:3000/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("📥 Received from backend:", result);

      if (!response.ok) throw new Error(result?.error || "Unknown error");

      const ruleResult = result.layer1result || {};
      console.log("- Layer 1 Result:", ruleResult);

      const {
        flags,
        flag_result,
        score,
        status_score,
      } = ruleResult;

      const {
        bin,
        last_4
      } = result

      setFlagDecision(flag_result || null);
      setTriggeredFlags(flags || []);
      setFormulaDecision(status_score ?? null);
      setFormulaScore(score ?? null);

      console.log("flagDecision",flagDecision)
      console.log("triggeredFlags",triggeredFlags)
      console.log("formulaDecision",formulaDecision)
      console.log("formulaDecision",formulaScore)
      console.log("bin",bin)
      console.log("last_4",last_4)

      setFinalStatus(
        flag_result === "a"
          ? "ACCEPTED"
          : flag_result === "r"
          ? "REVIEW"
          : flag_result === "d"
          ? "DECLINE"
          : 'Decision Pending'
      );

      setError(null);
      setStep(4);

      const refreshResponse = await fetch("http://localhost:3000/refresh-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email:data.email }),
      });

      const refreshResult = await refreshResponse.json();
      console.log("refreshResult",refreshResult)
      if (!refreshResponse.ok) throw new Error(refreshResult?.error || "Failed to fetch AI result");
      const updates = refreshResult?.updates || [];
      const statusFromAi = updates[0]?.layer2_status || 'Decision Pending';
      setAiPrediction(statusFromAi);
      setStep(5);


    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.message || "Invalid JSON");
    }
  };

  const getFullForm = (text: string | null): string => {
    switch (text?.toLowerCase()) {
      case "a":
        return "ACCEPTED";
      case "r":
        return "REVIEW";
      case "d":
        return "DECLINE";
      default:
        return "";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-black";
    if (score < 40) return "bg-red-100 text-red-700";
    if (score <= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-black";
    if (status === "a") return "bg-green-100 text-green-700";
    if (status === "r") return "bg-yellow-100 text-yellow-700";
    if (status === "d") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-black";
  };

  const getFlagBoxColor = () => {
    if (triggeredFlags === null) return "bg-gray-100 text-black";
    return triggeredFlags.length > 0
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Fraud Engine</h1>
      </div>

      <div className="grid grid-cols-2 gap-12 w-full max-w-5xl mt-8">
        <div className="col-span-1">
          <label className="text-xl font-semibold">Transaction Payload</label>
          <textarea
            rows={20}
            className="w-full mt-2 border border-gray-300 rounded-md p-2 text-black"
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
          ></textarea>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={simulateScoring}
          >
            Simulate Score
          </button>
          {error && <div className="text-red-500 font-medium text-center mt-4">{error}</div>}
        </div>

        <div className="col-span-1 space-y-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`rounded-full w-8 h-8 flex items-center justify-center ${
                    step >= s ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {s}
                </div>
                {s < 5 && <div className="flex-1 border-t-2" />}
              </React.Fragment>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-semibold">Step 1: Flags Triggered</h2>
            <div className={`p-4 border rounded ${getFlagBoxColor()}`}>
              {triggeredFlags === null
                ? "Decision Pending"
                : triggeredFlags.length
                ? triggeredFlags.join(", ")
                : "No flag triggered"}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Step 2: Flag Status</h2>
            <div className={`p-4 border rounded ${getStatusColor(flagDecision)}`}>
              {finalStatus !== null ? getFullForm(flagDecision) : "Decision Pending"}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Step 3: Formula Score</h2>
            <div className={`p-4 border rounded ${getScoreColor(formulaScore)}`}>
              {formulaScore !== null ? formulaScore.toFixed(2) : "Decision Pending"}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Step 4: Formula Status</h2>
            <div className={`p-4 border rounded ${getStatusColor(formulaDecision)}`}>
              {formulaDecision !== null ? getFullForm(formulaDecision) : "Decision Pending"}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Step 5: AI/ML Prediction</h2>
            <div className={`p-4 border rounded ${getStatusColor(aiPrediction)}`}>
              {aiPrediction !== null ? getFullForm(aiPrediction) : "Decision Pending"}
            </div>
          </div>


        </div>
      </div>
    </main>
  );
}