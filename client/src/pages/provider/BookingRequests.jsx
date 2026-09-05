import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

const BookingRequests = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      setError("");

      const response = await api.get("/bookings/provider/requests");

      setBookings(response.data.bookings);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch booking requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (bookingId) => {
    try {
      setActionLoading(bookingId);

      await api.patch(`/bookings/${bookingId}/approve`);

      await fetchBookings();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to approve booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      setActionLoading(bookingId);

      await api.patch(`/bookings/${bookingId}/reject`);

      await fetchBookings();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reject booking");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading booking requests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-700 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1
            className="cursor-pointer text-2xl font-bold"
            onClick={() => navigate("/provider/dashboard")}
          >
            CargoShare
          </h1>

          <button
            onClick={() => navigate("/provider/dashboard")}
            className="rounded-lg bg-white px-4 py-2 font-medium text-teal-700 hover:bg-gray-100"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-800">Booking Requests</h2>

        <p className="mt-2 text-gray-600">
          Review booking requests from exporters.
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {bookings.length === 0 && !error && (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">No pending booking requests.</p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="rounded-xl bg-white p-6 shadow">
              <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-gray-500">Container</p>

                  <h3 className="text-xl font-bold text-gray-800">
                    {booking.container?.containerNumber || "Container"}
                  </h3>
                </div>

                <span className="w-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium capitalize text-yellow-700">
                  {booking.status}
                </span>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">Exporter</p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {booking.exporter?.name || "Unknown"}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {booking.exporter?.email}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {booking.exporter?.phone}
                  </p>
                </div>

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
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row">
                <button
                  onClick={() => handleApprove(booking._id)}
                  disabled={actionLoading === booking._id}
                  className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {actionLoading === booking._id ? "Processing..." : "Approve"}
                </button>

                <button
                  onClick={() => handleReject(booking._id)}
                  disabled={actionLoading === booking._id}
                  className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {actionLoading === booking._id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BookingRequests;
