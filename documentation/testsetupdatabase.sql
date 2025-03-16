-- Create test_table if it does not exist
CREATE TABLE IF NOT EXISTS test_table (
    name VARCHAR(255),
    age INT
);

-- Select all records from test_table
SELECT * FROM test_table;