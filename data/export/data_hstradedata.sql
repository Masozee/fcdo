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

-- Import data
COPY "data_hstradedata" FROM 'E:\\Work\\fcdo\\fcdo\\data\\export\\data_hstradedata.csv' (HEADER, AUTO_DETECT);

