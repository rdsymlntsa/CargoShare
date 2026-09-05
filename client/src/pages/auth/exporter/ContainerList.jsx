import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const ContainerList = () => {
  const navigate = useNavigate();

  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const response = await api.get("/containers");

        setContainers(response.data.containers);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch containers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContainers();
  }, []);

  if (loading) {
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
            className="rounded-lg bg-white px-4 py-2 font-medium text-teal-700"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Available Containers
        </h2>

        <p className="mt-2 text-gray-600">
          Find containers with available space for your shipment.
        </p>

        {error && (
          <p className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-red-600">
            {error}
          </p>
        )}

        {containers.length === 0 && !error && (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">
              No containers are currently available.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {containers.map((container) => (
            <div
              key={container._id}
              className="rounded-xl bg-white p-6 shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  {container.containerNumber || "Container"}
                </h3>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {container.status}
                </span>
              </div>

              <div className="mt-5 space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">From:</span>{" "}
                  {container.origin}
                </p>

                <p>
                  <span className="font-medium text-gray-800">To:</span>{" "}
                  {container.destination}
                </p>

                <p>
                  <span className="font-medium text-gray-800">
                    Available Weight:
                  </span>{" "}
                  {container.availableWeightCapacity} kg
                </p>

                <p>
                  <span className="font-medium text-gray-800">
                    Available Volume:
                  </span>{" "}
                  {container.availableVolumeCapacity}
                </p>

                <p>
                  <span className="font-medium text-gray-800">
                    Price:
                  </span>{" "}
                  ₹{container.pricePerKg} / kg
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(`/exporter/containers/${container._id}`)
                }
                className="mt-6 w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
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