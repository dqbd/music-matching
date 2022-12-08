import numpy as np
from collections import defaultdict
from typing import TypedDict, DefaultDict, Optional


class SampleHash(TypedDict):
    time: float
    hash: str


class MusicHash(SampleHash):
    songId: Optional[int]


def compare_fingerprints(
    record_hashes: list[SampleHash], music_hashes: list[MusicHash], limit=50
):
    """
    Figure out matches between two fingerprints
    - Find the intersection of 2 fingerprints based on their hashes
    - Gather all deltas (distance between needle and search)
    - count how many deltas are matching
    - return the number of most hits matching same delta
    """
    # Construct dict from music hashes
    time_list: DefaultDict[str, list[float]] = defaultdict(list)

    # Create a map of [record hash, list of time captured]
    for record_fingerprint in record_hashes:
        time_list[record_fingerprint["hash"]].append(record_fingerprint["time"])

    # Group by song IDs from db hashes
    hashes_per_song = defaultdict(list)
    for music_fingerprint in music_hashes:
        hashes_per_song[music_fingerprint.get("songId", "<none>")].append(
            music_fingerprint
        )

    song_match_count: DefaultDict[int, int] = defaultdict(int)
    for song_id, song_hashes in hashes_per_song.items():
        durations: DefaultDict[float, int] = defaultdict(int)

        for music_fingerprint in song_hashes:
            for time in time_list[music_fingerprint["hash"]]:
                delta: float = abs(time - music_fingerprint["time"])
                durations[delta] += 1
        song_match_count[song_id] = sorted(durations.values())[-1]

    min_hash_count = min(len(music_hashes), len(record_hashes))

    return [
        {
            "songId": song_id,
            "matches": matches,
            "ratio": matches / min_hash_count,
        }
        for song_id, matches in reversed(
            sorted(song_match_count.items(), key=lambda item: item[1])
        )
    ][:limit]
