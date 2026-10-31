export type StudyInput = {
  note: string;
  seconds: number;
  pdf_page: number;
  version: number;
};
export function validateStudy(value: unknown): StudyInput | null {
  if (!value || typeof value !== "object") return null;
  const x = value as Record<string, unknown>;
  if (
    typeof x.note !== "string" ||
    x.note.length > 20000 ||
    typeof x.seconds !== "number" ||
    !Number.isFinite(x.seconds) ||
    x.seconds < 0 ||
    x.seconds > 604800 ||
    !Number.isSafeInteger(x.pdf_page) ||
    Number(x.pdf_page) < 1 ||
    Number(x.pdf_page) > 100000 ||
    !Number.isSafeInteger(x.version) ||
    Number(x.version) < 0 ||
    Number(x.version) > 2147483646
  )
    return null;
  return {
    note: x.note,
    seconds: x.seconds,
    pdf_page: Number(x.pdf_page),
    version: Number(x.version),
  };
}
