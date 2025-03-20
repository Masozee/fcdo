-- Create table data_option
CREATE TABLE IF NOT EXISTS "data_option" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "name" VARCHAR NOT NULL,
  "slug" VARCHAR NOT NULL,
  "order" BIGINT NOT NULL,
  "keterangan" VARCHAR ,
  "category_id" VARCHAR NOT NULL
);

-- Import data
COPY "data_option" FROM 'E:\\Work\\fcdo\\fcdo\\data\\export\\data_option.csv' (HEADER, AUTO_DETECT);

