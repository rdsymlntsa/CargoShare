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

  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      !containerNumber ||
      !origin ||
      !destination ||
      !departureDate ||
      !arrivalDate ||
      !totalWeightCapacity ||
      !availableWeightCapacity ||
      !totalVolumeCapacity ||
      !availableVolumeCapacity ||
      !pricePerKg
    ) {
      setFormError("Please fill in all fields.");
      return;
    }

    const totalWeight = Number(totalWeightCapacity);
    const availableWeight = Number(availableWeightCapacity);
    const totalVolume = Number(totalVolumeCapacity);
    const availableVolume = Number(availableVolumeCapacity);
    const price = Number(pricePerKg);

    if (totalWeight <= 0 || availableWeight <= 0) {
      setFormError("Weight capacities must be greater than 0.");
      return;
    }

    if (availableWeight > totalWeight) {
      setFormError(
        "Available weight capacity cannot exceed total weight capacity.",
      );
      return;
    }

    if (totalVolume <= 0 || availableVolume <= 0) {
      setFormError("Volume capacities must be greater than 0.");
      return;
    }

    if (availableVolume > totalVolume) {
      setFormError(
        "Available volume capacity cannot exceed total volume capacity.",
      );
      return;
    }

    if (price <= 0) {
      setFormError("Price per kg must be greater than 0.");
      return;
    }

    if (new Date(arrivalDate) <= new Date(departureDate)) {
      setFormError("Arrival date must be after departure date.");
      return;
    }

    const result = await dispatch(
      createContainer({
        containerNumber,
        origin,
        destination,
        departureDate,
        arrivalDate,
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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CargoShare</h1>

        <button
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
            Add a container and specify the cargo space you want to offer.
          </p>

          {(formError || error) && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Container Number
              </label>

              <input
                type="text"
                name="containerNumber"
                value={formData.containerNumber}
                onChange={handleChange}
                placeholder="Enter container number"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Origin
                </label>

                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="Enter origin"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Destination
                </label>

                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter destination"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Departure Date
                </label>

                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Arrival Date
                </label>

                <input
                  type="date"
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Weight Capacity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    Total Weight Capacity (kg)
                  </label>

                  <input
                    type="number"
                    name="totalWeightCapacity"
                    value={formData.totalWeightCapacity}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g. 20000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    Available Weight for CargoShare (kg)
                  </label>

                  <input
                    type="number"
                    name="availableWeightCapacity"
                    value={formData.availableWeightCapacity}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g. 11700"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={loading}
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
                  <label className="block font-medium text-gray-700 mb-2">
                    Total Volume Capacity
                  </label>

                  <input
                    type="number"
                    name="totalVolumeCapacity"
                    value={formData.totalVolumeCapacity}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g. 60"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    Available Volume for CargoShare
                  </label>

                  <input
                    type="number"
                    name="availableVolumeCapacity"
                    value={formData.availableVolumeCapacity}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g. 15"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Price per Kg (₹)
              </label>

              <input
                type="number"
                name="pricePerKg"
                value={formData.pricePerKg}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 50"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p>
                <span className="font-semibold">Note:</span> Total capacity
                represents the container's physical capacity. Available capacity
                represents the space you are offering to CargoShare users.
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
