export interface Property {
  name: string;
  type: string;
  isNullable: boolean;
  isKey: boolean;
  isString: boolean;
  isArray?: boolean;
  parent?: string;
  properties?: Property[];
}


