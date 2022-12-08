import numpy as np


def get_hashes_from_peaks_fanout(peaks, fan_out=10, tail_size=2):
    """
    Generate hashes by incrementally raising offset
    between anchor frequency and the tail frequencies
    """
    hashes = []
    size = peaks.shape[0]

    peak_index = np.arange(size)
    fanout_range = np.arange(0, fan_out)

    already_present = set()

    for i in peak_index:
        head = peaks[[i]]

        for j in fanout_range:
            tail_start = i + j + 1
            tail_end = tail_start + tail_size

            if tail_end < size:
                tail = peaks[tail_start:tail_end]
                freqs = np.concatenate((head, tail))

                time = freqs[0][1]
                hash = ",".join([str(int(peak[0])) for peak in freqs])

                key = "|".join([str(time), hash])

                if key not in already_present:
                    hashes.append({"time": freqs[0][1], "hash": hash})
                    already_present.add(key)

    return hashes
