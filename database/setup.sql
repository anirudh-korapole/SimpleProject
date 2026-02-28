-- Run this script once against your SQL Server instance to create the database and table.

-- 1. Create the database (skip if it already exists)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SimpleProjectDB')
BEGIN
    CREATE DATABASE SimpleProjectDB;
END
GO

USE SimpleProjectDB;
GO

-- 2. Create the Entries table (skip if it already exists)
IF NOT EXISTS (
    SELECT * FROM sys.tables WHERE name = 'Entries' AND type = 'U'
)
BEGIN
    CREATE TABLE Entries (
        id         INT           NOT NULL IDENTITY(1,1) PRIMARY KEY, -- auto-increment PK
        textValue  NVARCHAR(MAX) NOT NULL,
        createdAt  DATETIME      NOT NULL DEFAULT GETDATE()          -- server-side timestamp
    );
END
GO

-- 3. (Optional) verify the schema
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM   INFORMATION_SCHEMA.COLUMNS
WHERE  TABLE_NAME = 'Entries';
GO
