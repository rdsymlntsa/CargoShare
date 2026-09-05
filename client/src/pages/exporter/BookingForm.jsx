import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getContainerById,
  clearContainerError,
  clearCurrentContainer,
} from "../../features/containers/containerSlice.js";

import { createBooking } from "../../features/bookings/bookingSlice.js";

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentContainer,
    loading: containerLoading,
    error: containerError,
  } = useSelector((state) => state.containers);

  const { loading: bookingLoading, error: bookingError } = useSelector(
    (state) => state.bookings,
  );

  const [requestedWeight, setRequestedWeight] = useState("");
  const [requestedVolume, setRequestedVolume] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(getContainerById(id));

    return () => {
      dispatch(clearContainerError());
      dispatch(clearCurrentContainer());
    };
  }, [dispatch, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!currentContainer) {
      return;
    }

    const weight = Number(requestedWeight);
    const volume = Number(requestedVolume);

    if (!requestedWeight || weight <= 0) {
      setFormError("Please enter a valid requested weight.");
      return;
    }

    if (requestedVolume === "" || volume < 0) {
      setFormError("Please enter a valid requested volume.");
      return;
    }

    if (weight > currentContainer.availableWeightCapacity) {
      setFormError(
        `Requested weight exceeds available capacity of ${currentContainer.availableWeightCapacity} kg.`,
      );
      return;
    }

    if (volume > currentContainer.availableVolumeCapacity) {
      setFormError(
        `Requested volume exceeds available capacity of ${currentContainer.availableVolumeCapacity}.`,
      );
      return;
    }

    const result = await dispatch(
      createBooking({
        containerId: id,
        requestedWeight: weight,
        requestedVolume: volume,
      }),
    );

    if (createBooking.fulfilled.match(result)) {
      navigate("/exporter/bookings");
    }
  };

  if (containerLoading && !currentContainer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading container...</p>
      </div>
    );
  }

  if (containerError && !currentContainer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{containerError}</p>

          <button
            onClick={() => navigate("/exporter/containers")}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            Back to Containers
          </button>
        </div>
      </div>
    );
  }

  if (!currentContainer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CargoShare</h1>

        <button
          onClick={() => navigate("/exporter/containers")}
          className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium"
        >
          Back
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-2">Book Container</h2>

          <p className="text-gray-600 mb-6">
            Request cargo space in container{" "}
            <span className="font-semibold">
              {currentContainer.containerNumber}
            </span>
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Container Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p>
                <span className="font-medium">Route:</span>{" "}
                {currentContainer.origin} → {currentContainer.destination}
              </p>

              <p>
                <span className="font-medium">Price:</span> ₹
                {currentContainer.pricePerKg} / kg
              </p>

              <p>
                <span className="font-medium">Available Weight:</span>{" "}
                {currentContainer.availableWeightCapacity} kg
              </p>

              <p>
                <span className="font-medium">Available Volume:</span>{" "}
                {currentContainer.availableVolumeCapacity}
              </p>

              <p>
                <span className="font-medium">Status:</span>{" "}
                {currentContainer.status}
              </p>
            </div>
          </div>

          {bookingError && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
              {bookingError}
            </div>
          )}

          {formError && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium mb-2">
                Requested Weight (kg)
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={requestedWeight}
                onChange={(e) => setRequestedWeight(e.target.value)}
                placeholder="Enter required weight"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={bookingLoading}
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Requested Volume</label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={requestedVolume}
                onChange={(e) => setRequestedVolume(e.target.value)}
                placeholder="Enter required volume"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={bookingLoading}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(`/exporter/containers/${id}`)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
                disabled={bookingLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={bookingLoading}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? "Submitting..." : "Submit Booking"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BookingForm;
