"use client";

import { type FormEvent, useState } from "react";
import type { Category } from "@/types/category";
import type { TransactionInput, TransactionType } from "@/types/transaction";

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (input: TransactionInput) => Promise<void>;
  initialValue?: TransactionInput;
  submitLabel?: string;
  onCancel?: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function TransactionForm({
  categories,
  onSubmit,
  initialValue,
  submitLabel = "Toevoegen",
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(
    initialValue?.type ?? "expense",
  );
  const [amount, setAmount] = useState(
    initialValue ? String(initialValue.amount) : "",
  );
  const [date, setDate] = useState(initialValue?.date ?? today());
  const [categoryId, setCategoryId] = useState(initialValue?.categoryId ?? "");
  const [description, setDescription] = useState(
    initialValue?.description ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await onSubmit({
        type,
        amount: Number(amount),
        date,
        categoryId: categoryId || null,
        description,
      });
      if (!initialValue) {
        setType("expense");
        setAmount("");
        setDate(today());
        setCategoryId("");
        setDescription("");
      }
      setError(null);
    } catch {
      setError("Bedrag is verplicht");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          value={type}
          onChange={(event) => setType(event.target.value as TransactionType)}
        >
          <option value="expense">Uitgave</option>
          <option value="income">Inkomst</option>
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="amount">Bedrag</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>
      <div className="form-row">
        <label htmlFor="date">Datum</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>
      <div className="form-row">
        <label htmlFor="categoryId">Categorie</label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">Geen categorie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
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
