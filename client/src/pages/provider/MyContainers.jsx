import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyContainers,
  clearContainerError,
} from "../../features/containers/containerSlice.js";

const MyContainers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { containers, loading, error } = useSelector(
    (state) => state.containers,
  );

  useEffect(() => {
    dispatch(getMyContainers());

    return () => {
      dispatch(clearContainerError());
    };
  }, [dispatch]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusClass = (status) => {
    if (status === "available") {
      return "bg-green-100 text-green-700";
    }

    if (status === "full") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "in-transit") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "delivered") {
      return "bg-gray-100 text-gray-700";
    }

    if (status === "cancelled") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Containers</h2>

            <p className="text-gray-600 mt-1">
              Manage the containers you have listed on CargoShare.
            </p>
          </div>

          <button
            onClick={() => navigate("/provider/containers/create")}
            className="bg-teal-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-teal-700"
          >
            + Create Container
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">Loading containers...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && containers.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              No containers listed
            </h3>

            <p className="text-gray-600 mt-2 mb-5">
              You haven't created any containers yet.
            </p>

            <button
              onClick={() => navigate("/provider/containers/create")}
              className="bg-teal-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-teal-700"
            >
              Create Your First Container
            </button>
          </div>
        )}

        {!loading && !error && containers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {containers.map((container) => (
              <div
                key={container._id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex justify-between items-start gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {container.containerNumber}
                    </h3>

                    <p className="text-gray-600 mt-1">
                      {container.origin} → {container.destination}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusClass(
                      container.status,
                    )}`}
                  >
                    {container.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Departure</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(container.departureDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Arrival</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(container.arrivalDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Total Weight</p>
                    <p className="font-medium text-gray-800">
                      {container.totalWeightCapacity} kg
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Available Weight</p>
                    <p className="font-medium text-gray-800">
                      {container.availableWeightCapacity} kg
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Total Volume</p>
                    <p className="font-medium text-gray-800">
                      {container.totalVolumeCapacity} m³
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Available Volume</p>
                    <p className="font-medium text-gray-800">
                      {container.availableVolumeCapacity} m³
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Price per kg</p>
                    <p className="font-medium text-gray-800">
                      ₹{container.pricePerKg}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/provider/containers/${container._id}`)
                  }
                  className="w-full mt-6 border border-teal-600 text-teal-600 py-3 rounded-lg font-medium hover:bg-teal-50"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyContainers;
