import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api.js";

const ContainerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContainer = async () => {
      try {
        const response = await api.get(`/containers/${id}`);

        setContainer(response.data.container);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch container");
      } finally {
        setLoading(false);
      }
    };

    fetchContainer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading container...</p>
      </div>
    );
  }

  if (error || !container) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-red-600">{error || "Container not found"}</p>

          <button
            onClick={() => navigate("/exporter/containers")}
            className="mt-5 rounded-lg bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700"
          >
            Back to Containers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
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
            Back to Containers
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-xl bg-white p-8 shadow">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-gray-500">Container</p>

              <h2 className="mt-1 text-3xl font-bold text-gray-800">
                {container.containerNumber || "Container"}
              </h2>
            </div>

            <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-medium capitalize text-green-700">
              {container.status}
            </span>
          </div>

          {/* Route */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800">
              Shipment Route
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Origin</p>
                <p className="mt-1 text-lg font-semibold text-gray-800">
                  {container.origin}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Destination</p>
                <p className="mt-1 text-lg font-semibold text-gray-800">
                  {container.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800">Schedule</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Departure</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {new Date(container.departureDate).toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Arrival</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {container.arrivalDate
                    ? new Date(container.arrivalDate).toLocaleString()
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800">
              Available Capacity
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Available Weight</p>

                <p className="mt-1 text-2xl font-bold text-teal-700">
                  {container.availableWeightCapacity} kg
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Total: {container.totalWeightCapacity} kg
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Available Volume</p>

                <p className="mt-1 text-2xl font-bold text-teal-700">
                  {container.availableVolumeCapacity}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Total: {container.totalVolumeCapacity}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800">Pricing</h3>

            <div className="mt-4 rounded-lg bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Price per kg</p>

              <p className="mt-1 text-3xl font-bold text-teal-700">
                ₹{container.pricePerKg}
              </p>
            </div>
          </div>

          {/* Provider */}
          {container.provider && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800">Provider</h3>

              <div className="mt-4 rounded-lg bg-gray-50 p-5">
                <p className="font-semibold text-gray-800">
                  {container.provider.name}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {container.provider.email}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {container.provider.phone}
                </p>
              </div>
            </div>
          )}

          {/* Book button */}
          <div className="mt-10 border-t pt-6">
            <button
              onClick={() =>
                navigate(`/exporter/containers/${container._id}/book`)
              }
              disabled={container.status !== "available"}
              className="w-full rounded-lg bg-teal-600 px-6 py-3 text-lg font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {container.status === "available"
                ? "Book Space"
                : "Container Not Available"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContainerDetails;
