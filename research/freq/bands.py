import librosa
import librosa.display
import numpy as np
from typing import Literal

# Bands defined at 11 025 Hz
NEW_LIMITS = np.array([250, 520, 1450, 3500, np.inf])


def get_peak_frequencies_bands(
    y,
    sr=22_050,
    n_fft=2_048,
    avg_window=10,
    hop_length=2_048 // 4,
    avg_method: Literal["window", "all"] = "window",
):
    """
    Extract peak frequencies for each FFT frame
    """
    S = np.abs(librosa.stft(y, n_fft=n_fft, hop_length=hop_length))

    all_frames = np.arange(S.shape[1])
    all_bins = np.arange(S.shape[0])

    frequencies = librosa.fft_frequencies(sr=sr, n_fft=n_fft)
    times = librosa.frames_to_time(
        all_frames, sr=sr, hop_length=hop_length, n_fft=n_fft
    )

    # scaled bands to meet sampling rate
    limits = NEW_LIMITS * (sr / 11_025)

    bands = np.array([np.argmax(limits >= freq) for freq in frequencies])
    S_out = np.zeros_like(S, dtype=np.bool8)

    for band in np.unique(bands):
        start_row = np.argmax(bands == band)
        end_row = len(bands) - np.argmax(bands[::-1] == band)

        slice = S[start_row:end_row]

        average_mask = None

        if avg_method == "all":
            # Computing threshold by picking loudest freq in freq slice
            # and averaging their amplitudes (multiplied by a constant)
            average_mask = np.mean(np.max(slice, axis=0))

        if average_mask == "window":
            window = min(avg_window, slice.shape[-1])
            average_mask = np.convolve(
                np.max(slice, axis=0), np.ones(window) / window, mode="same"
            )

        # Max frequency bin index of a slice for each FFT frame
        # Not filtered by mean yet
        max_freq_bin = start_row + np.argmax(slice, axis=0)

        # Pick only frequencies, if their amplitude is higher than
        # the mean amplitude of the entire band captured from the whole song
        mask = S[max_freq_bin, all_frames] >= (average_mask or 0)
        S_out[max_freq_bin[mask], all_frames[mask]] = True

    result = np.apply_along_axis(
        lambda key: np.array([key[0], times[key[1]]]),
        1,
        np.argwhere(S_out > 0),
    )

    result = result[result[:, 0].argsort()]
    result = result[result[:, 1].argsort(kind="mergesort")]

    return result
