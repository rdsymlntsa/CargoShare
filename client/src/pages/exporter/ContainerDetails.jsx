import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getContainerById,
  clearContainerError,
  clearCurrentContainer,
} from "../../features/containers/containerSlice.js";

const ContainerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentContainer, loading, error } = useSelector(
    (state) => state.containers,
  );

  useEffect(() => {
    dispatch(getContainerById(id));

    return () => {
      dispatch(clearContainerError());
      dispatch(clearCurrentContainer());
    };
  }, [dispatch, id]);

  if (loading && !currentContainer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading container...</p>
      </div>
    );
  }

  if (error && !currentContainer) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-teal-700 px-6 py-4 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h1
              className="cursor-pointer text-2xl font-bold"
              onClick={() => navigate("/exporter/dashboard")}
            >
              CargoShare
            </h1>

            <button
              onClick={() => navigate("/exporter/containers")}
              className="rounded-lg bg-white px-4 py-2 font-medium text-teal-700 hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        </nav>

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="rounded-xl bg-red-100 p-6 text-red-600">{error}</div>
        </main>
      </div>
    );
  }

  if (!currentContainer) {
    return null;
  }

  const container = currentContainer;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-700 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1
            className="cursor-pointer text-2xl font-bold"
            onClick={() => navigate("/exporter/dashboard")}
          >
            CargoShare
          </h1>

          <button
            onClick={() => navigate("/exporter/containers")}
            className="rounded-lg bg-white px-4 py-2 font-medium text-teal-700 hover:bg-gray-100"
          >
            Back
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-xl bg-white p-6 shadow">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-gray-500">Container</p>

              <h2 className="mt-1 text-3xl font-bold text-gray-800">
                {container.containerNumber}
              </h2>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-medium capitalize ${
                container.status === "available"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {container.status}
            </span>
          </div>

          {/* Route */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Route</h3>

            <div className="mt-3 rounded-lg bg-gray-50 p-4">
              <p className="text-lg font-medium text-gray-800">
                {container.origin} → {container.destination}
              </p>
            </div>
          </div>

          {/* Schedule */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Schedule</h3>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Departure</p>

                <p className="mt-1 font-medium text-gray-800">
                  {new Date(container.departureDate).toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Arrival</p>

                <p className="mt-1 font-medium text-gray-800">
                  {new Date(container.arrivalDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Capacity</h3>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Available Weight</p>

                <p className="mt-1 text-xl font-semibold text-gray-800">
                  {container.availableWeightCapacity} kg
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  of {container.totalWeightCapacity} kg
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Available Volume</p>

                <p className="mt-1 text-xl font-semibold text-gray-800">
                  {container.availableVolumeCapacity} m³
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  of {container.totalVolumeCapacity} m³
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Pricing</h3>

            <div className="mt-3 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Price per kg</p>

              <p className="mt-1 text-xl font-semibold text-gray-800">
                ₹{container.pricePerKg}
              </p>
            </div>
          </div>

          {/* Provider */}
          {container.provider && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800">Provider</h3>

              <div className="mt-3 rounded-lg bg-gray-50 p-4">
                <p className="font-medium text-gray-800">
                  {container.provider.name}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {container.provider.email}
                </p>

                {container.provider.phone && (
                  <p className="mt-1 text-sm text-gray-600">
                    {container.provider.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Book */}
          <div className="mt-8 border-t pt-6">
            <button
              onClick={() =>
                navigate(`/exporter/containers/${container._id}/book`)
              }
              disabled={container.status !== "available"}
              className="w-full rounded-lg bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {container.status === "available"
                ? "Book Container"
                : "Container Not Available"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContainerDetails;
