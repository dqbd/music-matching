import librosa
import librosa.display
import numpy as np
from collections import defaultdict
import matplotlib.pyplot as plt


def draw_single(
    music, sr=22_050, n_fft=2_048, hop_length=2_048 // 4, ylim=None, fig=plt
):
    S = np.abs(librosa.stft(music, n_fft=n_fft, hop_length=hop_length))

    all_frames = np.arange(S.shape[1])
    frequencies = librosa.fft_frequencies(
        sr=sr,
        n_fft=n_fft,
    )

    times = librosa.frames_to_time(
        all_frames, sr=sr, hop_length=hop_length, n_fft=n_fft
    )

    fig.pcolormesh(times, frequencies, librosa.amplitude_to_db(S))
    fig.set_ylim(0, ylim)


def draw_filtered(
    music, freqs, sr=22_050, n_fft=2_048, hop_length=2_048 // 4, ylim=None, fig=plt
):
    draw_single(music, sr=sr, n_fft=n_fft, hop_length=hop_length, ylim=ylim, fig=fig)
    frequencies = np.array(librosa.fft_frequencies(sr=sr, n_fft=n_fft))

    for get_peak_freq, kwargs in freqs:
        f = get_peak_freq(music, sr=sr, n_fft=n_fft, hop_length=hop_length)
        fig.scatter(x=f[:, 1], y=frequencies[f[:, 0].astype(int)], **kwargs, linewidths=1)
