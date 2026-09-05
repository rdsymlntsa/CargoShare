import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getContainers,
  clearContainerError,
} from "../../features/containers/containerSlice.js";

const ContainerList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { containers, loading, error } = useSelector(
    (state) => state.containers,
  );

  useEffect(() => {
    dispatch(getContainers());

    return () => {
      dispatch(clearContainerError());
    };
  }, [dispatch]);

  if (loading && containers.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading containers...</p>
      </div>
    );
  }

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
            onClick={() => navigate("/exporter/dashboard")}
            className="rounded-lg bg-white px-4 py-2 font-medium text-teal-700 hover:bg-gray-100"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Available Containers
        </h2>

        <p className="mt-2 text-gray-600">
          Browse containers available for booking.
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {!error && containers.length === 0 && (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">
              No containers are currently available.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {containers.map((container) => (
            <div key={container._id} className="rounded-xl bg-white p-6 shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Container</p>

                  <h3 className="mt-1 text-xl font-bold text-gray-800">
                    {container.containerNumber}
                  </h3>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium capitalize text-green-700">
                  {container.status}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Route</p>

                  <p className="font-medium text-gray-800">
                    {container.origin} → {container.destination}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Available Weight</p>

                  <p className="font-medium text-gray-800">
                    {container.availableWeightCapacity} kg
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Available Volume</p>

                  <p className="font-medium text-gray-800">
                    {container.availableVolumeCapacity} m³
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Price</p>

                  <p className="font-medium text-gray-800">
                    ₹{container.pricePerKg} / kg
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate(`/exporter/containers/${container._id}`)
                }
                className="mt-6 w-full rounded-lg bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ContainerList;
