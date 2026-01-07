
import Pizzip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { ExtractionResult, FileData } from '../types';

/**
 * Generates a populated Word document from a template and extracted results.
 * Maps field names, IDs, and normalized versions to placeholders.
 */
export const generatePopulatedDocx = async (template: FileData, result: ExtractionResult) => {
  try {
    console.log("Starting Word document population...");
    
    // 1. Prepare binary content from base64
    const base64Content = template.base64.split(',')[1];
    const binaryString = window.atob(base64Content);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 2. Initialize Pizzip and Docxtemplater
    const zip = new Pizzip(bytes);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{", end: "}" } // Explicitly define delimiters
    });

    // 3. Create a comprehensive data mapping object
    const data: Record<string, string> = {};
    
    // Process main fields
    result.fields.forEach(field => {
      const val = field.value || "";
      let name = field.fieldName.trim();
      
      // Safety: strip accidental curly braces if AI included them in fieldName
      name = name.replace(/[{}]/g, "");
      
      // A. Exact name mapping
      data[name] = val;
      
      // B. Numeric ID mapping: {1}, {2}, etc.
      data[field.id.toString()] = val;
      
      // C. Underscored mapping: {OFFICER_NAME_WITH_S/O_AND_AGED}
      const slug = name.replace(/\s+/g, '_');
      data[slug] = val;
      
      // D. Case variations to catch {court} or {COURT}
      data[name.toUpperCase()] = val;
      data[name.toLowerCase()] = val;
      data[slug.toUpperCase()] = val;
      data[slug.toLowerCase()] = val;
    });

    // 4. Map the mandatory additional extractions
    const propDesc = result.immovablePropertyDescription || "";
    const borrowers = result.applicantsAndCoBorrowers || "";

    // Map common expected keys
    data['immovablePropertyDescription'] = propDesc;
    data['applicantsAndCoBorrowers'] = borrowers;
    data['DESCRIPTION_OF_THE_IMMOVABLE_PROPERTY'] = propDesc;
    data['APPLICANTS_AND_CO_BORROWERS'] = borrowers;
    data['PROPERTY_DESCRIPTION'] = propDesc;
    data['BORROWER_DETAILS'] = borrowers;

    console.log("Data mapping prepared:", data);

    // 5. Render the document
    doc.setData(data);
    
    try {
      doc.render();
    } catch (renderError: any) {
      console.error("Docxtemplater Render Error:", renderError);
      throw renderError;
    }

    // 6. Generate and Download
    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const url = URL.createObjectURL(out);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Filled_${template.name}`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
    
  } catch (error: any) {
    console.error("Detailed Error generating Word document:", error);
    const msg = error.properties?.errors?.map((e: any) => e.message).join(", ") || error.message;
    alert(`Failed to fill the Word template: ${msg}\n\nEnsure your placeholders like {COURT} match the field names exactly.`);
  }
};
