
import * as XLSX from 'xlsx';
import { ExtractionResult } from '../types';

export const exportToExcel = (result: ExtractionResult) => {
  // Transpose: Fields as rows, Value as a column
  const data = result.fields.map(f => ({
    "S.No": f.id,
    "Field Name": f.fieldName,
    "Value": f.value
  }));

  // Add the additional extractions as well
  data.push({
    "S.No": data.length + 1,
    "Field Name": "DESCRIPTION OF THE IMMOVABLE PROPERTY",
    "Value": result.immovablePropertyDescription
  });
  data.push({
    "S.No": data.length + 1,
    "Field Name": "APPLICANTS AND CO-BORROWERS",
    "Value": result.applicantsAndCoBorrowers
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");

  // Setting column widths for readability
  ws['!cols'] = [
    { wch: 5 },
    { wch: 40 },
    { wch: 100 }
  ];

  XLSX.writeFile(wb, "Extracted_Legal_Data.xlsx");
};
