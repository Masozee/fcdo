# FCDO API with DuckDB and Hono

This project has been updated to use DuckDB for the database and Hono for the API server.

## Overview

The API provides access to trade data stored in a DuckDB database file. It uses the Hono framework for handling HTTP requests and routing.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- DuckDB database file (located in the data directory)

### Setting Up

1. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   pnpm install
   ```

2. Ensure your DuckDB database file exists. The default location is `data/olap_data.duckdb`. You can modify this path in `api/src/config.ts`.

3. Build the API:
   ```
   npm run api:build
   ```
   or
   ```
   pnpm api:build
   ```

## Running the API

### Development Mode

```
npm run api:dev
```
or
```
pnpm api:dev
```

This will start the API server with hot-reloading for development.

### Production Mode

```
npm run api:build
npm run api:start
```
or
```
pnpm api:build
pnpm api:start
```

## Testing

### Database Connection Test

This will test the database connection and run some basic queries to verify the database is accessible:

```
npm run api:test-db
```
or
```
pnpm api:test-db
```

### API Tests

This will test the API endpoints to verify they are working correctly:

```
npm run test-api
```
or
```
pnpm test-api
```

## Troubleshooting

### Database Connection Issues

If you experience database connection issues, check the following:

1. Verify that the database file exists at the configured path
2. Ensure the database file is readable by the Node.js process
3. Check the console logs for specific error messages

### API Server Issues

If the API server fails to start, check the following:

1. Verify that ports 3000 (or your configured port) is available
2. Check for TypeScript compilation errors
3. Ensure all dependencies are properly installed

## API Endpoints

The API provides various endpoints for accessing trade data. See the `api/README.md` file for a complete list of endpoints.

## Note on Type Declarations

This project includes custom type declarations for DuckDB and Hono in the `api/src/types` directory. These declarations may need to be updated if you upgrade the dependencies. 