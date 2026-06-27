"use client";

import { type FormEvent, useEffect, useState } from "react";
import type { HouseholdBookInput } from "@/types/household-book";

interface HouseholdBookFormProps {
  onSubmit: (input: HouseholdBookInput) => Promise<void>;
  initialValue?: HouseholdBookInput;
  submitLabel?: string;
  onCancel?: () => void;
}

export function HouseholdBookForm({
  onSubmit,
  initialValue,
  submitLabel = "Toevoegen",
  onCancel,
}: HouseholdBookFormProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [description, setDescription] = useState(
    initialValue?.description ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialValue?.name ?? "");
    setDescription(initialValue?.description ?? "");
  }, [initialValue]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await onSubmit({ name, description });
      if (!initialValue) {
        setName("");
        setDescription("");
      }
      setError(null);
    } catch {
      setError("Naam is verplicht");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="name">Naam</label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="form-row">
        <label htmlFor="description">Omschrijving</label>
        <input
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
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
