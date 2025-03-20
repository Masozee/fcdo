-- DuckDB import script

-- Create table data_category
CREATE TABLE IF NOT EXISTS "data_category" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "name" VARCHAR NOT NULL,
  "keterangan" VARCHAR 
);

-- Import data into data_category
COPY "data_category" FROM 'E:\Work\fcdo\fcdo\data\export\data_category.csv' (HEADER, AUTO_DETECT);

-- Create table data_option
CREATE TABLE IF NOT EXISTS "data_option" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "name" VARCHAR NOT NULL,
  "slug" VARCHAR NOT NULL,
  "order" BIGINT NOT NULL,
  "keterangan" VARCHAR ,
  "category_id" VARCHAR NOT NULL
);

-- Import data into data_option
COPY "data_option" FROM 'E:\Work\fcdo\fcdo\data\export\data_option.csv' (HEADER, AUTO_DETECT);

-- Create table data_option_parents
CREATE TABLE IF NOT EXISTS "data_option_parents" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "from_option_id" VARCHAR NOT NULL,
  "to_option_id" VARCHAR NOT NULL
);

-- Import data into data_option_parents
COPY "data_option_parents" FROM 'E:\Work\fcdo\fcdo\data\export\data_option_parents.csv' (HEADER, AUTO_DETECT);

-- Create table data_tradeinvestmentdata
CREATE TABLE IF NOT EXISTS "data_tradeinvestmentdata" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "country" VARCHAR NOT NULL,
  "year" DATE ,
  "value" DECIMAL(18,6) NOT NULL,
  "keterangan" VARCHAR ,
  "industry_id" VARCHAR NOT NULL
);

-- Import data into data_tradeinvestmentdata
COPY "data_tradeinvestmentdata" FROM 'E:\Work\fcdo\fcdo\data\export\data_tradeinvestmentdata.csv' (HEADER, AUTO_DETECT);

-- Create table api_productcode
CREATE TABLE IF NOT EXISTS "api_productcode" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "code" VARCHAR NOT NULL,
  "name" VARCHAR NOT NULL,
  "hs_level" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP NOT NULL
);

-- Import data into api_productcode
COPY "api_productcode" FROM 'E:\Work\fcdo\fcdo\data\export\api_productcode.csv' (HEADER, AUTO_DETECT);

-- Create table data_productcode
CREATE TABLE IF NOT EXISTS "data_productcode" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "code" VARCHAR NOT NULL,
  "name" VARCHAR NOT NULL,
  "hs_level" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP NOT NULL
);

-- Import data into data_productcode
COPY "data_productcode" FROM 'E:\Work\fcdo\fcdo\data\export\data_productcode.csv' (HEADER, AUTO_DETECT);

-- Create table data_hstradedata
CREATE TABLE IF NOT EXISTS "data_hstradedata" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "country" VARCHAR NOT NULL,
  "value" DECIMAL(18,6) NOT NULL,
  "percent_trade" DOUBLE ,
  "CR4" DOUBLE ,
  "keterangan" VARCHAR ,
  "category_id" VARCHAR NOT NULL,
  "tradeflow_id" VARCHAR NOT NULL,
  "rank_desc" BIGINT ,
  "rank_within_product" BIGINT ,
  "total_trade" DECIMAL(18,6) ,
  "year" DATE 
);

-- Import data into data_hstradedata
COPY "data_hstradedata" FROM 'E:\Work\fcdo\fcdo\data\export\data_hstradedata.csv' (HEADER, AUTO_DETECT);

-- Create table data_internationalcooperation
CREATE TABLE IF NOT EXISTS "data_internationalcooperation" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "name" VARCHAR NOT NULL,
  "abbreviation" VARCHAR NOT NULL,
  "slug" VARCHAR NOT NULL,
  "description" VARCHAR ,
  "website" VARCHAR ,
  "established_date" DATE ,
  "is_active" VARCHAR NOT NULL,
  "logo" VARCHAR ,
  "keterangan" VARCHAR ,
  "countries" VARCHAR NOT NULL
);

-- Import data into data_internationalcooperation
COPY "data_internationalcooperation" FROM 'E:\Work\fcdo\fcdo\data\export\data_internationalcooperation.csv' (HEADER, AUTO_DETECT);


-- To import this data into DuckDB, run:
-- duckdb olap_data.duckdb < import_to_duckdb.sql
