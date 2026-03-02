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
        email      NVARCHAR(320) NOT NULL,
        createdAt  DATETIME      NOT NULL DEFAULT GETDATE()          -- server-side timestamp
    );
END
GO

-- 3. Create the RoomBookings table (skip if it already exists)
IF NOT EXISTS (
    SELECT * FROM sys.tables WHERE name = 'RoomBookings' AND type = 'U'
)
BEGIN
    CREATE TABLE RoomBookings (
        id         INT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
        entryId    INT          NOT NULL REFERENCES Entries(id),  -- FK → Entries
        roomNumber NVARCHAR(50) NOT NULL,
        numGuests  INT          NOT NULL,
        createdAt  DATETIME     NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 4. (Optional) verify the schema
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM   INFORMATION_SCHEMA.COLUMNS
WHERE  TABLE_NAME IN ('Entries', 'RoomBookings')
ORDER  BY TABLE_NAME, ORDINAL_POSITION;
GO
