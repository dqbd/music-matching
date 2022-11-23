import numpy as np
import librosa

from fastdtw import fastdtw
from typing import Callable

nutcracker = librosa.example('nutcracker')
brahms = librosa.example("brahms")

audio_nut, sr_nut = librosa.load(nutcracker)
audio_brah, sr_brah = librosa.load(brahms)

mfcc_full = librosa.feature.mfcc(
    y=audio_nut,
    sr=sr_nut,
    n_mfcc=20
)


mfcc_segment = librosa.feature.mfcc(
    y=audio_nut[int(audio_nut.shape[-1] / 4)
                    : int(3 * audio_nut.shape[-1] / 4)],
    sr=sr_nut,
    n_mfcc=20
)

mfcc_different = librosa.feature.mfcc(
    y=audio_brah,
    sr=sr_brah,
    n_mfcc=20
)


def euclid(a: np.float32, b: np.float32):
    return np.abs(a - b)


def dtw(source: np.array, target: np.array, dist: Callable[[np.float32, np.float32], np.float32]):
    n, m = (source.shape[-1], target.shape[-1])
    matrix = np.ndarray((n + 1, m + 1))
    matrix[:] = np.inf
    matrix[0, 0] = 0

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            new_cost = dist(source[i - 1], target[j - 1])
            min_cost = np.min(
                [matrix[i-1, j], matrix[i, j-1], matrix[i-1, j-1]]
            )
            matrix[i, j] = new_cost + min_cost
    return matrix[n, m]


def avg_all_mfcc(source, target, dist: Callable[[np.float32, np.float32], np.float32]):
    # TODO: is averaging for every MFCC a reasonable calculation
    return np.average([fastdtw(source[i], target[i], dist=dist)[0] for i in range(np.min([len(source), len(target)]))])


print(avg_all_mfcc(mfcc_full, mfcc_full, dist=euclid))
print(avg_all_mfcc(mfcc_full, mfcc_segment, dist=euclid))
print(avg_all_mfcc(mfcc_full, mfcc_different, dist=euclid))
