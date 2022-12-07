import librosa
import librosa.display
import numpy as np
from collections import defaultdict
import matplotlib.pyplot as plt


def draw_filtered(music, get_peak_freq, limits=[], sr=22_050, fig=plt):
    n_fft = 2048
    hop_length = 2048//4

    f = get_peak_freq(music, n_fft=n_fft, hop_length=hop_length)
    S = np.abs(librosa.stft(music, n_fft=n_fft, hop_length=hop_length))

    all_frames = np.arange(S.shape[1])
    frequencies = librosa.fft_frequencies(
        sr=sr,
        n_fft=n_fft,
    )

    times = librosa.frames_to_time(
        all_frames,
        sr=sr,
        hop_length=hop_length,
        n_fft=n_fft
    )

    fig.pcolormesh(times, frequencies, librosa.amplitude_to_db(S))
    fig.scatter(x=f[:, 1], y=f[:, 0], c="w", marker="+", linewidths=1)
    fig.set_ylim(0, 3000)

    for limit in limits:
        if limit != np.inf:
            fig.axhline(y=frequencies[int(limit)], c="k")
