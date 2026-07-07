import { Comparer } from "./comparer";
import { Property } from "./property";
import { PropertyConverter } from "./property-converter";
import { ValueConverter } from "./value-converter";
import { AppService } from "../app.service";
import { AppSettings } from "./app-settings";

export class FilterItem {
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
    this.value = null;
    this.logical = null;  
  }

  propertyFormat: string | null;
  property: Property;
  propertyConverter: { value: string | null, data?: PropertyConverter };
  comparer: { value: string, data: Comparer };
  valueConverter: { value: string | null, data?: ValueConverter };
  value: any | null;
  logical: string | null;
}
