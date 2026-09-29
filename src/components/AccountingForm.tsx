"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import type { NewAccountingRecord, RecordKind } from "@/types/accounting";

import styles from "./accounting.module.css";

interface AccountingFormProps {
  busy: boolean;
  onAdd: (record: NewAccountingRecord) => Promise<void>;
}

export function AccountingForm({ busy, onAdd }: AccountingFormProps) {
  const [kind, setKind] = useState<RecordKind>("income");
  const [kindMenuOpen, setKindMenuOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const kindPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeKindMenu(event: PointerEvent) {
      if (!kindPickerRef.current?.contains(event.target as Node)) {
        setKindMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeKindMenu);
    return () => document.removeEventListener("pointerdown", closeKindMenu);
  }, []);

  function chooseKind(nextKind: RecordKind) {
    setKind(nextKind);
    setKindMenuOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    const trimmedDescription = description.trim();

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setValidationMessage("金額必須是大於 0 的數字");
      return;
    }
    if (!trimmedDescription) {
      setValidationMessage("請輸入項目說明");
      return;
    }

    setValidationMessage("");
    await onAdd({ kind, amount: Math.round(parsedAmount), description: trimmedDescription });
    setAmount("");
    setDescription("");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.kindPicker} ref={kindPickerRef}>
        <button
          aria-controls="record-kind-options"
          aria-expanded={kindMenuOpen}
          aria-haspopup="listbox"
          aria-label="收支類型"
          className={styles.kindTrigger}
          onClick={() => setKindMenuOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setKindMenuOpen(false);
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setKindMenuOpen(true);
            }
          }}
          type="button"
        >
          <span>{kind === "income" ? "收入" : "支出"}</span>
          <span aria-hidden="true" className={styles.kindArrow} />
        </button>

        {kindMenuOpen ? (
          <div
            aria-label="收支類型選項"
            className={styles.kindMenu}
            id="record-kind-options"
            role="listbox"
          >
            <button
              aria-selected={kind === "income"}
              className={styles.kindOption}
              data-selected={kind === "income"}
              onClick={() => chooseKind("income")}
              role="option"
              type="button"
            >
              收入
            </button>
            <button
              aria-selected={kind === "expense"}
              className={styles.kindOption}
              data-selected={kind === "expense"}
              onClick={() => chooseKind("expense")}
              role="option"
              type="button"
            >
              支出
            </button>
          </div>
        ) : null}
      </div>

      <label className={styles.srOnly} htmlFor="record-amount">
        金額
      </label>
      <input
        id="record-amount"
        inputMode="numeric"
        min="1"
        placeholder="金額"
        type="number"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
      />

      <label className={styles.srOnly} htmlFor="record-description">
        項目說明
      </label>
      <input
        id="record-description"
        maxLength={40}
        placeholder="項目說明"
        type="text"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <button disabled={busy} type="submit">
        {busy ? "處理中" : "新增紀錄"}
      </button>

      {validationMessage ? (
        <p className={styles.validation} role="alert">
          {validationMessage}
        </p>
      ) : null}
    </form>
  );
}
