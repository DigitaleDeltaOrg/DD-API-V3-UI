import { Property } from "./property";

export interface Type {
  name: string
  isRequired: boolean;
  isNavigation?: boolean;
  properties?: Property[];
}
