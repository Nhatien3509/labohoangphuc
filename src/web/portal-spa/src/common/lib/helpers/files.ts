type RowData = Record<string, string | number | boolean | null | undefined>;

export const downloadFiles = (
  data: BlobPart,
  name: string,
  type = "mimeType",
) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);

  triggerDownload(url, name);
  URL.revokeObjectURL(url);
};

export function triggerDownload(url: string, name: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Converts a base64-encoded string into an ArrayBuffer.
 *
 * This function decodes a base64 string into a binary string, then converts
 * the binary string into a Uint8Array, and finally returns the ArrayBuffer
 * from the Uint8Array.
 *
 * @param {string} base64 - The base64-encoded string to be converted.
 * @returns {ArrayBuffer} - An ArrayBuffer containing the binary data
 *                           represented by the base64 string.
 */
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

export function exportToCsv<T extends RowData>(
  filename: string,
  rows: T[],
  headers?: (keyof T)[],
) {
  if (!rows.length) {
    console.error("No data provided");
    return;
  }

  const separator = ",";
  const keys = headers ? headers.map(String) : Object.keys(rows[0] as RowData);

  let csvContent = keys.join(separator) + "\n";

  csvContent += rows
    .map((row) => {
      return keys
        .map((key) => {
          const value =
            row[key as keyof T] !== undefined ? row[key as keyof T] : "";
          return `"${value?.toString().replace(/"/g, '""')}"`;
        })
        .join(separator);
    })
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
