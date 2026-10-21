import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { createTrip, clearTripError } from "../../features/trips/tripSlice.js";

const initialFormData = {
  originName: "",
  originAddress: "",
  originLongitude: "",
  originLatitude: "",
  destinationName: "",
  destinationAddress: "",
  destinationLongitude: "",
  destinationLatitude: "",
  departureTime: "",
  spareCapacityWeightKg: "",
  spareCapacityVolumeM3: "",
  maxDetourKm: "2",
  maxDetourMinutes: "5",
};

const CreateTrip = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.trips);

  const [formData, setFormData] = useState(initialFormData);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      dispatch(clearTripError());
    }

    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const departure = new Date(formData.departureTime);

    if (Number.isNaN(departure.getTime()) || departure <= new Date()) {
      setSuccessMessage("");
      return;
    }

    const coordinateFields = [
      formData.originLongitude,
      formData.originLatitude,
      formData.destinationLongitude,
      formData.destinationLatitude,
    ];

    if (coordinateFields.some((value) => value.trim() === "")) {
      setSuccessMessage("");
      return;
    }

    const [
      originLongitude,
      originLatitude,
      destinationLongitude,
      destinationLatitude,
    ] = coordinateFields.map(Number);

    if (
      !coordinateFields.every((value) => Number.isFinite(Number(value))) ||
      originLongitude < -180 ||
      originLongitude > 180 ||
      destinationLongitude < -180 ||
      destinationLongitude > 180 ||
      originLatitude < -90 ||
      originLatitude > 90 ||
      destinationLatitude < -90 ||
      destinationLatitude > 90
    ) {
      setSuccessMessage("");
      return;
    }

    const tripData = {
      origin: {
        name: formData.originName.trim(),
        address: formData.originAddress.trim(),
        coordinates: {
          type: "Point",
          coordinates: [originLongitude, originLatitude],
        },
      },
      destination: {
        name: formData.destinationName.trim(),
        address: formData.destinationAddress.trim(),
        coordinates: {
          type: "Point",
          coordinates: [destinationLongitude, destinationLatitude],
        },
      },
      departureTime: departure.toISOString(),
      spareCapacityWeightKg: Number(formData.spareCapacityWeightKg),
      spareCapacityVolumeM3: Number(formData.spareCapacityVolumeM3),
      maxDetourKm: Number(formData.maxDetourKm),
      maxDetourMinutes: Number(formData.maxDetourMinutes),
    };

    const result = await dispatch(createTrip(tripData));

    if (createTrip.fulfilled.match(result)) {
      setFormData(initialFormData);
      setSuccessMessage("Trip posted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          &larr; Go back
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Post a Trip</h1>
          <p className="mt-2 text-sm text-gray-600">
            Share your route and spare capacity to find pickup jobs along your
            journey.
          </p>

          {error && (
            <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-8">
            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Starting point
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="originName"
                  value={formData.originName}
                  onChange={handleChange}
                  placeholder="Origin name"
                  required
                  className="rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600 sm:col-span-2"
                />

                <input
                  name="originAddress"
                  value={formData.originAddress}
                  onChange={handleChange}
                  placeholder="Full address"
                  className="rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600 sm:col-span-2"
                />

                <input
                  name="originLongitude"
                  type="number"
                  step="any"
                  value={formData.originLongitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  required
                  className="rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
                />

                <input
                  name="originLatitude"
                  type="number"
                  step="any"
                  value={formData.originLatitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  required
                  className="rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
                />
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Destination
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="destinationName"
                  value={formData.destinationName}
                  onChange={handleChange}
                  placeholder="Destination name"
                  required
                  className="rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600 sm:col-span-2"
                />

                <input
                  name="destinationAddress"
                  value={formData.destinationAddress}
                  onChange={handleChange}
                  placeholder="Full address"
                  className="rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600 sm:col-span-2"
                />

                <input
                  name="destinationLongitude"
                  type="number"
                  step="any"
                  value={formData.destinationLongitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  required
                  className="rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
                />

                <input
                  name="destinationLatitude"
                  type="number"
                  step="any"
                  value={formData.destinationLatitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  required
                  className="rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Enter decimal coordinates in longitude, latitude order. We can
                add a map-based location picker later.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Departure and spare capacity
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                  Departure date and time
                  <input
                    name="departureTime"
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={handleChange}
                    required
                    min={new Date(Date.now() + 60000)
                      .toISOString()
                      .slice(0, 16)}
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Spare weight (kg)
                  <input
                    name="spareCapacityWeightKg"
                    type="number"
                    min="0.1"
                    step="any"
                    value={formData.spareCapacityWeightKg}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 100"
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Spare volume (m³)
                  <input
                    name="spareCapacityVolumeM3"
                    type="number"
                    min="0.001"
                    step="any"
                    value={formData.spareCapacityVolumeM3}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 2.5"
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
                  />
                </label>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Acceptable detour
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Maximum extra distance (km)
                  <input
                    name="maxDetourKm"
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={formData.maxDetourKm}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Maximum extra time (minutes)
                  <input
                    name="maxDetourMinutes"
                    type="number"
                    min="0"
                    max="120"
                    step="any"
                    value={formData.maxDetourMinutes}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
                  />
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Posting trip..." : "Post Trip"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
