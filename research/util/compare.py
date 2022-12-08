
import numpy as np
from collections import defaultdict


def compare_fingerprints(record_hashes, music_hashes):
    """
    Figure out matches between two fingerprints
    - Find the intersection of 2 fingerprints based on their hashes
    - Gather all deltas (distance between needle and search)
    - count how many deltas are matching
    - return the number of most hits matching same delta
    """
    # Construct dict from music hashes
    time_list = defaultdict(list)

    for fingerprint in record_hashes:
        time_list[fingerprint["hash"]].append(fingerprint["time"])

    durations = defaultdict(int)
    for fingerprint in music_hashes:
        for time in time_list[fingerprint["hash"]]:
            delta = abs(time - fingerprint["time"])
            durations[str(delta)] += 1

    max = sorted(durations.values())[-1]

    return (max, max / min(len(music_hashes), len(record_hashes)))
