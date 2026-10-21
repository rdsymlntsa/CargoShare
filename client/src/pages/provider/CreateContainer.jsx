import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { createContainer } from "../../features/containers/containerSlice.js";

const CreateContainer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.containers);

  const [formData, setFormData] = useState({
    containerNumber: "",
    origin: "",
    destination: "",
    departureDate: "",
    arrivalDate: "",
    totalWeightCapacity: "",
    availableWeightCapacity: "",
    totalVolumeCapacity: "",
    availableVolumeCapacity: "",
    pricePerKg: "",
  });

  const [intermediateStops, setIntermediateStops] = useState([]);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStopChange = (index, field, value) => {
    setIntermediateStops((prev) =>
      prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)),
    );
  };

  const addStop = () => {
    setIntermediateStops((prev) => [
      ...prev,
      {
        name: "",
        expectedArrival: "",
        expectedDeparture: "",
      },
    ]);
  };

  const removeStop = (index) => {
    setIntermediateStops((prev) => prev.filter((_, i) => i !== index));
  };

  const toISOStringOrNull = (value) => {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const {
      containerNumber,
      origin,
      destination,
      departureDate,
      arrivalDate,
      totalWeightCapacity,
      availableWeightCapacity,
      totalVolumeCapacity,
      availableVolumeCapacity,
      pricePerKg,
    } = formData;

    if (
      !containerNumber.trim() ||
      !origin.trim() ||
      !destination.trim() ||
      !departureDate ||
      !arrivalDate ||
      !totalWeightCapacity ||
      !availableWeightCapacity ||
      !totalVolumeCapacity ||
      !availableVolumeCapacity ||
      !pricePerKg
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const departure = new Date(departureDate);
    const arrival = new Date(arrivalDate);

    if (
      Number.isNaN(departure.getTime()) ||
      Number.isNaN(arrival.getTime()) ||
      arrival <= departure
    ) {
      setFormError(
        "Arrival date and time must be after departure date and time.",
      );
      return;
    }

    const cleanedStops = intermediateStops.map((stop) => ({
      ...stop,
      name: stop.name.trim(),
    }));

    if (cleanedStops.some((stop) => !stop.name)) {
      setFormError(
        "Please fill in every intermediate stop or remove empty stops.",
      );
      return;
    }

    for (const stop of cleanedStops) {
      const stopArrival = stop.expectedArrival
        ? new Date(stop.expectedArrival)
        : null;

      const stopDeparture = stop.expectedDeparture
        ? new Date(stop.expectedDeparture)
        : null;

      if (
        (stopArrival && Number.isNaN(stopArrival.getTime())) ||
        (stopDeparture && Number.isNaN(stopDeparture.getTime()))
      ) {
        setFormError(`Please enter valid schedule times for ${stop.name}.`);
        return;
      }

      if (stopArrival && stopDeparture && stopDeparture < stopArrival) {
        setFormError(
          `Departure time at ${stop.name} cannot be before its arrival time.`,
        );
        return;
      }

      if (stopArrival && (stopArrival < departure || stopArrival > arrival)) {
        setFormError(
          `Expected arrival at ${stop.name} must be within the journey schedule.`,
        );
        return;
      }

      if (
        stopDeparture &&
        (stopDeparture < departure || stopDeparture > arrival)
      ) {
        setFormError(
          `Expected departure from ${stop.name} must be within the journey schedule.`,
        );
        return;
      }
    }

    const route = [
      origin.trim(),
      ...cleanedStops.map((stop) => stop.name),
      destination.trim(),
    ];

    const normalizedRoute = route.map((stop) => stop.toLowerCase());

    if (new Set(normalizedRoute).size !== normalizedRoute.length) {
      setFormError("A location cannot appear more than once in the route.");
      return;
    }

    const totalWeight = Number(totalWeightCapacity);
    const availableWeight = Number(availableWeightCapacity);
    const totalVolume = Number(totalVolumeCapacity);
    const availableVolume = Number(availableVolumeCapacity);
    const price = Number(pricePerKg);

    if (
      !Number.isFinite(totalWeight) ||
      !Number.isFinite(availableWeight) ||
      totalWeight <= 0 ||
      availableWeight <= 0
    ) {
      setFormError("Weight capacities must be valid numbers greater than 0.");
      return;
    }

    if (availableWeight > totalWeight) {
      setFormError(
        "Available weight capacity cannot exceed total weight capacity.",
      );
      return;
    }

    if (
      !Number.isFinite(totalVolume) ||
      !Number.isFinite(availableVolume) ||
      totalVolume <= 0 ||
      availableVolume <= 0
    ) {
      setFormError("Volume capacities must be valid numbers greater than 0.");
      return;
    }

    if (availableVolume > totalVolume) {
      setFormError(
        "Available volume capacity cannot exceed total volume capacity.",
      );
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Price per kg must be a valid number greater than 0.");
      return;
    }

    const result = await dispatch(
      createContainer({
        containerNumber: containerNumber.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
        intermediateStops: cleanedStops.map((stop) => ({
          name: stop.name,
          expectedArrival: toISOStringOrNull(stop.expectedArrival),
          expectedDeparture: toISOStringOrNull(stop.expectedDeparture),
        })),
        departureDate: departure.toISOString(),
        arrivalDate: arrival.toISOString(),
        totalWeightCapacity: totalWeight,
        availableWeightCapacity: availableWeight,
        totalVolumeCapacity: totalVolume,
        availableVolumeCapacity: availableVolume,
        pricePerKg: price,
      }),
    );

    if (createContainer.fulfilled.match(result)) {
      navigate("/provider/containers");
    }
  };

  const routePreview = [
    formData.origin.trim(),
    ...intermediateStops.map((stop) => stop.name.trim()),
    formData.destination.trim(),
  ]
    .filter(Boolean)
    .join(" → ");

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50";

  const labelClass = "block font-medium text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CargoShare</h1>

        <button
          type="button"
          onClick={() => navigate("/provider/dashboard")}
          className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium"
        >
          Dashboard
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Container</h2>

          <p className="text-gray-600 mt-1 mb-6">
            Add your container, route, schedule, and the cargo space you want to
            offer.
          </p>

          {(formError || error) && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Container Number</label>
              <input
                type="text"
                name="containerNumber"
                value={formData.containerNumber}
                onChange={handleChange}
                placeholder="Enter container number"
                required
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Origin</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="Enter origin"
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter final destination"
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Intermediate Stops
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Add stops in travel order. Stop schedules are optional.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addStop}
                  disabled={loading}
                  className="self-start bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-medium hover:bg-teal-100 disabled:opacity-50"
                >
                  + Add Stop
                </button>
              </div>

              {intermediateStops.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No intermediate stops added. The container will follow a
                  direct route.
                </p>
              ) : (
                <div className="space-y-5">
                  {intermediateStops.map((stop, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-gray-700">
                          Stop {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          disabled={loading}
                          aria-label={`Remove stop ${index + 1}`}
                          className="text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>

                      <div>
                        <label className={labelClass}>Location Name</label>
                        <input
                          type="text"
                          value={stop.name}
                          onChange={(e) =>
                            handleStopChange(index, "name", e.target.value)
                          }
                          placeholder={`Enter stop ${index + 1}`}
                          required
                          disabled={loading}
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Expected Arrival (optional)
                          </label>
                          <input
                            type="datetime-local"
                            value={stop.expectedArrival}
                            onChange={(e) =>
                              handleStopChange(
                                index,
                                "expectedArrival",
                                e.target.value,
                              )
                            }
                            disabled={loading}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Expected Departure (optional)
                          </label>
                          <input
                            type="datetime-local"
                            value={stop.expectedDeparture}
                            onChange={(e) =>
                              handleStopChange(
                                index,
                                "expectedDeparture",
                                e.target.value,
                              )
                            }
                            disabled={loading}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {routePreview && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Route Preview
                  </p>
                  <p className="text-sm text-gray-600 break-words">
                    {routePreview}
                  </p>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-gray-800">Journey Schedule</h3>

              <p className="text-sm text-gray-500">
                Both dates and times are required. Arrival must be later than
                departure.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>
                    Departure Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Arrival Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    name="arrivalDate"
                    value={formData.arrivalDate}
                    onChange={handleChange}
                    required
                    min={formData.departureDate || undefined}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Weight Capacity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>
                    Total Weight Capacity (kg)
                  </label>
                  <input
                    type="number"
                    name="totalWeightCapacity"
                    value={formData.totalWeightCapacity}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 20000"
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Available Weight for CargoShare (kg)
                  </label>
                  <input
                    type="number"
                    name="availableWeightCapacity"
                    value={formData.availableWeightCapacity}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 11700"
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Volume Capacity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Total Volume Capacity</label>
                  <input
                    type="number"
                    name="totalVolumeCapacity"
                    value={formData.totalVolumeCapacity}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 60"
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Available Volume for CargoShare
                  </label>
                  <input
                    type="number"
                    name="availableVolumeCapacity"
                    value={formData.availableVolumeCapacity}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 15"
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Price per Kg (₹)</label>
              <input
                type="number"
                name="pricePerKg"
                value={formData.pricePerKg}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="e.g. 50"
                required
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p>
                <span className="font-semibold">Note:</span> Total capacity
                represents the container&apos;s physical capacity. Available
                capacity represents the space offered to CargoShare users. Each
                route segment will initially receive this offered capacity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate("/provider/dashboard")}
                disabled={loading}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Container"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateContainer;
