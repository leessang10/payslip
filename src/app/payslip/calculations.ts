import type { DeductionKey, FormData } from "./types";
import { calcEmployeeIncomeTax, toNumber } from "./utils";

export type CalculationResult = {
  gross: number;
  taxable: number;
  deductions: Record<DeductionKey, number>;
  totalDeductions: number;
  netPay: number;
  deductionLabels: { key: DeductionKey; label: string }[];
};

export const getCalculations = (form: FormData): CalculationResult => {
  const basePay = toNumber(form.basePay);
  const overtimePay = toNumber(form.overtimePay);
  const bonusPay = toNumber(form.bonusPay);
  const otherAllowances = toNumber(form.otherAllowances);
  const nonTaxable = toNumber(form.nonTaxable);

  const gross = basePay + overtimePay + bonusPay + otherAllowances;
  const taxable = Math.max(0, gross - nonTaxable);

  if (form.workerType === "freelancer") {
    const incomeTax = taxable * 0.03;
    const localTax = taxable * 0.003;
    const totalDeductions = incomeTax + localTax;

    return {
      gross,
      taxable,
      deductions: {
        incomeTax,
        localTax,
        nationalPension: 0,
        healthInsurance: 0,
        longTermCare: 0,
        employmentInsurance: 0,
      },
      totalDeductions,
      netPay: gross - totalDeductions,
      deductionLabels: [
        { key: "incomeTax", label: "소득세(3%)" },
        { key: "localTax", label: "지방소득세(0.3%)" },
      ],
    };
  }

  const nationalPension = taxable * 0.045;
  const healthInsurance = taxable * 0.03545;
  const longTermCare = healthInsurance * 0.1281;
  const employmentInsurance = taxable * 0.009;
  const incomeTax = Math.max(0, calcEmployeeIncomeTax(taxable));
  const localTax = incomeTax * 0.1;

  const totalDeductions =
    nationalPension +
    healthInsurance +
    longTermCare +
    employmentInsurance +
    incomeTax +
    localTax;

  return {
    gross,
    taxable,
    deductions: {
      incomeTax,
      localTax,
      nationalPension,
      healthInsurance,
      longTermCare,
      employmentInsurance,
    },
    totalDeductions,
    netPay: gross - totalDeductions,
    deductionLabels: [
      { key: "nationalPension", label: "국민연금(4.5%)" },
      { key: "healthInsurance", label: "건강보험(3.545%)" },
      { key: "longTermCare", label: "장기요양(건보 12.81%)" },
      { key: "employmentInsurance", label: "고용보험(0.9%)" },
      { key: "incomeTax", label: "근로소득세(간이)" },
      { key: "localTax", label: "지방소득세(소득세 10%)" },
    ],
  };
};

export type PayItem = { label: string; value: number };

export const getPayItems = (form: FormData): PayItem[] => [
  { label: "기본급", value: toNumber(form.basePay) },
  { label: "연장/야간", value: toNumber(form.overtimePay) },
  { label: "상여", value: toNumber(form.bonusPay) },
  { label: "기타수당", value: toNumber(form.otherAllowances) },
];

export const getWorkPeriodLabel = (form: FormData) =>
  form.workPeriodType === "date" ? "근로기간(일자)" : "근로기간(월)";

export const getWorkPeriodInputType = (form: FormData) =>
  form.workPeriodType === "date" ? "date" : "month";
