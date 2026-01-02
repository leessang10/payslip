import type { RefObject } from "react";
import type { CalculationResult, PayItem } from "../calculations";
import type { FormData } from "../types";
import { pdfStyles } from "../pdfStyles";
import { formatCurrency } from "../utils";

type PdfTemplateProps = {
  form: FormData;
  calculations: CalculationResult;
  payItems: PayItem[];
  workPeriodLabel: string;
  templateRef: RefObject<HTMLDivElement>;
};

export default function PdfTemplate({
  form,
  calculations,
  payItems,
  workPeriodLabel,
  templateRef,
}: PdfTemplateProps) {
  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", left: "-10000px", top: 0, width: "210mm" }}
    >
      <div ref={templateRef} style={pdfStyles.page}>
        <div style={pdfStyles.header}>
          <div>
            <p style={pdfStyles.label}>급여명세서</p>
            <h3 style={pdfStyles.title}>{form.workerName || "근로자"}</h3>
            <p style={pdfStyles.subtitle}>
              형태: {form.workerType === "employee" ? "임금근로자" : "프리랜서"}
            </p>
            <p style={pdfStyles.subtitle}>회사: {form.companyName || "회사명"}</p>
            <p style={pdfStyles.subtitle}>지급일 {form.payDate || "-"}</p>
          </div>
        </div>

        <div style={pdfStyles.gridThree}>
          <div style={pdfStyles.card}>
            <p style={pdfStyles.cardTitle}>근로 정보</p>
            <p style={pdfStyles.cardValue}>
              {workPeriodLabel}: {form.workPeriodStart || "-"} ~{" "}
              {form.workPeriodEnd || "-"}
            </p>
          </div>
          <div style={pdfStyles.card}>
            <p style={pdfStyles.cardTitle}>지급 정보</p>
            <p style={pdfStyles.cardValue}>{form.bankName || "-"}</p>
            <p style={pdfStyles.subtitle}>{form.bankAccount || "-"}</p>
          </div>
          <div style={pdfStyles.card}>
            <p style={pdfStyles.cardTitle}>회사 정보</p>
            <p style={pdfStyles.cardValue}>{form.companyName || "-"}</p>
            <p style={pdfStyles.subtitle}>
              사업자번호: {form.companyRegNo || "-"}
            </p>
            <p style={pdfStyles.subtitle}>주소: {form.companyAddress || "-"}</p>
            <p style={pdfStyles.subtitle}>
              담당자: {form.companyManager || "-"}
            </p>
          </div>
        </div>

        <div style={pdfStyles.gridTwo}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={pdfStyles.sectionTitle}>
              <span>지급 항목</span>
              <span>합계</span>
            </div>
            {payItems.map((item) => (
              <div key={item.label} style={pdfStyles.row}>
                <span>{item.label}</span>
                <span>{formatCurrency(item.value)}원</span>
              </div>
            ))}
            <div style={{ ...pdfStyles.totalRow, ...pdfStyles.totalRowAuto }}>
              <span>총지급</span>
              <span>{formatCurrency(calculations.gross)}원</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={pdfStyles.sectionTitle}>
              <span>공제 항목</span>
              <span>과세 {formatCurrency(calculations.taxable)}원</span>
            </div>
            {calculations.deductionLabels.map((item) => (
              <div key={item.key} style={pdfStyles.row}>
                <span>{item.label}</span>
                <span>{formatCurrency(calculations.deductions[item.key])}원</span>
              </div>
            ))}
            <div
              style={{
                ...pdfStyles.totalRow,
                ...pdfStyles.totalRowDeduction,
                ...pdfStyles.totalRowAuto,
              }}
            >
              <span>총공제</span>
              <span>{formatCurrency(calculations.totalDeductions)}원</span>
            </div>
          </div>
        </div>

        <div style={pdfStyles.summary}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600 }}>실수령액</span>
            <span style={{ fontWeight: 700 }}>
              {formatCurrency(calculations.netPay)}원
            </span>
          </div>
          <p style={{ marginTop: "2mm", fontSize: "10px", color: "#64748b" }}>
            ※ 세금 및 4대보험은 2024년 기준 간이 계산값이며 실제 고지 금액과
            차이가 있을 수 있습니다.
          </p>
          {form.memo && (
            <p style={{ ...pdfStyles.subtitle, ...pdfStyles.memo }}>
              메모: {form.memo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
