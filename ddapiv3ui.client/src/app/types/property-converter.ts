export interface PropertyConverter {
  value: string;
  format: string;
  propertyType: string;
  outputType: string;
  inputType: string | null;
  inputPlaceholder: string | null;
  inputPrefix: string | null;
  inputSuffix: string | null;
  inputValue?: any | null;
}
