import json
import sys
from collections import defaultdict


def compare_fingerprints(record_hashes, db_hashes):
    """
    Figure out matches between two fingerprints
    1) Create a fingerprint from recording
    2) Find the intersection of 2 fingerprints based on their hashes
    3) Gather all deltas (distance between needle and search), count how many deltas are matching => sort by number of matching deltas
    """
    # Construct dict from music hashes
    times = defaultdict(list)

    for fingerprint in record_hashes:
        times[fingerprint["hash"]].append(fingerprint["time"])

    # Group by song IDs from db hashes
    db_per_song = defaultdict(list)
    for music in db_hashes:
        db_per_song[music["songId"]].append(music)

    db_match_count = defaultdict(int)
    for songId, fingerprints in db_per_song.items():
        durations = defaultdict(int)
        for fingerprint in fingerprints:
            for music_time in times[fingerprint["hash"]]:
                delta = abs(music_time - fingerprint["time"])
                durations[str(delta)] += 1
        db_match_count[songId] = sorted(durations.values())[-1]

    return [{"songId": songId, "matches": matches} for songId, matches in reversed(sorted(db_match_count.items(), key=lambda item: item[1]))]


if __name__ == "__main__":
    argv = sys.argv[1:]
    if (len(argv) == 2):
        sourceName, targetName = argv
        print(
            f"Comparing two files {sourceName} {targetName}", file=sys.stderr)

        with open(sourceName, "r", encoding="utf-8") as sourceFile, open(targetName, "r", encoding="utf-8") as targetFile:
            source = json.load(sourceFile)
            target = json.load(targetFile)

            result = compare_fingerprints(source, target)
            print(json.dumps(result), file=sys.stdout)

    else:
        print("Invalid arguments", file=sys.stderr)
        sys.exit(1)
