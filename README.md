# DD-API-UI
User interface to help with the composition of DD-API OData queries.
An implementation of this project is available at [https://ddapi-ui.ecosys.nl](https://ddapi-ui.ecosys.nl).

## Description
This repository contains a user interface that helps users compose DD-API OData queries from any DD-API V3 provider.
The code is primarily written in Angular/TypeScript, with a few C# functions to deal with converting an OData CSDL into a structure that is easier to handle by Angular.
Authentication is also performed on the server side, to prevent CORS issues.

## State
The current version lacks some features that we want to add over time. Now implemented is are the OData $filter and $count fragments and a crude display of the resulting data.

## TODO
- Implement $select, which requires $expand for navigatable objects.
- Retrieve lists from the /reference endpoints and use those for eq and ne filters.
- Create a map for selecting geographical objects and tie these to the /reference geography lists.
- Create an export option
- Store multiple connections in the localStorage

