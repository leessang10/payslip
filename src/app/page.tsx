"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { CompanyProfile, FormData, WorkerProfile } from "./payslip/types";
import {
  COMPANY_PROFILE_KEY,
  WORKER_PROFILE_KEY,
  defaultForm,
  today,
  workerDefaults,
} from "./payslip/constants";
import { getCompanyProfileLabel, getWorkerProfileLabel, toNumber } from "./payslip/utils";
import {
  getCalculations,
  getPayItems,
  getWorkPeriodInputType,
  getWorkPeriodLabel,
} from "./payslip/calculations";
import InputSection from "./payslip/components/InputSection";
import PreviewSection from "./payslip/components/PreviewSection";
import PdfTemplate from "./payslip/components/PdfTemplate";
import CompanyLoadModal from "./payslip/components/CompanyLoadModal";
import CompanySaveModal from "./payslip/components/CompanySaveModal";
import WorkerSaveModal from "./payslip/components/WorkerSaveModal";
import WorkerLoadModal from "./payslip/components/WorkerLoadModal";

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
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedWorkers = window.localStorage.getItem(WORKER_PROFILE_KEY);
    if (storedWorkers) {
      try {
        const parsed = JSON.parse(storedWorkers) as WorkerProfile[];
        const normalized = parsed.map((profile) => ({
          ...profile,
          data: { ...workerDefaults, ...profile.data },
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

  const calculations = useMemo(() => getCalculations(form), [form]);

  const payItems = getPayItems(form);

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
    if (!pdfTemplateRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(pdfTemplateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = 297;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const fileName = `급여명세서_${form.workerName || "근로자"}_${
        form.payDate || today
      }.pdf`;
      pdf.save(fileName);
    } finally {
      setIsExporting(false);
    }
  };

  const workPeriodLabel = getWorkPeriodLabel(form);

  const workPeriodInputType = getWorkPeriodInputType(form);

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            대한민국 급여명세서 PDF 생성기
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            입력 폼에서 급여 정보를 채우면 오른쪽 미리보기에서 실시간 반영되고,
            선택한 근로 형태에 따라 세금이 자동 계산됩니다. 저장한 근로자 정보는
            브라우저에 보관됩니다.
          </p>
        </header>

        <div className="rounded-3xl border border-white/40 bg-white/40 p-4 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.4)] backdrop-blur">
          <div className="grid items-stretch gap-8 lg:grid-cols-[1.05fr_1fr]">
            <InputSection
              form={form}
              workPeriodInputType={workPeriodInputType}
              showOvertime={showOvertime}
              showBonus={showBonus}
              showOtherAllowances={showOtherAllowances}
              onChangeField={handleChange}
              onSelectWorkerType={(value) =>
                setForm((prev) => ({ ...prev, workerType: value }))
              }
              onSelectWorkPeriodType={(value) =>
                setForm((prev) => ({ ...prev, workPeriodType: value }))
              }
              onToggleOvertime={() => setShowOvertime((prev) => !prev)}
              onToggleBonus={() => setShowBonus((prev) => !prev)}
              onToggleOtherAllowances={() =>
                setShowOtherAllowances((prev) => !prev)
              }
              onOpenCompanySave={() => {
                setCompanyProfileLabel(getCompanyProfileLabel(form));
                setShowCompanySaveModal(true);
              }}
              onOpenCompanyLoad={() => setShowCompanyLoadModal(true)}
              onOpenWorkerSave={() => {
                setWorkerProfileLabel(getWorkerProfileLabel(form, today));
                setShowWorkerSaveModal(true);
              }}
              onOpenWorkerLoad={() => setShowWorkerLoadModal(true)}
            />
            <PreviewSection
              form={form}
              calculations={calculations}
              payItems={payItems}
              workPeriodLabel={workPeriodLabel}
              isExporting={isExporting}
              onExportPdf={handleExportPdf}
            />
          </div>
        </div>
      </div>

      <PdfTemplate
        form={form}
        calculations={calculations}
        payItems={payItems}
        workPeriodLabel={workPeriodLabel}
        templateRef={pdfTemplateRef}
      />
      <CompanyLoadModal
        isOpen={showCompanyLoadModal}
        onClose={() => setShowCompanyLoadModal(false)}
        companyProfiles={companyProfiles}
        onLoad={handleLoadCompanyProfile}
        onDelete={handleDeleteCompanyProfile}
      />
      <CompanySaveModal
        isOpen={showCompanySaveModal}
        onClose={() => setShowCompanySaveModal(false)}
        value={companyProfileLabel}
        onChange={setCompanyProfileLabel}
        onSave={handleSaveCompanyProfile}
        placeholder={getCompanyProfileLabel(form)}
      />
      <WorkerSaveModal
        isOpen={showWorkerSaveModal}
        onClose={() => setShowWorkerSaveModal(false)}
        value={workerProfileLabel}
        onChange={setWorkerProfileLabel}
        onSave={handleSaveWorkerProfile}
        placeholder={getWorkerProfileLabel(form, today)}
      />
      <WorkerLoadModal
        isOpen={showWorkerLoadModal}
        onClose={() => setShowWorkerLoadModal(false)}
        workerProfiles={workerProfiles}
        onLoad={handleLoadWorkerProfile}
        onDelete={handleDeleteWorkerProfile}
      />

    </div>
  );
}
