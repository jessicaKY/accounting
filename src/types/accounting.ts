export type RecordKind = "income" | "expense";

export interface AccountingRecord {
  id: string;
  kind: RecordKind;
  amount: number;
  description: string;
  createdAt: number;
}

export type NewAccountingRecord = Omit<AccountingRecord, "id" | "createdAt">;

export interface AccountingSummary {
  balance: number;
  count: number;
  updatedAt: number;
}

export type DataMode = "loading" | "firebase" | "local";
