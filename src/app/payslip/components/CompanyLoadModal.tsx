import type { CompanyProfile } from "../types";

type CompanyLoadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  companyProfiles: CompanyProfile[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function CompanyLoadModal({
  isOpen,
  onClose,
  companyProfiles,
  onLoad,
  onDelete,
}: CompanyLoadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            회사 정보 불러오기
          </h3>
          <button
            type="button"
            onClick={onClose}
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
                    onClick={() => onLoad(profile.id)}
                    className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold text-white"
                  >
                    불러오기
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(profile.id)}
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
  );
}
