"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type WorkerType = "employee" | "freelancer";

type WorkPeriodType = "date" | "month";

type DeductionKey =
  | "incomeTax"
  | "localTax"
  | "nationalPension"
  | "healthInsurance"
  | "longTermCare"
  | "employmentInsurance";

type DeductionLabel = {
  key: DeductionKey;
  label: string;
};

type FormData = {
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

type WorkerProfile = {
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

type CompanyProfile = {
  id: string;
  label: string;
  data: Pick<
    FormData,
    "companyName" | "companyRegNo" | "companyAddress" | "companyManager"
  >;
};

const WORKER_PROFILE_KEY = "payslip_worker_profiles_v1";
const COMPANY_PROFILE_KEY = "payslip_company_profiles_v1";

const today = new Date().toISOString().slice(0, 10);

const defaultForm: FormData = {
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

const toNumber = (value: string) => Number(value.replace(/,/g, "")) || 0;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ko-KR").format(Math.round(value));

const getWorkerProfileLabel = (form: FormData, fallback: string) => {
  const name = form.workerName.trim() || "근로자";
  return `${name}_${form.payDate || fallback}`;
};

const getCompanyProfileLabel = (form: FormData) =>
  form.companyName.trim() || "회사";

const calcEmployeeIncomeTax = (taxable: number) => {
  if (taxable <= 1200000) return taxable * 0.006;
  if (taxable <= 4600000) return taxable * 0.015 - 10800;
  if (taxable <= 8800000) return taxable * 0.024 - 52200;
  if (taxable <= 15000000) return taxable * 0.035 - 149000;
  if (taxable <= 30000000) return taxable * 0.038 - 194000;
  return taxable * 0.04 - 254000;
};

export default function Home() {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [workerProfiles, setWorkerProfiles] = useState<WorkerProfile[]>([]);
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [workerProfileLabel, setWorkerProfileLabel] = useState("");
  const [selectedWorkerProfileId, setSelectedWorkerProfileId] = useState("");
  const [companyProfileLabel, setCompanyProfileLabel] = useState("");
  const [selectedCompanyProfileId, setSelectedCompanyProfileId] = useState("");
  const [showCompanySaveModal, setShowCompanySaveModal] = useState(false);
  const [showCompanyLoadModal, setShowCompanyLoadModal] = useState(false);
  const [showWorkerLoadModal, setShowWorkerLoadModal] = useState(false);
  const [showWorkerSaveModal, setShowWorkerSaveModal] = useState(false);
  const [showOvertime, setShowOvertime] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const [showOtherAllowances, setShowOtherAllowances] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedWorkers = window.localStorage.getItem(WORKER_PROFILE_KEY);
    if (storedWorkers) {
      try {
        const parsed = JSON.parse(storedWorkers) as WorkerProfile[];
        const normalized = parsed.map((profile) => ({
          ...profile,
          data: { ...defaultForm, ...profile.data },
        }));
        setWorkerProfiles(normalized);
      } catch {
        setWorkerProfiles([]);
      }
    }
    const storedCompanies = window.localStorage.getItem(COMPANY_PROFILE_KEY);
    if (storedCompanies) {
      try {
        const parsed = JSON.parse(storedCompanies) as CompanyProfile[];
        setCompanyProfiles(parsed);
      } catch {
        setCompanyProfiles([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      WORKER_PROFILE_KEY,
      JSON.stringify(workerProfiles)
    );
  }, [workerProfiles]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      COMPANY_PROFILE_KEY,
      JSON.stringify(companyProfiles)
    );
  }, [companyProfiles]);

  const calculations = useMemo(() => {
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
        ] as DeductionLabel[],
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
      ] as DeductionLabel[],
    };
  }, [form]);

  const payItems = [
    { label: "기본급", value: toNumber(form.basePay) },
    { label: "연장/야간", value: toNumber(form.overtimePay) },
    { label: "상여", value: toNumber(form.bonusPay) },
    { label: "기타수당", value: toNumber(form.otherAllowances) },
  ];

  const handleChange = (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleLoadWorkerProfile = (id: string) => {
    setSelectedWorkerProfileId(id);
    const profile = workerProfiles.find((item) => item.id === id);
    if (profile) {
      setForm((prev) => ({ ...prev, ...profile.data }));
      setShowOvertime(toNumber(profile.data.overtimePay) > 0);
      setShowBonus(toNumber(profile.data.bonusPay) > 0);
      setShowOtherAllowances(toNumber(profile.data.otherAllowances) > 0);
    }
    setShowWorkerLoadModal(false);
  };

  const handleSaveWorkerProfile = () => {
    const label =
      workerProfileLabel.trim() || getWorkerProfileLabel(form, today);
    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
      String(Date.now());

    const newProfile: WorkerProfile = {
      id,
      label,
      data: {
        workerType: form.workerType,
        workerName: form.workerName,
        payDate: form.payDate,
        workPeriodType: form.workPeriodType,
        workPeriodStart: form.workPeriodStart,
        workPeriodEnd: form.workPeriodEnd,
        bankName: form.bankName,
        bankAccount: form.bankAccount,
        basePay: form.basePay,
        overtimePay: form.overtimePay,
        bonusPay: form.bonusPay,
        otherAllowances: form.otherAllowances,
        nonTaxable: form.nonTaxable,
        memo: form.memo,
      },
    };

    setWorkerProfiles((prev) => [newProfile, ...prev]);
    setWorkerProfileLabel("");
    setSelectedWorkerProfileId(id);
    setShowWorkerSaveModal(false);
  };

  const handleDeleteWorkerProfile = (id?: string) => {
    const targetId = id ?? selectedWorkerProfileId;
    if (!targetId) return;
    setWorkerProfiles((prev) =>
      prev.filter((item) => item.id !== targetId)
    );
    if (selectedWorkerProfileId === targetId) {
      setSelectedWorkerProfileId("");
    }
  };

  const handleSelectCompanyProfile = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const id = event.target.value;
    setSelectedCompanyProfileId(id);
    const profile = companyProfiles.find((item) => item.id === id);
    if (profile) {
      setForm((prev) => ({ ...prev, ...profile.data }));
    }
  };

  const handleSaveCompanyProfile = () => {
    const companyRegNo = form.companyRegNo.trim();
    const companyName = form.companyName.trim();
    if (!companyRegNo || !companyName) return;
    const label = companyProfileLabel.trim() || getCompanyProfileLabel(form);
    const id = companyRegNo;

    const newProfile: CompanyProfile = {
      id,
      label,
      data: {
        companyName: form.companyName,
        companyRegNo: form.companyRegNo,
        companyAddress: form.companyAddress,
        companyManager: form.companyManager,
      },
    };

    setCompanyProfiles((prev) => {
      const exists = prev.some((item) => item.id === id);
      if (exists) {
        return prev.map((item) => (item.id === id ? newProfile : item));
      }
      return [newProfile, ...prev];
    });
    setCompanyProfileLabel("");
    setSelectedCompanyProfileId(id);
    setShowCompanySaveModal(false);
  };

  const handleLoadCompanyProfile = (id: string) => {
    setSelectedCompanyProfileId(id);
    const profile = companyProfiles.find((item) => item.id === id);
    if (profile) {
      setForm((prev) => ({ ...prev, ...profile.data }));
    }
    setShowCompanyLoadModal(false);
  };

  const handleDeleteCompanyProfile = (id?: string) => {
    const targetId = id ?? selectedCompanyProfileId;
    if (!targetId) return;
    setCompanyProfiles((prev) =>
      prev.filter((item) => item.id !== targetId)
    );
    if (selectedCompanyProfileId === targetId) {
      setSelectedCompanyProfileId("");
    }
  };

  const handleExportPdf = async () => {
    if (!previewRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `급여명세서_${form.workerName || "근로자"}_${
        form.payDate || today
      }.pdf`;
      pdf.save(fileName);
    } finally {
      setIsExporting(false);
    }
  };

  const workPeriodLabel =
    form.workPeriodType === "date" ? "근로기간(일자)" : "근로기간(월)";

  const workPeriodInputType =
    form.workPeriodType === "date" ? "date" : "month";

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Payslip Studio
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            한국 급여명세서 PDF 생성기
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            입력 폼에서 급여 정보를 채우면 오른쪽 미리보기에서 실시간 반영되고,
            선택한 근로 형태에 따라 세금이 자동 계산됩니다. 저장한 근로자 정보는
            브라우저에 보관됩니다.
          </p>
        </header>

        <div className="rounded-3xl border border-white/40 bg-white/40 p-4 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.4)] backdrop-blur">
          <div className="grid items-stretch gap-8 lg:grid-cols-[1.05fr_1fr]">
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
                  <h3 className="text-sm font-semibold text-slate-700">
                    회사 정보
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCompanyProfileLabel(getCompanyProfileLabel(form));
                        setShowCompanySaveModal(true);
                      }}
                      className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold text-white"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCompanyLoadModal(true)}
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
                        onChange={handleChange("companyName")}
                        placeholder="상무스튜디오"
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
                        onChange={handleChange("companyRegNo")}
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
                      onChange={handleChange("companyAddress")}
                      placeholder="서울특별시 ..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-500">
                      담당자
                    </label>
                    <input
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={form.companyManager}
                      onChange={handleChange("companyManager")}
                      placeholder="담당자 이름"
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
                      onClick={() => {
                        setWorkerProfileLabel(
                          getWorkerProfileLabel(form, today)
                        );
                        setShowWorkerSaveModal(true);
                      }}
                      className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold text-white"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWorkerLoadModal(true)}
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
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              workerType: option.value,
                            }))
                          }
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
                        onChange={handleChange("workerName")}
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
                        onChange={handleChange("payDate")}
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
                        onChange={handleChange("bankName")}
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
                        onChange={handleChange("bankAccount")}
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
                        onClick={() => setShowOvertime((prev) => !prev)}
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
                        onClick={() => setShowBonus((prev) => !prev)}
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
                        onClick={() => setShowOtherAllowances((prev) => !prev)}
                        className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                          showOtherAllowances
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        {showOtherAllowances ? "기타 수당 숨기기" : "기타 수당 추가"}
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
                        onChange={handleChange("basePay")}
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
                          onChange={handleChange("overtimePay")}
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
                          onChange={handleChange("bonusPay")}
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
                          onChange={handleChange("otherAllowances")}
                        />
                      </div>
                    )}
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
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              workPeriodType: option.value,
                            }))
                          }
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
                        onChange={handleChange("workPeriodStart")}
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
                        onChange={handleChange("workPeriodEnd")}
                      />
                    </div>
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
                    onChange={handleChange("nonTaxable")}
                  />
                  <p className="text-[11px] text-slate-500">
                    비과세 항목은 과세 대상에서 제외됩니다.
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  메모
                </label>
                <textarea
                  className="min-h-[90px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.memo}
                  onChange={handleChange("memo")}
                />
              </div>

            </div>
            </section>

            <section className="flex h-full flex-col">
              <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.9)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    미리보기
                  </h2>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={isExporting}
                    className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {isExporting ? "PDF 생성 중..." : "PDF 다운로드"}
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4">
                  <div
                    ref={previewRef}
                    className="mx-auto w-full rounded-2xl bg-white p-6 text-[13px] text-slate-900 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)] sm:text-sm"
                    style={{ maxWidth: "210mm", minHeight: "297mm" }}
                  >
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">급여명세서</p>
                    <h3 className="mt-1 text-xl font-bold tracking-tight">
                      {form.companyName || "회사명"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      사업자번호: {form.companyRegNo || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      주소: {form.companyAddress || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      담당자: {form.companyManager || "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-900 px-4 py-3 text-right text-white">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200">
                      Net Pay
                    </p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(calculations.netPay)}원
                    </p>
                    <p className="text-[11px] text-slate-300">
                      지급일 {form.payDate || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">근로자</p>
                    <p className="text-sm font-semibold">
                      {form.workerName || "-"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      형태: {form.workerType === "employee" ? "임금근로자" : "프리랜서"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">지급 정보</p>
                    <p className="text-xs text-slate-500">
                      {workPeriodLabel}: {form.workPeriodStart || "-"} ~{" "}
                      {form.workPeriodEnd || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      은행: {form.bankName || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      계좌: {form.bankAccount || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-sm font-semibold">지급 항목</h4>
                      <span className="text-xs text-slate-500">합계</span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {payItems.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                        >
                          <span className="text-xs text-slate-600">{item.label}</span>
                          <span className="text-xs font-semibold">
                            {formatCurrency(item.value)}원
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-white">
                        <span className="text-xs font-semibold">총지급</span>
                        <span className="text-xs font-semibold">
                          {formatCurrency(calculations.gross)}원
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-sm font-semibold">공제 항목</h4>
                      <span className="text-xs text-slate-500">
                        과세: {formatCurrency(calculations.taxable)}원
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {calculations.deductionLabels.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                        >
                          <span className="text-xs text-slate-600">{item.label}</span>
                          <span className="text-xs font-semibold">
                            {formatCurrency(calculations.deductions[item.key])}원
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between rounded-lg bg-rose-500 px-3 py-2 text-white">
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
                    <span>실지급액</span>
                    <span>{formatCurrency(calculations.netPay)}원</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                    ※ 세금 및 4대보험은 2024년 기준 간이 계산값이며 실제 고지 금액과
                    차이가 있을 수 있습니다.
                  </p>
                  {form.memo && (
                    <p className="mt-2 text-[11px] text-slate-500">메모: {form.memo}</p>
                  )}
                </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      {showCompanyLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setShowCompanyLoadModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                회사 정보 불러오기
              </h3>
              <button
                type="button"
                onClick={() => setShowCompanyLoadModal(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                닫기
              </button>
            </div>

            {companyProfiles.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                저장된 회사 정보가 없습니다.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {companyProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {profile.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        사업자등록번호: {profile.data.companyRegNo || "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadCompanyProfile(profile.id)}
                        className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold text-white"
                      >
                        불러오기
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCompanyProfile(profile.id)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {showCompanySaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setShowCompanySaveModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                회사 정보 저장
              </h3>
              <button
                type="button"
                onClick={() => setShowCompanySaveModal(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="text-xs font-semibold text-slate-500">
                저장 이름
              </label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={companyProfileLabel}
                onChange={(event) =>
                  setCompanyProfileLabel(event.target.value)
                }
                placeholder={getCompanyProfileLabel(form)}
              />
              <p className="text-[11px] text-slate-500">
                비워두면 회사명이 기본값입니다.
              </p>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCompanyProfile}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showWorkerSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setShowWorkerSaveModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                근로자 정보 저장
              </h3>
              <button
                type="button"
                onClick={() => setShowWorkerSaveModal(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="text-xs font-semibold text-slate-500">
                저장 이름
              </label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={workerProfileLabel}
                onChange={(event) => setWorkerProfileLabel(event.target.value)}
                placeholder={getWorkerProfileLabel(form, today)}
              />
              <p className="text-[11px] text-slate-500">
                비워두면 기본값으로 저장됩니다.
              </p>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveWorkerProfile}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showWorkerLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setShowWorkerLoadModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                근로자 정보 불러오기
              </h3>
              <button
                type="button"
                onClick={() => setShowWorkerLoadModal(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                닫기
              </button>
            </div>

            {workerProfiles.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                저장된 근로자 정보가 없습니다.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {workerProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {profile.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        지급일: {profile.data.payDate || "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadWorkerProfile(profile.id)}
                        className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold text-white"
                      >
                        불러오기
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWorkerProfile(profile.id)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
