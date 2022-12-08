-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "album" TEXT,
    "coverImg" TEXT,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fingerprint" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "time" DOUBLE PRECISION NOT NULL,
    "songId" TEXT NOT NULL,

    CONSTRAINT "Fingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fingerprint_hash_time_idx" ON "Fingerprint"("hash", "time");

-- AddForeignKey
ALTER TABLE "Fingerprint" ADD CONSTRAINT "Fingerprint_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
