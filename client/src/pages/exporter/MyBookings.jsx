import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/");

        setBookings(response.data.bookings);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading bookings...</p>
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-800">My Bookings</h2>

        <p className="mt-2 text-gray-600">
          View and track your container booking requests.
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {bookings.length === 0 && !error && (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">You haven't made any bookings yet.</p>

            <button
              onClick={() => navigate("/exporter/containers")}
              className="mt-5 rounded-lg bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700"
            >
              Browse Containers
            </button>
          </div>
        )}

        <div className="mt-8 space-y-5">
          {bookings.map((booking) => (
            <div key={booking._id} className="rounded-xl bg-white p-6 shadow">
              <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-gray-500">Container</p>

                  <h3 className="text-xl font-bold text-gray-800">
                    {booking.container?.containerNumber || "Container"}
                  </h3>
                </div>

                <span
                  className={`w-fit rounded-full px-4 py-2 text-sm font-medium capitalize ${
                    booking.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : booking.status === "cancelled"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {booking.container?.origin} →{" "}
                    {booking.container?.destination}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Requested Weight</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {booking.requestedWeight} kg
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Requested Volume</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {booking.requestedVolume}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Booking Date</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {booking.container?._id && (
                <button
                  onClick={() =>
                    navigate(`/exporter/containers/${booking.container._id}`)
                  }
                  className="mt-6 rounded-lg border border-teal-600 px-5 py-2 font-medium text-teal-700 hover:bg-teal-50"
                >
                  View Container
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyBookings;
