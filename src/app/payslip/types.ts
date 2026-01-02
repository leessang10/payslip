export type WorkerType = "employee" | "freelancer";

export type WorkPeriodType = "date" | "month";

export type DeductionKey =
  | "incomeTax"
  | "localTax"
  | "nationalPension"
  | "healthInsurance"
  | "longTermCare"
  | "employmentInsurance";

export type DeductionLabel = {
  key: DeductionKey;
  label: string;
};

export type FormData = {
  workerType: WorkerType;
  workerName: string;
  companyName: string;
  companyRegNo: string;
  companyAddress: string;
  companyManager: string;
  payDate: string;
  workPeriodType: WorkPeriodType;
  workPeriodStart: string;
  workPeriodEnd: string;
  bankName: string;
  bankAccount: string;
  basePay: string;
  overtimePay: string;
  bonusPay: string;
  otherAllowances: string;
  nonTaxable: string;
  memo: string;
};

export type WorkerProfile = {
  id: string;
  label: string;
  data: Pick<
    FormData,
    | "workerType"
    | "workerName"
    | "payDate"
    | "workPeriodType"
    | "workPeriodStart"
    | "workPeriodEnd"
    | "bankName"
    | "bankAccount"
    | "basePay"
    | "overtimePay"
    | "bonusPay"
    | "otherAllowances"
    | "nonTaxable"
    | "memo"
  >;
};

export type CompanyProfile = {
  id: string;
  label: string;
  data: Pick<
    FormData,
    "companyName" | "companyRegNo" | "companyAddress" | "companyManager"
  >;
};
