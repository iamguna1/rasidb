
export interface ExtractionField {
  id: number;
  fieldName: string;
  value: string;
  sourceDoc?: string;
}

export interface AdditionalExtraction {
  title: string;
  content: string;
}

export interface ExtractionResult {
  fields: ExtractionField[];
  immovablePropertyDescription: string;
  applicantsAndCoBorrowers: string;
}

export interface FileData {
  name: string;
  type: string;
  base64: string;
}
