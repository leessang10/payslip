import type { FormData, WorkerProfile } from "./types";

export const WORKER_PROFILE_KEY = "payslip_worker_profiles_v1";
export const COMPANY_PROFILE_KEY = "payslip_company_profiles_v1";

export const today = new Date().toISOString().slice(0, 10);

export const defaultForm: FormData = {
  workerType: "employee",
  workerName: "",
  companyName: "",
  companyRegNo: "",
  companyAddress: "",
  companyManager: "",
  payDate: today,
  workPeriodType: "month",
  workPeriodStart: "",
  workPeriodEnd: "",
  bankName: "",
  bankAccount: "",
  basePay: "0",
  overtimePay: "0",
  bonusPay: "0",
  otherAllowances: "0",
  nonTaxable: "0",
  memo: "",
};

export const workerDefaults: WorkerProfile["data"] = {
  workerType: defaultForm.workerType,
  workerName: defaultForm.workerName,
  payDate: defaultForm.payDate,
  workPeriodType: defaultForm.workPeriodType,
  workPeriodStart: defaultForm.workPeriodStart,
  workPeriodEnd: defaultForm.workPeriodEnd,
  bankName: defaultForm.bankName,
  bankAccount: defaultForm.bankAccount,
  basePay: defaultForm.basePay,
  overtimePay: defaultForm.overtimePay,
  bonusPay: defaultForm.bonusPay,
  otherAllowances: defaultForm.otherAllowances,
  nonTaxable: defaultForm.nonTaxable,
  memo: defaultForm.memo,
};
