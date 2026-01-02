import type { CalculationResult, PayItem } from "../calculations";
import type { FormData } from "../types";
import { formatCurrency } from "../utils";

type PreviewSectionProps = {
  form: FormData;
  calculations: CalculationResult;
  payItems: PayItem[];
  workPeriodLabel: string;
  isExporting: boolean;
  onExportPdf: () => void;
};

export default function PreviewSection({
  form,
  calculations,
  payItems,
  workPeriodLabel,
  isExporting,
  onExportPdf,
}: PreviewSectionProps) {
  return (
    <section className="flex h-full flex-col">
      <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.9)] backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">미리보기</h2>
          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExporting}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isExporting ? "PDF 생성 중..." : "PDF 다운로드"}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4">
          <div
            className="mx-auto w-full rounded-2xl bg-white p-6 text-[13px] text-slate-900 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)] sm:text-sm"
            style={{ maxWidth: "210mm", minHeight: "297mm" }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">급여명세서</p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">
                  {form.workerName || "근로자"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  형태:{" "}
                  {form.workerType === "employee" ? "임금근로자" : "프리랜서"}
                </p>
                <p className="text-xs text-slate-500">
                  회사: {form.companyName || "회사명"}
                </p>
                <p className="text-xs text-slate-500">
                  지급일 {form.payDate || "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">근로 정보</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {workPeriodLabel}: {form.workPeriodStart || "-"} ~{" "}
                  {form.workPeriodEnd || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">지급 정보</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {form.bankName || "-"}
                </p>
                <p className="text-xs text-slate-600">
                  {form.bankAccount || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">회사 정보</p>
                <p className="mt-1 text-sm font-semibold">
                  {form.companyName || "-"}
                </p>
                <p className="text-xs text-slate-500">
                  사업자번호: {form.companyRegNo || "-"}
                </p>
                <p className="text-xs text-slate-500">
                  주소: {form.companyAddress || "-"}
                </p>
                <p className="text-xs text-slate-500">
                  담당자: {form.companyManager || "-"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid items-stretch gap-6 sm:grid-cols-2">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-sm font-semibold">지급 항목</h4>
                  <span className="text-xs text-slate-500">합계</span>
                </div>
                <div className="mt-3 flex flex-1 flex-col gap-2">
                  {payItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <span className="text-xs text-slate-600">
                        {item.label}
                      </span>
                      <span className="text-xs font-semibold">
                        {formatCurrency(item.value)}원
                      </span>
                    </div>
                  ))}
                  <div className="mt-auto flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-white">
                    <span className="text-xs font-semibold">총지급</span>
                    <span className="text-xs font-semibold">
                      {formatCurrency(calculations.gross)}원
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-sm font-semibold">공제 항목</h4>
                  <span className="text-xs text-slate-500">
                    과세: {formatCurrency(calculations.taxable)}원
                  </span>
                </div>
                <div className="mt-3 flex flex-1 flex-col gap-2">
                  {calculations.deductionLabels.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <span className="text-xs text-slate-600">
                        {item.label}
                      </span>
                      <span className="text-xs font-semibold">
                        {formatCurrency(calculations.deductions[item.key])}원
                      </span>
                    </div>
                  ))}
                  <div className="mt-auto flex items-center justify-between rounded-lg bg-rose-500 px-3 py-2 text-white">
                    <span className="text-xs font-semibold">총공제</span>
                    <span className="text-xs font-semibold">
                      {formatCurrency(calculations.totalDeductions)}원
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>실수령액</span>
                <span>{formatCurrency(calculations.netPay)}원</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                ※ 세금 및 4대보험은 2024년 기준 간이 계산값이며 실제 고지
                금액과 차이가 있을 수 있습니다.
              </p>
              {form.memo && (
                <p className="mt-2 text-[11px] text-slate-500">
                  메모: {form.memo}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
