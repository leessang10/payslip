import type { ChangeEvent } from "react";
import type { FormData } from "../types";

type InputSectionProps = {
  form: FormData;
  workPeriodInputType: "date" | "month";
  showOvertime: boolean;
  showBonus: boolean;
  showOtherAllowances: boolean;
  onChangeField: (
    field: keyof FormData
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectWorkerType: (value: FormData["workerType"]) => void;
  onSelectWorkPeriodType: (value: FormData["workPeriodType"]) => void;
  onToggleOvertime: () => void;
  onToggleBonus: () => void;
  onToggleOtherAllowances: () => void;
  onOpenCompanySave: () => void;
  onOpenCompanyLoad: () => void;
  onOpenWorkerSave: () => void;
  onOpenWorkerLoad: () => void;
};

export default function InputSection({
  form,
  workPeriodInputType,
  showOvertime,
  showBonus,
  showOtherAllowances,
  onChangeField,
  onSelectWorkerType,
  onSelectWorkPeriodType,
  onToggleOvertime,
  onToggleBonus,
  onToggleOtherAllowances,
  onOpenCompanySave,
  onOpenCompanyLoad,
  onOpenWorkerSave,
  onOpenWorkerLoad,
}: InputSectionProps) {
  return (
    <section className="h-full rounded-3xl border border-white/40 bg-white/80 p-6 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.9)] backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">입력 폼</h2>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          {form.workerType === "employee" ? "임금근로자" : "프리랜서"}
        </span>
      </div>

      <div className="mt-6 grid gap-5">
        <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-700">회사 정보</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenCompanySave}
                className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold text-white"
              >
                저장
              </button>
              <button
                type="button"
                onClick={onOpenCompanyLoad}
                className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-600"
              >
                불러오기
              </button>
            </div>
          </div>
          <div className="mt-3 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  회사명
                </label>
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.companyName}
                  onChange={onChangeField("companyName")}
                  placeholder="회사명을 입력해주세요."
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  사업자 등록번호
                </label>
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.companyRegNo}
                  onChange={onChangeField("companyRegNo")}
                  placeholder="000-00-00000"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-500">
                회사 주소
              </label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={form.companyAddress}
                onChange={onChangeField("companyAddress")}
                placeholder="서울특별시 ..."
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-500">
                대표자
              </label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={form.companyManager}
                onChange={onChangeField("companyManager")}
                placeholder="대표자 이름"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-700">
              근로자 정보
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenWorkerSave}
                className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold text-white"
              >
                저장
              </button>
              <button
                type="button"
                onClick={onOpenWorkerLoad}
                className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-600"
              >
                불러오기
              </button>
            </div>
          </div>
          <div className="mt-3 grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-500">
                근로 형태
              </label>
              <div className="flex gap-2">
                {([
                  { value: "employee", label: "임금근로자" },
                  { value: "freelancer", label: "프리랜서" },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSelectWorkerType(option.value)}
                    className={`flex-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      form.workerType === option.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  근로자 이름
                </label>
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.workerName}
                  onChange={onChangeField("workerName")}
                  placeholder="홍길동"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  지급일
                </label>
                <input
                  type="date"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.payDate}
                  onChange={onChangeField("payDate")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
          <h3 className="text-sm font-semibold text-slate-700">근로 기간</h3>
          <div className="mt-3 grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-500">
                근로 기간 유형
              </label>
              <div className="flex gap-2">
                {([
                  { value: "date", label: "일자별" },
                  { value: "month", label: "월별" },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSelectWorkPeriodType(option.value)}
                    className={`flex-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      form.workPeriodType === option.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  근로 기간 시작
                </label>
                <input
                  type={workPeriodInputType}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.workPeriodStart}
                  onChange={onChangeField("workPeriodStart")}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  근로 기간 종료
                </label>
                <input
                  type={workPeriodInputType}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.workPeriodEnd}
                  onChange={onChangeField("workPeriodEnd")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
          <h3 className="text-sm font-semibold text-slate-700">급여 정보</h3>
          <div className="mt-3 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  입금 은행
                </label>
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.bankName}
                  onChange={onChangeField("bankName")}
                  placeholder="국민은행"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  계좌번호
                </label>
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.bankAccount}
                  onChange={onChangeField("bankAccount")}
                  placeholder="000-0000-0000"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-500">
                수당 입력
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onToggleOvertime}
                  className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                    showOvertime
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {showOvertime ? "연장/야간 숨기기" : "연장/야간 추가"}
                </button>
                <button
                  type="button"
                  onClick={onToggleBonus}
                  className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                    showBonus
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {showBonus ? "상여 숨기기" : "상여 추가"}
                </button>
                <button
                  type="button"
                  onClick={onToggleOtherAllowances}
                  className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                    showOtherAllowances
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {showOtherAllowances
                    ? "기타 수당 숨기기"
                    : "기타 수당 추가"}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                필요한 수당 항목만 열어서 입력하세요.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  기본급
                </label>
                <input
                  type="number"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.basePay}
                  onChange={onChangeField("basePay")}
                />
              </div>
              {showOvertime && (
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-500">
                    연장/야간 수당
                  </label>
                  <input
                    type="number"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={form.overtimePay}
                    onChange={onChangeField("overtimePay")}
                  />
                </div>
              )}
              {showBonus && (
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-500">
                    상여금
                  </label>
                  <input
                    type="number"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={form.bonusPay}
                    onChange={onChangeField("bonusPay")}
                  />
                </div>
              )}
              {showOtherAllowances && (
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-500">
                    기타 수당
                  </label>
                  <input
                    type="number"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={form.otherAllowances}
                    onChange={onChangeField("otherAllowances")}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
          <h3 className="text-sm font-semibold text-slate-700">세금 정보</h3>
          <div className="mt-3 grid gap-2">
            <label className="text-xs font-semibold text-slate-500">
              비과세
            </label>
            <input
              type="number"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.nonTaxable}
              onChange={onChangeField("nonTaxable")}
            />
            <p className="text-[11px] text-slate-500">
              비과세 항목은 과세 대상에서 제외됩니다.
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-500">메모</label>
          <textarea
            className="min-h-[90px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={form.memo}
            onChange={onChangeField("memo")}
          />
        </div>
      </div>
    </section>
  );
}
