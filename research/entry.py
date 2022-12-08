import sys
import json
import librosa
from typing import Literal

global_params = {"sr": 11_025, "n_fft": 2048, "hop_length": 2048 // 4}

bands_params = {"avg_window": 10, **global_params}
prominence_params = {
    "num_peaks": 15,
    "distance": 100,
    **global_params,
}

cluster_kwargs = {"window_size": 3, "gap_size": 1}
fanout_kwargs = {"fan_out": 10, "tail_size": 1}


def get_fingerprint_method(
    music,
    freq_method: Literal["bands", "prominence"],
    hash_method: Literal["cluster", "fanout"],
):

    peaks = None
    if freq_method == "bands":
        from freq.bands import get_peak_frequencies_bands as bands

        peaks = bands(music, **bands_params)
    elif freq_method == "prominence":
        from freq.prominence import get_peak_frequencies_prominence as prominence

        peaks = prominence(music, **prominence_params)

    if peaks is None:
        return None

    if hash_method == "cluster":
        from hash.cluster import get_hashes_from_peaks_cluster as cluster

        return cluster(peaks, **cluster_kwargs)

    elif hash_method == "fanout":
        from hash.fanout import get_hashes_from_peaks_fanout as fanout

        return fanout(peaks, **fanout_kwargs)

    return None


if __name__ == "__main__":
    argv = sys.argv[1:]

    if len(sys.argv) <= 1:
        print("Missing method")
        sys.exit(1)

    method = sys.argv[1]
    argv = sys.argv[2:]

    if method == "fingerprint":
        freq_method: Literal["bands", "prominence"] = "bands"
        hash_method: Literal["cluster", "fanout"] = "fanout"

        (file,) = argv

        print(
            f"Computing hash for {file} (freq={freq_method}, hash={hash_method})",
            file=sys.stderr,
        )

        audio, sr = librosa.load(file, sr=global_params["sr"])
        result = get_fingerprint_method(audio, freq_method, hash_method)

        print(f"Obtained {len(result)} hashes", file=sys.stderr)
        print(json.dumps(result), file=sys.stdout)

    elif method == "match":
        record_name, database_name = argv

        print(f"Comparing two files {record_name} {database_name}", file=sys.stderr)

        with open(record_name, "r", encoding="utf-8") as record_file, open(
            database_name, "r", encoding="utf-8"
        ) as database_file:
            from util.compare import compare_fingerprints

            record = json.load(record_file)
            database = json.load(database_file)

            result = compare_fingerprints(record, database)

            prob = result[0]["songId"] if len(result) > 0 else "-"

            print(f"Most probable match {prob}", file=sys.stderr)
            print(json.dumps(result), file=sys.stdout)

    else:
        print("Invalid arguments", file=sys.stderr)
        sys.exit(1)
