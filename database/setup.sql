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
        entryId    INT          NOT NULL REFERENCES Entries(id),
        roomNumber NVARCHAR(50) NOT NULL,
        numGuests  INT          NOT NULL,
        checkIn    DATE         NULL,
        checkOut   DATE         NULL,
        createdAt  DATETIME     NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 4. Create the BookingGuests table (skip if it already exists)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BookingGuests' AND type = 'U')
BEGIN
  CREATE TABLE BookingGuests (
    id          INT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
    bookingId   INT           NOT NULL REFERENCES RoomBookings(id),
    guestName   NVARCHAR(100) NOT NULL,
    guestAge    INT           NOT NULL,
    guestGender NVARCHAR(20)  NOT NULL,
    createdAt   DATETIME2     NOT NULL DEFAULT GETDATE()
  );
END
GO

-- 5. Create the RoomTypes table (skip if it already exists)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RoomTypes' AND type = 'U')
BEGIN
  CREATE TABLE RoomTypes (
    id          INT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500) NULL,
    createdAt   DATETIME2     NOT NULL DEFAULT GETDATE()
  );
END
GO

-- 6. Create the Rooms table (skip if it already exists)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Rooms' AND type = 'U')
BEGIN
  CREATE TABLE Rooms (
    id             INT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
    roomNumber     NVARCHAR(20)  NOT NULL UNIQUE,
    roomType       NVARCHAR(100) NULL,
    roomTypeId     INT           NULL REFERENCES RoomTypes(id),
    capacity       INT           NOT NULL,
    isAvailable    BIT           NOT NULL DEFAULT 1,
    hasAC          BIT           NOT NULL DEFAULT 0,
    hasWifi        BIT           NOT NULL DEFAULT 0,
    hasGeyser      BIT           NOT NULL DEFAULT 0,
    smokingAllowed BIT           NOT NULL DEFAULT 0,
    hasElectricityBackup BIT     NOT NULL DEFAULT 0,
    toiletType     NVARCHAR(20)  NOT NULL DEFAULT 'western',
    bedType        NVARCHAR(20)  NOT NULL,
    createdAt      DATETIME2     NOT NULL DEFAULT GETDATE()
  );
END
GO

-- 7. Add roomTypeId FK to existing Rooms table (if column is missing)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Rooms' AND type = 'U')
   AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Rooms') AND name = 'roomTypeId')
BEGIN
  ALTER TABLE Rooms ADD roomTypeId INT NULL REFERENCES RoomTypes(id);
END
GO

-- 8. Create the Settings table (skip if already exists)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Settings' AND type = 'U')
BEGIN
  CREATE TABLE Settings (
    [key]   NVARCHAR(50)  NOT NULL PRIMARY KEY,
    [value] NVARCHAR(200) NOT NULL
  );
  -- Seed default check-in / check-out times
  INSERT INTO Settings ([key], [value]) VALUES ('checkInTime',  '14:00');
  INSERT INTO Settings ([key], [value]) VALUES ('checkOutTime', '11:00');
END
GO

-- 9. (Optional) verify the schema
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM   INFORMATION_SCHEMA.COLUMNS
WHERE  TABLE_NAME IN ('Entries', 'RoomBookings', 'BookingGuests', 'RoomTypes', 'Rooms')
ORDER  BY TABLE_NAME, ORDINAL_POSITION;
GO
