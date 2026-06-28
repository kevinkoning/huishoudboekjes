"use client";

import { type FormEvent, useState } from "react";
import type { CategoryInput } from "@/types/category";

interface CategoryFormProps {
  onSubmit: (input: CategoryInput) => Promise<void>;
  initialValue?: CategoryInput;
  submitLabel?: string;
  onCancel?: () => void;
}

export function CategoryForm({
  onSubmit,
  initialValue,
  submitLabel = "Toevoegen",
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [maxBudget, setMaxBudget] = useState(
    initialValue ? String(initialValue.maxBudget) : "",
  );
  const [endDate, setEndDate] = useState(initialValue?.endDate ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await onSubmit({
        name,
        maxBudget: Number(maxBudget),
        endDate: endDate || undefined,
      });
      if (!initialValue) {
        setName("");
        setMaxBudget("");
        setEndDate("");
      }
      setError(null);
    } catch {
      setError("Naam en maximaal budget zijn verplicht");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="category-name">Naam</label>
        <input
          id="category-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="form-row">
        <label htmlFor="maxBudget">Maximaal budget</label>
        <input
          id="maxBudget"
          type="number"
          step="0.01"
          value={maxBudget}
          onChange={(event) => setMaxBudget(event.target.value)}
        />
      </div>
      <div className="form-row">
        <label htmlFor="endDate">Einddatum (optioneel)</label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">
          {submitLabel}
        </button>
        {onCancel && (
          <button className="btn btn-secondary" type="button" onClick={onCancel}>
            Annuleren
          </button>
        )}
      </div>
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
