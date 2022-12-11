import json
from typing import Literal

import librosa
import time
from entry import get_fingerprint_method, global_params
from util.compare import compare_fingerprints

results = {
    "prominence": {
        "cluster": {
            "hashes": {
                "time": 0.
            },
            "compare": {
                "time": 0.
            },
        },
        "fanout": {
            "hashes": {
                "time": 0.
            },
            "compare": {
                "time": 0.
            },
        },
    },
    "bands": {
        "cluster": {
            "hashes": {
                "time": 0.
            },
            "compare": {
                "time": 0.
            },
        },
        "fanout": {
            "hashes": {
                "time": 0.
            },
            "compare": {
                "time": 0.
            },
        },
    }
}


def get_results(recording, music, freq_method: Literal["bands", "prominence"], hash_method: Literal["cluster", "fanout"], is_correct):
    music_hashes = get_fingerprint_method(music, freq_method, hash_method)

    start_time = time.process_time()
    recording_hashes = get_fingerprint_method(recording, freq_method, hash_method)
    results[freq_method][hash_method]["hashes"]["time"] = (time.process_time() - start_time) * 1000

    start_time = time.process_time()
    fingerprints_results = compare_fingerprints(recording_hashes, music_hashes)[0]
    results[freq_method][hash_method]["compare"]["time_correct" if is_correct else "time_incorrect"] = (time.process_time() - start_time) * 1000
    results[freq_method][hash_method]["compare"]["matches_correct" if is_correct else "matches_incorrect"] = fingerprints_results["matches"]
    results[freq_method][hash_method]["compare"]["ratio_correct" if is_correct else "ratio_incorrect"] = fingerprints_results["ratio"]


music_file = "../dataset/6-24-music.wav"
recording_file = "samples/6-24-recording.wav"
music, _ = librosa.load(music_file, sr=global_params["sr"])
recording, _ = librosa.load(recording_file, sr=global_params["sr"])

# CORRECT
get_results(recording, music, "bands", "cluster", True)
get_results(recording, music, "bands", "fanout", True)
get_results(recording, music, "prominence", "cluster", True)
get_results(recording, music, "prominence", "fanout", True)

# INCORRECT
music_file = "../dataset/[TJKNALxiqJg].wav"
music, _ = librosa.load(music_file, sr=global_params["sr"])

get_results(recording, music, "bands", "cluster", False)
get_results(recording, music, "bands", "fanout", False)
get_results(recording, music, "prominence", "cluster", False)
get_results(recording, music, "prominence", "fanout", False)

print(json.dumps(results, indent=2))
