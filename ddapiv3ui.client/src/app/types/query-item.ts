import { Comparer } from "./comparer";
import { Property } from "./property";
import { PropertyConverter } from "./property-converter";
import { ValueConverter } from "./value-converter";

export class QueryItem {
  constructor(property: Property) {
    this.propertyFormat = property.name;
    this.property = property;
    this.propertyConverter = { value: null };
    this.comparer = {
      value: 'eq',
      data: {
        format: '<propertyformat> eq <valueformat>',
        value: 'eq'
      }
    };
    this.valueConverter = { value: null };
    this.logical = 'and';
    this.copied = false;
  }

  propertyFormat: string;
  property: Property;
  propertyConverter: { value: string | null, data?: PropertyConverter };
  comparer: { value: string, data: Comparer };
  valueConverter: { value: string | null, data?: ValueConverter };
  value: any;
  logical: string;
  query: string = '';
  copied: boolean;
}
