export interface ValueConverter {
  value: string;
  format: string;
  outputType: string;
  inputType: string;
  inputFormat: string | null;
}
