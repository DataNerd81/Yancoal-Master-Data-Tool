import * as XLSX from "xlsx";

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
}

export interface ParseError {
  message: string;
  details?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const VALID_EXTENSIONS = [".xlsx", ".xls", ".csv"];

export function validateFileMetadata(
  filename: string,
  size: number,
): ParseError | null {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  if (!VALID_EXTENSIONS.includes(ext)) {
    return {
      message: `Invalid file type: ${ext}`,
      details: `Accepted formats: ${VALID_EXTENSIONS.join(", ")}`,
    };
  }
  if (size > MAX_FILE_SIZE) {
    return {
      message: `File too large: ${(size / 1024 / 1024).toFixed(1)}MB`,
      details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }
  return null;
}

export function parseExcelFile(buffer: ArrayBuffer): ParsedSheet {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });

  const headers =
    jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  return {
    headers,
    rows: jsonData,
    rowCount: jsonData.length,
  };
}

export function validateHeaders(
  actualHeaders: string[],
  expectedHeaders: string[],
): { valid: boolean; missing: string[]; extra: string[] } {
  const normalise = (h: string) => h.toLowerCase().trim().replace(/\s+/g, "_");
  const actualNorm = new Set(actualHeaders.map(normalise));
  const expectedNorm = expectedHeaders.map(normalise);

  const missing = expectedHeaders.filter(
    (_, i) => !actualNorm.has(expectedNorm[i]),
  );
  const expectedSet = new Set(expectedNorm);
  const extra = actualHeaders.filter((h) => !expectedSet.has(normalise(h)));

  return {
    valid: missing.length === 0,
    missing,
    extra,
  };
}

export function generateAnnotatedExcel(
  originalRows: Record<string, string>[],
  errors: Array<{
    rowNumber: number;
    columnName: string;
    ruleId: string;
    severity: string;
    message: string;
    suggestedFix: string | null;
  }>,
): ArrayBuffer {
  const annotatedRows = originalRows.map((row, index) => {
    const rowErrors = errors.filter((e) => e.rowNumber === index + 1);
    return {
      ...row,
      _error_count: rowErrors.filter((e) => e.severity === "error").length,
      _warning_count: rowErrors.filter((e) => e.severity === "warning").length,
      _issues: rowErrors.map((e) => `[${e.ruleId}] ${e.message}`).join(" | "),
      _suggested_fixes: rowErrors
        .filter((e) => e.suggestedFix)
        .map((e) => `${e.columnName}: ${e.suggestedFix}`)
        .join(" | "),
    };
  });

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(annotatedRows);
  XLSX.utils.book_append_sheet(workbook, sheet, "Validation Results");

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}
