import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { Property } from './types/property';
import { Type } from './types/type';
import { Comparer } from './types/comparer';
import { PropertyConverter } from './types/property-converter';
import { ValueConverter } from './types/value-converter';
import { QueryItem } from './types/query-item';
import { DefaultSettings } from "./types/defaultsettings";

/**
 * Represents the variable KEY.
 *
 * @constant
 * @type {string}
 * @description Represents the default settings key.
 */
const KEY: string = 'defaultSettings'; // Name of the default settings.

/**
 * AppComponent class represents the root component of the Angular application.
 * It implements the OnInit and OnDestroy interfaces.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  defaultValue: DefaultSettings = {
    ddApiBaseUrl: "",
    clientId: "",
    clientSecret: "",
    authenticationUrl: "",
    grantType: "",
    scope: ""
  };
  appConfig: DefaultSettings = this.defaultValue;
  destroySubscriptions = new Subject<void>();
  validationResult!: Record<string, Type>;
  observationProperties!: Property[];
  observationQueryProperties: Property[] = [];
  propertyTypes: string[] = [
    'String',
    'DateTimeOffset',
    'DateTime',
    'Date',
    'GeographyPoint',
    'Double',
    'Decimal',
    'Int64',
    'Boolean'
  ];
  comparers: Comparer[] = [
    { // Equals
      value: 'eq',
      format: '<propertyformat> eq <valueformat>',
      propertyTypes: this.propertyTypes
    },
    { // Not equals
      value: 'ne',
      format: '<propertyformat> ne <valueformat>',
      propertyTypes: this.propertyTypes
    },
    { // Greater than
      value: 'gt',
      format: '<propertyformat> gt <valueformat>',
      propertyTypes: this.propertyTypes.filter(t => !['String', 'Boolean', 'GeographyPoint'].includes(t))
    },
    { // Greater than or equal to
      value: 'ge',
      format: '<propertyformat> ge <valueformat>',
      propertyTypes: this.propertyTypes.filter(t => !['String', 'Boolean', 'GeographyPoint'].includes(t))
    },
    { // Less than
      value: 'lt',
      format: '<propertyformat> lt <valueformat>',
      propertyTypes: this.propertyTypes.filter(t => !['String', 'Boolean', 'GeographyPoint'].includes(t))
    },
    { /// Less than or equal to
      value: 'le',
      format: '<propertyformat> le <valueformat>',
      propertyTypes: this.propertyTypes.filter(t => !['String', 'Boolean', 'GeographyPoint'].includes(t))
    },
    { // in: list contains value
      value: 'in',
      format: '<propertyformat> in (<valueformat>)',
      propertyTypes: this.propertyTypes.filter(t => !['Boolean', 'GeographyPoint', 'DateTimeOffset', 'DateTime', 'Date'].includes(t))
    },
    { // not in: list does not contain value
      value: 'notin',
      format: '<propertyformat> notin (<valueformat>)',
      propertyTypes: this.propertyTypes.filter(t => !['Boolean', 'GeographyPoint', 'DateTimeOffset', 'DateTime', 'Date'].includes(t))
    },
    { // string starts with
      value: 'startswith',
      format: 'startswith(<propertyformat>, <valueformat>)',
      propertyTypes: this.propertyTypes.filter(t => t == 'String')
    },
    { // string ends with
      value: 'endswith',
      format: 'endswith(<propertyformat>, <valueformat>)',
      propertyTypes: this.propertyTypes.filter(t => t == 'String')
    },
    { // String contains substring
      value: 'contains',
      format: 'contains(<propertyformat>, <valueformat>)',
      propertyTypes: this.propertyTypes.filter(t => t == 'String')
    }
  ];
  // Property converters define what types a function can be (source).
  propertyConverters: PropertyConverter[] = [
    { // Convert string to lower case
      value: 'tolower',
      format: 'tolower(<property>)',
      propertyType: 'String',
      inputType: null,
      outputType: 'String',
      inputPlaceholder: null,
      inputPrefix: null,
      inputSuffix: null
    },
    { // Convert string to upper case
      value: 'toupper',
      format: 'toupper(<property>)',
      propertyType: 'String',
      inputType: null,
      outputType: 'String',
      inputPlaceholder: null,
      inputPrefix: null,
      inputSuffix: null
    },
    { // Gets the day number within the month from the date
      value: 'day',
      format: 'day(<property>)',
      propertyType: 'DateTimeOffset',
      inputType: null,
      outputType: 'Int64',
      inputPlaceholder: null,
      inputPrefix: null,
      inputSuffix: null
    },
    { // Gets the month number within the year from the date
      value: 'month',
      format: 'month(<property>)',
      propertyType: 'DateTimeOffset',
      inputType: null,
      outputType: 'Int64',
      inputPlaceholder: null,
      inputPrefix: null,
      inputSuffix: null
    },
    { // Gets the year number.
      value: 'year',
      format: 'year(<property>)',
      propertyType: 'DateTimeOffset',
      inputType: null,
      outputType: 'Int64',
      inputPlaceholder: null,
      inputPrefix: null,
      inputSuffix: null
    },
    { // Converts to date part from the date/time. Removes time component.
      value: 'date',
      format: 'date(<property>)',
      propertyType: 'DateTimeOffset',
      inputType: null,
      outputType: 'Date',
      inputPlaceholder: null,
      inputPrefix: null,
      inputSuffix: null
    },
    { // Gets the hour of the day for the date/time.
      value: 'hour',
      format: 'hour(<property>)',
      propertyType: 'DateTimeOffset',
      inputType: null,
      outputType: 'Int64',
      inputPlaceholder: null,
      inputPrefix: null,
      inputSuffix: null
    },
    { // Gets the minute of the hour for the date/time.
      value: 'minute',
      format: 'minute(<property>)',
      propertyType: 'DateTimeOffset',
      inputType: null,
      outputType: 'Int64',
      inputPlaceholder: null,
      inputPrefix: null,
      inputSuffix: null
    },
    { // Gets the second of the hour of the day for the date/time.
      value: 'second',
      format: 'second(<property>)',
      propertyType: 'DateTimeOffset',
      inputType: null,
      outputType: 'Int64',
      inputPlaceholder: null,
      inputPrefix: null,
      inputSuffix: null
    },
    { // Calculates the distance between two geographic structures.
      value: 'geo.distance',
      format: `geo.distance(<property>, geography'POINT(<propertyconverterinputvalue>)')`,
      propertyType: 'GeographyPoint',
      inputType: 'text',
      outputType: 'Double',
      inputPlaceholder: '4.89443 51.72014',
      inputPrefix: "geography'POINT(",
      inputSuffix: ")'"
    },
    { // Calculates if the two geographic structures intersect.
      value: 'geo.intersect',
      format: `geo.intersect(<property>, geography'<propertyconverterinputvalue>')`,
      propertyType: 'GeographyPoint',
      inputType: 'text',
      outputType: 'Boolean',
      inputPlaceholder: 'POINT(4.89443 51.72014)',
      inputPrefix: "geography'",
      inputSuffix: "'"
    }
  ];
  // Result type for the conversions.
  valueConverters: ValueConverter[] = [
    {
      value: 'tolower',
      format: 'tolower(<value>)',
      outputType: 'String',
      inputType: 'String',
      inputFormat: null
    },
    {
      value: 'toupper',
      format: 'toupper(<value>)',
      outputType: 'String',
      inputType: 'String',
      inputFormat: null
    },
    {
      value: 'day',
      format: 'day(<value>)',
      outputType: 'Int64',
      inputType: 'DateTimeOffset',
      inputFormat: null,
    },
    {
      value: 'month',
      format: 'month(<value>)',
      outputType: 'Int64',
      inputType: 'DateTimeOffset',
      inputFormat: null,
    },
    {
      value: 'year',
      format: 'year(<value>)',
      outputType: 'Int64',
      inputType: 'DateTimeOffset',
      inputFormat: null,
    },
    {
      value: 'date',
      format: 'date(<value>)',
      outputType: 'Int64',
      inputType: 'DateTimeOffset',
      inputFormat: null,
    },
    {
      value: 'hour',
      format: 'hour(<value>)',
      outputType: 'Int64',
      inputType: 'DateTimeOffset',
      inputFormat: null,
    },
    {
      value: 'minute',
      format: 'minute(<value>)',
      outputType: 'Int64',
      inputType: 'DateTimeOffset',
      inputFormat: null,
    },
    {
      value: 'second',
      format: 'second(<value>)',
      outputType: 'Int64',
      inputType: 'DateTimeOffset',
      inputFormat: null,
    }
  ];
  propertyConverterMapping: Record<string, PropertyConverter> = {};
  valueConverterMapping: Record<string, ValueConverter> = {};
  comparerMapping: Record<string, Comparer> = {};
  propertyTypeComparersMapping: Record<string, Comparer[]> = {};
  propertyTypePropertyConvertersMapping: Record<string, PropertyConverter[]> = {};
  outputTypeValueConvertersMapping: Record<string, ValueConverter[]> = {};
  inputTypeMapping: Record<string, string> = {};
  selectProperties!: Property[];
  queryProperties!: Property[];
  queryItems: QueryItem[] = [];
  queryUrl!: string;
  queryPageSizeOptions: number[] = [1, 5, 10, 20, 50, 100, 500, 1000, 5000, 10000];
  queryPageSize: number = 10;
  queryPageIndex: number = 0;
  queryResultLength: number = 0;
  queryResult: any | null = {};

  constructor(private http: HttpClient) {
  }

  /**
   * Initializes the component and performs necessary setup tasks.
   * @return {void}
   */
  ngOnInit(): void {
    this.getSettingsFromServer()
      .pipe(mergeMap(data => this.storeSettingsIfNotExist(data)))
      .pipe(mergeMap(() => this.getValidationResult()))
      .subscribe((result) => this.handleResponse(result));
  }

  /**
   * Function to handle the response from an API call.
   *
   * @param {Record<string, Type>} result - The result object containing response data.
   */
  handleResponse(result: Record<string, Type>) {
    this.validationResult = result;
    this.observationProperties = result['DigitaleDelta.Observation'].properties?.filter(p => p.type != '') ?? [];
    this.observationProperties.map(p => this.formatProperty('', p));
    this.observationProperties.filter(p => this.filterProperty(p)).forEach(p => this.addNestedProperties('', p));
    this.setMappings();
    this.generateQueryItems();
  }

  /**
   * Clean up method called when the component is destroyed.
   * Unsubscribes from all subscriptions and completes the destroySubscriptions subject.
   *
   * @return {void}
   */
  ngOnDestroy(): void {
    this.destroySubscriptions.next();
    this.destroySubscriptions.complete();
  }

  /**
   * Sets the mappings for property converters, value converters, comparers, output type value converters,
   * property type comparers, property type property converters, and input types.
   *
   * @returns {void}
   */
  setMappings(): void {
    this.propertyConverters.forEach(q => this.propertyConverterMapping[q.value] = q);
    this.valueConverters.forEach(q => this.valueConverterMapping[q.value] = q);
    this.comparers.forEach(q => this.comparerMapping[q.value] = q);
    [...new Set(this.valueConverters.map(q => q.outputType))]
      .forEach(o => this.outputTypeValueConvertersMapping[o] = this.valueConverters
        .filter(q => q.outputType == o));
    this.propertyTypes.forEach(t => {
      this.propertyTypeComparersMapping[t] = this.comparers.filter(c => c.propertyTypes ? c.propertyTypes.includes(t) : true);
      this.propertyTypePropertyConvertersMapping[t] = this.propertyConverters.filter(c => c.propertyType == t);
      let inputType!: string;
      switch (t) {
        case 'String':
          inputType = 'text'
          break;
        case 'DateTimeOffset':
          inputType = 'datetime-local'
          break;
        case 'GeographyPoint':
          inputType = 'text'
          break;
        case 'Boolean':
          inputType = 'checkbox';
          break;
        case 'Int64':
          inputType = 'number';
          break;
        case 'Decimal':
          inputType = 'number';
          break;
        case 'Double':
          inputType = 'number';
          break;
        default:
          inputType = 'text';
      }
      this.inputTypeMapping[t] = inputType;
    });
  }

  /**
   * Generates query items based on query properties.
   *
   * @return {void}
   */
  generateQueryItems(): void {
    if (this.queryProperties?.length > 0) {
      if (this.queryItems?.length == 0) {
        this.queryItems = this.queryProperties
          .filter((p: Property) => !this.queryItems.map(q => q.property?.name)
            .includes(p.name)).map((p: Property) => new QueryItem(p));
      } else {
        let newQueryItems: QueryItem[] = this.queryProperties
          .filter((p: Property) => !this.queryItems.map(q => q.property?.name)
            .includes(p.name)).map((p: Property) => new QueryItem(p));
        let existingQueryItems: QueryItem[] = JSON.parse(JSON.stringify(this.queryItems
          .filter(q => this.queryProperties.map((p: Property) => p.name).includes(q.property?.name ?? ''))))
        if (existingQueryItems) {
          this.queryItems = [...existingQueryItems, ...newQueryItems];
        } else {
          this.queryItems = newQueryItems;
        }
      }
    } else {
      this.queryItems = [];
    }
    this.generateQuery();
  }

  /**
   * Callback method called when the selection of a converter changes on a query item.
   *
   * @param {any} args - The argument passed when the selection change event is fired.
   * @param {QueryItem} queryItem - The query item for which the converter selection changed.
   *
   * @return {void} - This method does not return anything.
   */
  onQueryItemPropertyConverterSelectionChange(args: any, queryItem: QueryItem): void {
    queryItem.propertyConverter.data = this.propertyConverterMapping[args.value];
    if (queryItem.propertyConverter.data) {
      queryItem.propertyConverter.data.inputValue = null;
    }
    this.generateQuery();
  }

  /**
   * Handles the selection change event for the input value of a query item property converter.
   *
   * @param _args - The event arguments.
   * @param _queryItem - The query item.
   * @return - This method does not return anything.
   */
  onQueryItemPropertyConverterInputValueSelectionChange(_args: any, _queryItem: QueryItem): void {
    this.generateQuery();
  }

  /**
   * Handles the selection change event of the query item comparer.
   *
   * @param {any} args - The arguments passed to the event handler.
   * @param {QueryItem} queryItem - The query item for which the comparer selection changed.
   *
   * @returns {void}
   */
  onQueryItemComparerSelectionChange(args: any, queryItem: QueryItem): void {
    queryItem.comparer.data = this.comparerMapping[args.value];
    this.generateQuery();
  }

  /**
   * Handles the selection change event for the query item value converter.
   * Updates the data property of the query item's value converter with the value mapping
   * based on the selected value.
   *
   * @param {any} args - The event arguments provided by the selection change event.
   * @param {QueryItem} queryItem - The query item related to the selection change.
   * @return {void}
   */
  onQueryItemValueConverterSelectionChange(args: any, queryItem: QueryItem): void {
    queryItem.valueConverter.data = this.valueConverterMapping[args.value];
    this.generateQuery();
  }

  /**
   * Change the pagination settings and update the query URL. If there are query results,
   * retrieve new data using the updated pagination settings.
   *
   * @param {Object} args - The pagination settings.
   * @param {number} args.pageSize - The number of items to display per page.
   * @param {number} args.pageIndex - The index of the current page.
   *
   * @return {void}
   */
  onPaginatorChange(args: any): void {
    this.queryUrl = this.queryUrl.replace(`$top=${this.queryPageSize}`, `$top=${args.pageSize}`)
    this.queryUrl = this.queryUrl.replace(`$skip=${this.queryPageSize * this.queryPageIndex}`,
      `$skip=${args.pageSize * args.pageIndex}`);
    this.queryPageSize = args.pageSize;
    this.queryPageIndex = args.pageIndex ?? 0;
    if (this.queryResultLength > 0) {
      this.get();
    }
  }

  /**
   * Executes a HTTP POST request to the service.
   * Sets the query result and length on success.
   * Throws an error and sets the query result error on failure.
   */
  get(): void {
    this.queryResult = null;
    let body = {
      DdApiBaseUrl: this.appConfig!.ddApiBaseUrl,
      DdApiQueryUrl: this.queryUrl,
      AuthenticationUrl: this.appConfig!.authenticationUrl,
      ClientId: this.appConfig!.clientId,
      ClientSecret: this.appConfig!.clientSecret,
      Scope: this.appConfig!.scope,
      GrantType: this.appConfig!.grantType
    };
    this.http.post('/ddapi/query', body).pipe(
      takeUntil(this.destroySubscriptions),
      catchError((error: any) => {
        this.queryResult = {error: error};
        this.queryResultLength = 0;
        throw error; // rethrow the error (if you want to)
      })
    ).subscribe({
      next: (result: any) => {
        this.queryResult = result;
        this.queryResultLength = result['@odata.count'];
      }
    });
  }

  /**
   * Adds nested properties to a parent property.
   *
   * @param {string} parent - The name of the parent property.
   * @param {Property} property - The property object to add nested properties to.
   *
   * @returns {void}
   */
  addNestedProperties(parent: string, property: Property): void {
    let nestedProperties = this.validationResult[property.type]?.properties?.map(p => this.formatProperty(parent, p)).filter(p => p.type != property.type);
    if (nestedProperties) {
      property.properties = nestedProperties;
      property.properties?.filter(p => this.filterProperty(p)).forEach(p => this.addNestedProperties(property.name, p));
    } else {
      this.observationQueryProperties.push(this.formatProperty(parent, property));
    }
  }

  /**
   * Formats the given property by modifying its attributes.
   *
   * @param {string} parent - The parent element of the property.
   * @param {Property} property - The property to be formatted.
   * @return {Property} - The formatted property.
   */
  formatProperty(parent: string, property: Property): Property {
    property.isArray = property.type.startsWith('Collection');
    property.type = property.type.replace('Collection(', '').replace(')', '').replace('Edm.', '');
    property.name = `${parent}${parent != '' ? '/' : ''}${property.name}`
    return property;
  }

  /**
   * This method is used to filter a given Property.
   *
   * @param {Property} property - The Property object to be filtered.
   * @return {boolean} - Returns true if the property passes the filter, otherwise false.
   */
  filterProperty(property: Property): boolean {
    return !['RelatedObservation', 'RelatedObservations', 'Timeseries'].includes(property.name) && !['DigitaleDelta.Reference', 'DigitaleDelta.Observation'].includes(property.type);
  }

  /**
   * Copies the given query item and inserts it at the specified index in the query.
   * The copied query item will have its copied flag set to true.
   *
   * @param {QueryItem} queryItem - The query item to be copied.
   * @param {number} index - The index at which to insert the copied query item in the query.
   * @return {void}
   */
  copyQueryItem(queryItem: QueryItem, index: number): void {
    let newQueryItem = new QueryItem(queryItem.property);
    newQueryItem.copied = true;
    this.queryItems.splice(index + 1, 0, newQueryItem);
    this.generateQuery();
  }

  /**
   * Remove a query item from the list of query items and regenerate the query.
   *
   * @param {QueryItem} _queryItem - The query item to remove.
   * @param {number} index - The index of the query item to remove.
   * @return {void}
   */
  removeQueryItem(_queryItem: QueryItem, index: number): void {
    this.queryItems.splice(index, 1);
    this.generateQuery();
  }

  /**
   * Stores the settings in the local storage.
   *
   * @function storeSettings
   * @returns {void}
   */
  storeSettings(): void {
    // Store your settings
    localStorage.setItem(KEY, JSON.stringify(this.appConfig));
  }

  /**
   * Clears the settings.
   *
   * @return {void}
   */
  clearSettings(): void {
    // Clear your settings
    localStorage.removeItem(KEY);
    this.appConfig = this.defaultValue;
  }

  /**
   * Generates a query URL based on the current state of the object.
   * This method initializes or updates the following properties:
   * - queryResult - an empty object
   * - queryResultLength - 0
   * - queryPageIndex - 0
   * - queryUrl - a URL string constructed using appConfig, queryPageSize, queryPageIndex, and selectProperties
   * - Optionally, queryUrl may also include a filter based on validQueryItems
   *
   * @return {void}
   */
  generateQuery(): void {
    this.queryResult = {};
    this.queryResultLength = 0;
    this.queryPageIndex = 0;
    this.queryUrl = `${this.appConfig!.ddApiBaseUrl}/observations?$top=${this.queryPageSize}&$skip=${this.queryPageSize * this.queryPageIndex}`;
    if (this.selectProperties?.length > 0) {
      this.queryUrl += `&$select=${this.selectProperties.map(p => p.name).join(',')}`;
    }

    let validQueryItems = this.queryItems.filter(q => this.validateQueryItem(q));
    if (validQueryItems?.length > 0) {
      this.queryUrl += '&$filter=';
      validQueryItems.forEach((queryItem, index, all) => {
        let propertyFormat = queryItem.propertyConverter.data?.format ?? '<property>';
        let valueFormat = queryItem.valueConverter.data?.format ?? '<value>';
        let valueType = queryItem.propertyConverter.data?.outputType ?? queryItem.property.type;
        let value = this.formatQueryValue(queryItem.value, valueType);

        if (['in', 'notin', ''].includes(queryItem.comparer.value)) {
          value = (queryItem.value as string).split(', ').map(v => this.formatQueryValue(v, valueType)).join(', ');
        }

        let query = queryItem.comparer.data.format.replace('<propertyformat>', propertyFormat.replace('<property>', queryItem.property.name).replace('<propertyconverterinputvalue>', queryItem.propertyConverter.data?.inputValue)).replace('<valueformat>', valueFormat.replace('<value>', value));
        this.queryUrl += query;
        if (index < all.length - 1) {
          this.queryUrl += ` ${queryItem.logical} `;
        }
      })
    }
  }

  /**
   * Formats the query value based on its type.
   *
   * @param {any} value - The value to format.
   * @param {string} valueType - The type of the value.
   * @return {any} The formatted value.
   */
  formatQueryValue(value: any, valueType: string): any {
    if (!['Double', 'Int64', 'Decimal', 'Boolean'].includes(valueType)) {
      return `'${value}'`;
    } else {
      return value;
    }
  }

  /**
   * Validates the given query item.
   *
   * @param {QueryItem} queryItem - The query item to validate.
   *
   * @return {boolean} - Returns true if the query item is valid, otherwise false.
   */
  validateQueryItem(queryItem: QueryItem): boolean {
    let propertyConverterInputValid: boolean = true;
    if (queryItem.propertyConverter.value) {
      propertyConverterInputValid = queryItem.propertyConverter.data?.inputType ? queryItem.propertyConverter.data?.inputValue != null : true;
    }
    return propertyConverterInputValid && queryItem.comparer.value != null && queryItem.value != null && queryItem.logical != null;
  }

  /**
   * Retrieves the default settings from the server.
   *
   * @returns {Observable<DefaultSettings>} An observable that emits the default settings.
   */
  private getSettingsFromServer(): Observable<DefaultSettings> {
    return this.http.get<DefaultSettings>('/ddapi/defaultsettings');
  }

  /**
   * Stores the default settings if they do not already exist in localStorage.
   *
   * @param {DefaultSettings} data - The default settings to store.
   * @return {Observable<DefaultSettings>} - An observable that emits the stored default settings.
   */
  private storeSettingsIfNotExist(data: DefaultSettings): Observable<DefaultSettings> {
    this.appConfig = data;
    this.defaultValue = data;

    const storedSettings = localStorage.getItem(KEY);

    if (!storedSettings) {
      localStorage.setItem(KEY, JSON.stringify(this.appConfig));
    } else {
      this.appConfig = JSON.parse(storedSettings);
    }

    return of(this.appConfig);
  }

  /**
   * Retrieves the validation result from the server.
   * @returns {Observable<Record<string, Type>>} - An Observable containing the validation result as a Record.
   */
  private getValidationResult(): Observable<Record<string, Type>> {
    let body = { DDApiBaseUrl: this.appConfig!.ddApiBaseUrl };
    return this.http.post<Record<string, Type>>('/ddapi/validate', body);
  }
}





