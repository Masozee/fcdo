-- Create table data_tradeinvestmentdata
CREATE TABLE IF NOT EXISTS "data_tradeinvestmentdata" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "country" VARCHAR NOT NULL,
  "year" DATE ,
  "value" DECIMAL(18,6) NOT NULL,
  "keterangan" VARCHAR ,
  "industry_id" VARCHAR NOT NULL
);

-- Import data
COPY "data_tradeinvestmentdata" FROM 'E:\\Work\\fcdo\\fcdo\\data\\export\\data_tradeinvestmentdata.csv' (HEADER, AUTO_DETECT);

