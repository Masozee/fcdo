-- Create table data_option_parents
CREATE TABLE IF NOT EXISTS "data_option_parents" (
  "id" BIGINT PRIMARY KEY NOT NULL,
  "from_option_id" VARCHAR NOT NULL,
  "to_option_id" VARCHAR NOT NULL
);

-- Import data
COPY "data_option_parents" FROM 'E:\\Work\\fcdo\\fcdo\\data\\export\\data_option_parents.csv' (HEADER, AUTO_DETECT);

