type CompanySaveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  placeholder: string;
};

export default function CompanySaveModal({
  isOpen,
  onClose,
  value,
  onChange,
  onSave,
  placeholder,
}: CompanySaveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            회사 정보 저장
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            닫기
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="text-xs font-semibold text-slate-500">저장 이름</label>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
          />
          <p className="text-[11px] text-slate-500">
            비워두면 회사명이 기본값입니다.
          </p>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={onSave}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
