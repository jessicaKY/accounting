"use client";

import { useState, type FormEvent } from "react";

import type { NewAccountingRecord, RecordKind } from "@/types/accounting";

import styles from "./accounting.module.css";

interface AccountingFormProps {
  busy: boolean;
  onAdd: (record: NewAccountingRecord) => Promise<void>;
}

export function AccountingForm({ busy, onAdd }: AccountingFormProps) {
  const [kind, setKind] = useState<RecordKind>("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

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
      <label className={styles.srOnly} htmlFor="record-kind">
        收支類型
      </label>
      <select
        id="record-kind"
        value={kind}
        onChange={(event) => setKind(event.target.value as RecordKind)}
      >
        <option value="income">收入</option>
        <option value="expense">支出</option>
      </select>

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
