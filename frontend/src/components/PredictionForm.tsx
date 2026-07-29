import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLocations, predictPrice, ApiError } from "../api/predictionClient";
import type { PredictionRequest } from "../types/prediction";

const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"] as const;
const TRANSACTION_OPTIONS = ["New Property", "Resale"] as const;
const OWNERSHIP_OPTIONS = ["Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"];
const FACING_OPTIONS = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];

const initialForm: PredictionRequest = {
  location: "",
  carpet_area_sqft: 0,
  floor_num: 0,
  bathroom_num: 1,
  balcony_num: 0,
  furnishing: "Semi-Furnished",
  transaction: "Resale",
  ownership: "Freehold",
  facing: "East",
};

export default function PredictionForm() {
  const [form, setForm] = useState<PredictionRequest>(initialForm);
  const [locations, setLocations] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations().then(setLocations);
  }, []);

  function validate(): string[] {
    const problems: string[] = [];
    if (!form.location.trim()) problems.push("Location is required.");
    if (form.carpet_area_sqft <= 0) problems.push("Carpet area must be greater than 0.");
    if (form.floor_num < 0) problems.push("Floor number cannot be negative.");
    if (form.bathroom_num < 0) problems.push("Bathrooms cannot be negative.");
    if (form.balcony_num < 0) problems.push("Balconies cannot be negative.");
    return problems;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problems = validate();
    setErrors(problems);
    if (problems.length > 0) return;

    setLoading(true);
    try {
      const result = await predictPrice(form);
      navigate("/result", { state: { predictedPrice: result.predicted_price } });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong.";
      setErrors([message]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="prediction-form">
      <div className="field">
        <label htmlFor="location">Location</label>
        {locations.length > 0 ? (
          <select
            id="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          >
            <option value="">Select a location…</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="location"
            type="text"
            placeholder="e.g. thane"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        )}
      </div>

      <div className="field">
        <label htmlFor="carpet_area_sqft">Carpet area (sqft)</label>
        <input
          id="carpet_area_sqft"
          type="number"
          min={1}
          value={form.carpet_area_sqft || ""}
          onChange={(e) => setForm({ ...form, carpet_area_sqft: Number(e.target.value) })}
        />
      </div>

      <div className="field">
        <label htmlFor="floor_num">Floor number</label>
        <input
          id="floor_num"
          type="number"
          min={0}
          value={form.floor_num}
          onChange={(e) => setForm({ ...form, floor_num: Number(e.target.value) })}
        />
      </div>

      <div className="field">
        <label htmlFor="bathroom_num">Bathrooms</label>
        <input
          id="bathroom_num"
          type="number"
          min={0}
          value={form.bathroom_num}
          onChange={(e) => setForm({ ...form, bathroom_num: Number(e.target.value) })}
        />
      </div>

      <div className="field">
        <label htmlFor="balcony_num">Balconies</label>
        <input
          id="balcony_num"
          type="number"
          min={0}
          value={form.balcony_num}
          onChange={(e) => setForm({ ...form, balcony_num: Number(e.target.value) })}
        />
      </div>

      <div className="field">
        <label htmlFor="furnishing">Furnishing</label>
        <select
          id="furnishing"
          value={form.furnishing}
          onChange={(e) => setForm({ ...form, furnishing: e.target.value as PredictionRequest["furnishing"] })}
        >
          {FURNISHING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="transaction">Transaction</label>
        <select
          id="transaction"
          value={form.transaction}
          onChange={(e) => setForm({ ...form, transaction: e.target.value as PredictionRequest["transaction"] })}
        >
          {TRANSACTION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="ownership">Ownership</label>
        <select
          id="ownership"
          value={form.ownership}
          onChange={(e) => setForm({ ...form, ownership: e.target.value })}
        >
          {OWNERSHIP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="facing">Facing</label>
        <select id="facing" value={form.facing} onChange={(e) => setForm({ ...form, facing: e.target.value })}>
          {FACING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {errors.length > 0 && (
        <ul className="form-errors">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Predicting…" : "Predict price"}
      </button>
    </form>
  );
}
