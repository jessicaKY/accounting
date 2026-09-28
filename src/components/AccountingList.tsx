"use client";

import type { AccountingRecord } from "@/types/accounting";

import styles from "./accounting.module.css";

interface AccountingListProps {
  records: AccountingRecord[];
  busy: boolean;
  onDelete: (recordId: string) => Promise<void>;
}

const numberFormatter = new Intl.NumberFormat("zh-TW");

export function AccountingList({
  records,
  busy,
  onDelete,
}: AccountingListProps) {
  if (!records.length) {
    return <p className={styles.empty}>尚無記錄，請新增第一筆收支。</p>;
  }

  return (
    <ul className={styles.list} aria-label="記帳紀錄">
      {records.map((record) => {
        const isIncome = record.kind === "income";
        return (
          <li className={styles.record} key={record.id}>
            <span
              className={isIncome ? styles.income : styles.expense}
              aria-label={isIncome ? "收入" : "支出"}
            >
              {isIncome ? "" : "-"}
              {numberFormatter.format(record.amount)}
            </span>
            <span className={styles.description}>{record.description}</span>
            <button
              aria-label={`刪除 ${record.description}`}
              disabled={busy}
              onClick={() => void onDelete(record.id)}
              type="button"
            >
              刪除
            </button>
          </li>
        );
      })}
    </ul>
  );
}
