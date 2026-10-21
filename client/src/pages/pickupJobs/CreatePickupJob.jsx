import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  createPickupJob,
  clearPickupJobError,
  clearVerificationCodes,
} from "../../features/pickupJobs/pickupJobSlice.js";

import { getMyBookings } from "../../features/bookings/bookingSlice.js";

const initialFormData = {
  containerBooking: "",
  pickupName: "",
  pickupAddress: "",
  pickupLongitude: "",
  pickupLatitude: "",
  dropName: "",
  dropAddress: "",
  dropLongitude: "",
  dropLatitude: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  pickupWindowStart: "",
  pickupWindowEnd: "",
  price: "",
};

const CreatePickupJob = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, verificationCodes } = useSelector(
    (state) => state.pickupJobs,
  );

  const { bookings } = useSelector((state) => state.bookings);

  const [formData, setFormData] = useState(initialFormData);
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(getMyBookings());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearPickupJobError());
      dispatch(clearVerificationCodes());
    };
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setLocalError("");
    setSuccessMessage("");

    if (error) {
      dispatch(clearPickupJobError());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    setSuccessMessage("");

    const start = new Date(formData.pickupWindowStart);
    const end = new Date(formData.pickupWindowEnd);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start <= new Date() ||
      end <= start
    ) {
      setLocalError(
        "Choose a future pickup start time and an end time after the start.",
      );
      return;
    }

    const coordinateFields = [
      formData.pickupLongitude,
      formData.pickupLatitude,
      formData.dropLongitude,
      formData.dropLatitude,
    ];

    if (coordinateFields.some((value) => value.trim() === "")) {
      setLocalError("Enter coordinates for both locations.");
      return;
    }

    const [pickupLongitude, pickupLatitude, dropLongitude, dropLatitude] =
      coordinateFields.map(Number);

    if (
      !coordinateFields.every((value) => Number.isFinite(Number(value))) ||
      pickupLongitude < -180 ||
      pickupLongitude > 180 ||
      dropLongitude < -180 ||
      dropLongitude > 180 ||
      pickupLatitude < -90 ||
      pickupLatitude > 90 ||
      dropLatitude < -90 ||
      dropLatitude > 90
    ) {
      setLocalError("Enter valid longitude and latitude values.");
      return;
    }

    const numericFields = [
      Number(formData.weightKg),
      Number(formData.lengthCm),
      Number(formData.widthCm),
      Number(formData.heightCm),
      Number(formData.price),
    ];

    if (
      !numericFields.every(Number.isFinite) ||
      numericFields[0] <= 0 ||
      numericFields[1] <= 0 ||
      numericFields[2] <= 0 ||
      numericFields[3] <= 0 ||
      numericFields[4] < 0
    ) {
      setLocalError(
        "Weight and dimensions must be positive. Price cannot be negative.",
      );
      return;
    }

    const jobData = {
      ...(formData.containerBooking
        ? { containerBooking: formData.containerBooking }
        : {}),
      pickupLocation: {
        name: formData.pickupName.trim(),
        address: formData.pickupAddress.trim(),
        coordinates: {
          type: "Point",
          coordinates: [pickupLongitude, pickupLatitude],
        },
      },
      dropLocation: {
        name: formData.dropName.trim(),
        address: formData.dropAddress.trim(),
        coordinates: {
          type: "Point",
          coordinates: [dropLongitude, dropLatitude],
        },
      },
      weightKg: numericFields[0],
      lengthCm: numericFields[1],
      widthCm: numericFields[2],
      heightCm: numericFields[3],
      pickupWindowStart: start.toISOString(),
      pickupWindowEnd: end.toISOString(),
      price: numericFields[4],
    };

    const result = await dispatch(createPickupJob(jobData));

    if (createPickupJob.fulfilled.match(result)) {
      setFormData(initialFormData);
      setSuccessMessage("Pickup job created successfully.");
    }
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          &larr; Go back
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Post a Pickup Job
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Find someone travelling your way to transport your goods to a
            consolidation depot.
          </p>

          {(error || localError) && (
            <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {localError || error}
            </p>
          )}

          {successMessage && (
            <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </p>
          )}

          {verificationCodes && (
            <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <h2 className="font-semibold text-amber-900">
                Save your verification codes
              </h2>

              <p className="mt-1 text-sm text-amber-800">
                Save these codes securely. They are shown after creation and
                should not be shared publicly.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-sm text-gray-600">Pickup code</p>
                  <p className="mt-1 text-xl font-bold tracking-widest text-gray-900">
                    {verificationCodes.pickupCode}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-sm text-gray-600">Delivery code</p>
                  <p className="mt-1 text-xl font-bold tracking-widest text-gray-900">
                    {verificationCodes.deliveryCode}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const text = `CargoShare verification codes\nPickup code: ${verificationCodes.pickupCode}\nDelivery code: ${verificationCodes.deliveryCode}`;
                  navigator.clipboard.writeText(text);
                }}
                className="mt-4 rounded-lg border border-amber-400 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
              >
                Copy codes
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-gray-800">
                Link to a CargoShare booking (optional)
              </h2>

              <select
                name="containerBooking"
                value={formData.containerBooking}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Independent pickup job</option>

                {bookings
                  .filter((booking) =>
                    ["pending", "approved"].includes(booking.status),
                  )
                  .map((booking) => (
                    <option key={booking._id} value={booking._id}>
                      Booking {booking._id} — {booking.status}
                    </option>
                  ))}
              </select>

              <p className="mt-2 text-xs text-gray-500">
                Leave this empty if the pickup job is not linked to an existing
                shipment booking.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Pickup location
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                  Location name
                  <input
                    name="pickupName"
                    value={formData.pickupName}
                    onChange={handleChange}
                    required
                    placeholder="Workshop or collection point"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                  Address
                  <input
                    name="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    placeholder="Full pickup address"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Longitude
                  <input
                    name="pickupLongitude"
                    type="number"
                    step="any"
                    value={formData.pickupLongitude}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Latitude
                  <input
                    name="pickupLatitude"
                    type="number"
                    step="any"
                    value={formData.pickupLatitude}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Drop-off location
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                  Location name
                  <input
                    name="dropName"
                    value={formData.dropName}
                    onChange={handleChange}
                    required
                    placeholder="Consolidation depot"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                  Address
                  <input
                    name="dropAddress"
                    value={formData.dropAddress}
                    onChange={handleChange}
                    placeholder="Full drop-off address"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Longitude
                  <input
                    name="dropLongitude"
                    type="number"
                    step="any"
                    value={formData.dropLongitude}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Latitude
                  <input
                    name="dropLatitude"
                    type="number"
                    step="any"
                    value={formData.dropLatitude}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Coordinates must be decimal longitude and latitude values. We'll
                add a map picker after the core workflow works.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Package details
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Weight (kg)
                  <input
                    name="weightKg"
                    type="number"
                    min="0.1"
                    step="any"
                    value={formData.weightKg}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Length (cm)
                  <input
                    name="lengthCm"
                    type="number"
                    min="1"
                    step="any"
                    value={formData.lengthCm}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Width (cm)
                  <input
                    name="widthCm"
                    type="number"
                    min="1"
                    step="any"
                    value={formData.widthCm}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Height (cm)
                  <input
                    name="heightCm"
                    type="number"
                    min="1"
                    step="any"
                    value={formData.heightCm}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                  Payment offered (₹)
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="any"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Pickup time window
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Available from
                  <input
                    name="pickupWindowStart"
                    type="datetime-local"
                    value={formData.pickupWindowStart}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Available until
                  <input
                    name="pickupWindowEnd"
                    type="datetime-local"
                    value={formData.pickupWindowEnd}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating pickup job..." : "Post Pickup Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePickupJob;
