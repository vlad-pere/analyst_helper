// src/features/MappingTool/utils/exportUtils.js

import * as XLSX from 'xlsx';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsJson(data, filename = 'mapping.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  triggerDownload(blob, filename);
}

export function exportAsXlsx(worksheets, filename = 'mapping.xlsx') {
  const workbook = XLSX.utils.book_new();

  for (const sheetName in worksheets) {
    if (Object.prototype.hasOwnProperty.call(worksheets, sheetName)) {
      const data = worksheets[sheetName];
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, filename);
}