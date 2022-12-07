-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filepath" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "album" TEXT,
    "coverImg" TEXT
);

-- CreateTable
CREATE TABLE "Fingerprint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "time" REAL NOT NULL,
    "songId" TEXT NOT NULL,
    CONSTRAINT "Fingerprint_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Fingerprint_hash_time_idx" ON "Fingerprint"("hash", "time");
