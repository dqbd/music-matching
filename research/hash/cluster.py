import numpy as np


def get_hashes_from_peaks_cluster(peaks, window_size=5, gap_size=2):
    """
    Constructs a sliding window to create a cluster of frequency peaks
    Resulting tuple / hash will have more entropy, thus reducing the computation cost
    """
    flat = np.apply_along_axis(
        lambda key: {"freq": key[0], "time": key[1]}, 1, peaks
    )

    hashes = []
    for window in np.lib.stride_tricks.sliding_window_view(flat, window_size):
        time = window[0]["time"]
        peaks = np.concatenate(([window[0]], window[gap_size + 1:]))
        hash = ",".join([str(int(peak["freq"])) for peak in peaks])

        hashes.append({"time": time, "hash": hash})

    return hashes
