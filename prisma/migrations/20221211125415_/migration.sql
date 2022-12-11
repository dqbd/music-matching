-- CreateTable
CREATE TABLE "Song" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filepath" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "album" TEXT,
    "coverImg" TEXT
);

-- CreateTable
CREATE TABLE "Fingerprint" (
    "hash" TEXT NOT NULL,
    "time" REAL NOT NULL,
    "songId" INTEGER NOT NULL,

    PRIMARY KEY ("hash", "time", "songId"),
    CONSTRAINT "Fingerprint_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
