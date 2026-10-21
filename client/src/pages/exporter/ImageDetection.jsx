import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  predictImage,
  clearPrediction,
} from "../../features/imageDetection/imageDetectionSlice.js";

const ImageDetection = () => {
  const dispatch = useDispatch();

  const { result, loading, error } = useSelector(
    (state) => state.imageDetection,
  );

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [showCoordinates, setShowCoordinates] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    setFileError("");
    dispatch(clearPrediction());

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setFileError("Choose a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError("Image size must not exceed 10 MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setShowCoordinates(false);
  };

  const handleDetection = () => {
    if (!selectedImage || loading) return;

    dispatch(predictImage(selectedImage));
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreview("");
    setFileError("");
    setShowCoordinates(false);
    dispatch(clearPrediction());

    const input = document.getElementById("cargo-image");

    if (input) input.value = "";
  };

  const detections = Array.isArray(result?.detections) ? result.detections : [];

  const totalDetections =
    typeof result?.count === "number" ? result.count : detections.length;

  const uniqueClasses = new Set(
    detections.map((item) => item.class_id ?? item.class_name),
  ).size;

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100">
      <header className="border-b border-white/10 bg-[#0b1220]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/exporter/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 text-xl text-teal-300 ring-1 ring-teal-300/20">
              ◈
            </div>

            <div>
              <p className="font-bold tracking-wide text-white">CargoShare</p>
              <p className="text-xs text-slate-400">AI Vision Studio</p>
            </div>
          </Link>

          <Link
            to="/exporter/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-teal-400/40 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/5 px-3 py-1.5 text-xs font-medium tracking-wide text-teal-300">
            <span className="h-2 w-2 rounded-full bg-teal-300" />
            POWERED BY YOLO
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            See your cargo
            <span className="block bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
              through AI.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Upload a cargo image to identify objects, inspect detection
            confidence, and view AI-generated bounding boxes.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-[#101827] p-5 shadow-2xl shadow-black/20 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">Image workspace</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Upload an image to begin analysis
                </p>
              </div>

              <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400">
                Max 10 MB
              </span>
            </div>

            <label
              htmlFor="cargo-image"
              className="group flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-[#0b1220] p-6 text-center transition hover:border-teal-300/60 hover:bg-teal-300/[0.03]"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Selected cargo preview"
                  className="max-h-72 w-full rounded-lg object-contain"
                />
              ) : (
                <>
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/10 text-3xl text-teal-300 transition group-hover:scale-105">
                    ↑
                  </div>

                  <p className="font-medium text-white">
                    Click to upload your image
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    JPG, PNG, or WEBP
                  </p>
                </>
              )}

              <input
                id="cargo-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={loading}
                className="sr-only"
              />
            </label>

            {selectedImage && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {selectedImage.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="text-sm text-slate-400 hover:text-white disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            )}

            {(fileError || error) && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
              >
                {fileError || error}
              </div>
            )}

            <button
              type="button"
              onClick={handleDetection}
              disabled={!selectedImage || loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-5 py-3.5 font-semibold text-slate-950 shadow-lg shadow-teal-500/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
                  Analyzing image...
                </>
              ) : (
                <>✦ Detect objects</>
              )}
            </button>

            {loading && (
              <p className="mt-3 text-center text-xs text-slate-500">
                The first request may take longer while the API wakes up.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#101827] p-5 shadow-2xl shadow-black/20 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">Analysis results</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Detected objects and model confidence
                </p>
              </div>

              {result && (
                <span className="shrink-0 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs text-teal-300">
                  Complete
                </span>
              )}
            </div>

            {!result && !loading && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-white/5 bg-[#0b1220] px-6 text-center">
                <div className="mb-4 text-4xl text-slate-600">⌘</div>
                <p className="font-medium text-slate-300">No analysis yet</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  Upload an image and run detection to see your results here.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-white/5 bg-[#0b1220]">
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-teal-300/20 border-t-teal-300" />
                <p className="mt-5 font-medium text-white">Processing image</p>
                <p className="mt-2 text-sm text-slate-500">
                  Waiting for the model response...
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-[#0b1220] p-4">
                    <p className="text-xs text-slate-500">Total detections</p>
                    <p className="mt-2 text-3xl font-bold text-teal-300">
                      {totalDetections}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0b1220] p-4">
                    <p className="text-xs text-slate-500">Unique classes</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {uniqueClasses}
                    </p>
                  </div>
                </div>

                {result.annotated_image && (
                  <div>
                    <p className="mb-3 text-sm font-medium text-slate-300">
                      Annotated image
                    </p>
                    <img
                      src={`data:image/jpeg;base64,${result.annotated_image}`}
                      alt="AI detection with bounding boxes"
                      className="max-h-80 w-full rounded-xl border border-white/10 bg-[#0b1220] object-contain"
                    />
                  </div>
                )}

                {totalDetections === 0 || detections.length === 0 ? (
                  <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4">
                    <p className="font-medium text-amber-200">
                      No objects detected
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Try a clearer image with cargo objects fully visible and
                      good lighting.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-200">
                      Detected objects
                    </h3>

                    <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                      {detections.map((item, index) => {
                        const confidence = Number(item.confidence);
                        const validConfidence = Number.isFinite(confidence)
                          ? Math.min(100, Math.max(0, confidence * 100))
                          : null;

                        return (
                          <div
                            key={`${item.class_id ?? item.class_name}-${index}`}
                            className="rounded-xl border border-white/10 bg-[#0b1220] p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-medium text-white">
                                  {item.class_name || "Unknown object"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Class ID: {item.class_id ?? "N/A"}
                                </p>
                              </div>

                              <span className="shrink-0 text-sm font-semibold text-teal-300">
                                {validConfidence === null
                                  ? "N/A"
                                  : `${validConfidence.toFixed(1)}%`}
                              </span>
                            </div>

                            {validConfidence !== null && (
                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400"
                                  style={{ width: `${validConfidence}%` }}
                                />
                              </div>
                            )}

                            {Array.isArray(item.box) && (
                              <div className="mt-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowCoordinates((previous) => !previous)
                                  }
                                  className="text-xs text-slate-400 transition hover:text-teal-300"
                                >
                                  {showCoordinates
                                    ? "Hide bounding-box coordinates"
                                    : "Show bounding-box coordinates"}
                                </button>

                                {showCoordinates && (
                                  <p className="mt-2 break-words text-xs text-slate-500">
                                    {item.box
                                      .map((value) => Number(value).toFixed(1))
                                      .join(", ")}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-teal-300/40 hover:text-white"
                >
                  Analyze another image
                </button>
              </div>
            )}
          </section>
        </div>

        <p className="mt-6 text-center text-xs leading-6 text-slate-500">
          AI predictions are estimates. Object detection does not independently
          verify cargo weight, dimensions, or shipping eligibility.
        </p>
      </main>
    </div>
  );
};

export default ImageDetection;
