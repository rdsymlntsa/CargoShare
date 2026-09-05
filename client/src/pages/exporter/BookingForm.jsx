import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api.js";

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [container, setContainer] = useState(null);
  const [formData, setFormData] = useState({
    requestedWeight: "",
    requestedVolume: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const requestedWeight = Number(formData.requestedWeight);
    const requestedVolume = Number(formData.requestedVolume);

    if (requestedWeight <= 0) {
      setError("Requested weight must be greater than 0");
      return;
    }

    if (requestedVolume < 0) {
      setError("Requested volume cannot be negative");
      return;
    }

    if (requestedWeight > container.availableWeightCapacity) {
      setError("Requested weight exceeds available capacity");
      return;
    }

    if (requestedVolume > container.availableVolumeCapacity) {
      setError("Requested volume exceeds available capacity");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/bookings", {
        containerId: id,
        requestedWeight,
        requestedVolume,
      });

      setSuccess("Booking request submitted successfully");

      setTimeout(() => {
        navigate("/exporter/bookings");
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading container...</p>
      </div>
    );
  }

  if (error && !container) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-red-600">{error}</p>

          <button
            onClick={() => navigate("/exporter/containers")}
            className="mt-5 rounded-lg bg-teal-600 px-5 py-2 font-medium text-white"
          >
            Back to Containers
          </button>
        </div>
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
            onClick={() => navigate(`/exporter/containers/${id}`)}
            className="rounded-lg bg-white px-4 py-2 font-medium text-teal-700"
          >
            Back
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-xl bg-white p-6 shadow sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Book Container Space
          </h2>

          <p className="mt-2 text-gray-600">Request space for your shipment.</p>

          <div className="mt-6 rounded-lg bg-gray-50 p-5">
            <h3 className="font-semibold text-gray-800">
              {container.containerNumber || "Container"}
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              {container.origin} → {container.destination}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Available Weight</p>
                <p className="font-semibold text-teal-700">
                  {container.availableWeightCapacity} kg
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Available Volume</p>
                <p className="font-semibold text-teal-700">
                  {container.availableVolumeCapacity}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-lg bg-green-100 px-4 py-3 text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Requested Weight (kg)
              </label>

              <input
                type="number"
                name="requestedWeight"
                value={formData.requestedWeight}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-600"
                placeholder="Enter required weight"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Requested Volume
              </label>

              <input
                type="number"
                name="requestedVolume"
                value={formData.requestedVolume}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-600"
                placeholder="Enter required volume"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || container.status !== "available"}
              className="w-full rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting ? "Submitting..." : "Submit Booking Request"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BookingForm;
