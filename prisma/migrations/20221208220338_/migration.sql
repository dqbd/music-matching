-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "filepath" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "album" TEXT,
    "coverImg" TEXT,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fingerprint" (
    "hash" TEXT NOT NULL,
    "time" DOUBLE PRECISION NOT NULL,
    "songId" INTEGER NOT NULL,

    CONSTRAINT "Fingerprint_pkey" PRIMARY KEY ("hash","time","songId")
);

-- AddForeignKey
ALTER TABLE "Fingerprint" ADD CONSTRAINT "Fingerprint_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
