-- Create table api_productcode
CREATE TABLE IF NOT EXISTS "api_productcode" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "code" VARCHAR NOT NULL,
  "name" VARCHAR NOT NULL,
  "hs_level" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP NOT NULL
);

-- Import data
COPY "api_productcode" FROM 'E:\\Work\\fcdo\\fcdo\\data\\export\\api_productcode.csv' (HEADER, AUTO_DETECT);

