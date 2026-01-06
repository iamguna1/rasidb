
import Pizzip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { ExtractionResult, FileData } from '../types';

/**
 * Generates a populated Word document from a template and extracted results.
 * Maps field names, IDs, and normalized versions to placeholders.
 */
export const generatePopulatedDocx = async (template: FileData, result: ExtractionResult) => {
  try {
    // 1. Prepare binary content from base64
    const base64Content = template.base64.split(',')[1];
    const binaryString = window.atob(base64Content);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 2. Initialize Pizzip and Docxtemplater
    // Use the Uint8Array directly for better binary compatibility
    const zip = new Pizzip(bytes);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 3. Create a comprehensive data mapping object
    const data: Record<string, string> = {};
    
    // Map numbered fields from the main list
    result.fields.forEach(field => {
      const val = field.value || "";
      const name = field.fieldName;
      
      // A. Exact name mapping: {COURT}
      data[name] = val;
      
      // B. Numeric ID mapping: {1}, {2}, etc.
      data[field.id.toString()] = val;
      
      // C. Underscored mapping: {OFFICER_NAME_WITH_S/O_AND_AGED}
      const slug = name.replace(/\s+/g, '_');
      data[slug] = val;
      
      // D. Uppercase versions just in case
      data[name.toUpperCase()] = val;
      data[slug.toUpperCase()] = val;
    });

    // 4. Map the mandatory additional extractions
    // We use common keys as placeholders in Word templates
    data['immovablePropertyDescription'] = result.immovablePropertyDescription || "";
    data['applicantsAndCoBorrowers'] = result.applicantsAndCoBorrowers || "";
    
    // Also map the uppercase keys for the additional sections
    data['DESCRIPTION_OF_THE_IMMOBABLE_PROPERTY'] = result.immovablePropertyDescription || "";
    data['APPLICANTS_AND_CO_BORROWERS'] = result.applicantsAndCoBorrowers || "";

    // 5. Render the document
    doc.setData(data);
    
    try {
      doc.render();
    } catch (renderError: any) {
      // Catch common docxtemplater errors (like missing closing tags in XML)
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
    link.download = `Populated_${template.name}`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error("Detailed Error generating Word document:", error);
    alert("Failed to fill the Word template. Please ensure your placeholders (e.g., {COURT}) match the field names exactly and that the document is a valid .docx file.");
  }
};
