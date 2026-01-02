import type { FormData } from "./types";

export const toNumber = (value: string) => Number(value.replace(/,/g, "")) || 0;

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ko-KR").format(Math.round(value));

export const getWorkerProfileLabel = (form: FormData, fallback: string) => {
  const name = form.workerName.trim() || "근로자";
  return `${name}_${form.payDate || fallback}`;
};

export const getCompanyProfileLabel = (form: FormData) =>
  form.companyName.trim() || "회사";

export const calcEmployeeIncomeTax = (taxable: number) => {
  if (taxable <= 1200000) return taxable * 0.006;
  if (taxable <= 4600000) return taxable * 0.015 - 10800;
  if (taxable <= 8800000) return taxable * 0.024 - 52200;
  if (taxable <= 15000000) return taxable * 0.035 - 149000;
  if (taxable <= 30000000) return taxable * 0.038 - 194000;
  return taxable * 0.04 - 254000;
};
