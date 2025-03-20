-- Create table data_productcode
CREATE TABLE IF NOT EXISTS "data_productcode" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "code" VARCHAR NOT NULL,
  "name" VARCHAR NOT NULL,
  "hs_level" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP NOT NULL
);

-- Import data
COPY "data_productcode" FROM 'E:\\Work\\fcdo\\fcdo\\data\\export\\data_productcode.csv' (HEADER, AUTO_DETECT);

