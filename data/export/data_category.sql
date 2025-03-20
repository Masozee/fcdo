-- Create table data_category
CREATE TABLE IF NOT EXISTS "data_category" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "name" VARCHAR NOT NULL,
  "keterangan" VARCHAR 
);

-- Import data
COPY "data_category" FROM 'E:\\Work\\fcdo\\fcdo\\data\\export\\data_category.csv' (HEADER, AUTO_DETECT);

