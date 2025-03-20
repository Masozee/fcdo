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

-- Import data
COPY "data_internationalcooperation" FROM 'E:\\Work\\fcdo\\fcdo\\data\\export\\data_internationalcooperation.csv' (HEADER, AUTO_DETECT);

