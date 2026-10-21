import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProviderBookingHistory,
  clearBookingError,
} from "../../features/bookings/bookingSlice";

const formatDate = (date) => {
  if (!date) return "Not specified";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "Not specified";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCheckpoints = (container) => {
  if (!container) return [];

  const intermediateStops = container.intermediateStops || [];

  return [
    { name: container.origin, type: "Origin" },
    ...intermediateStops.map((stop) => ({
      name: typeof stop === "string" ? stop : stop.name,
      type: "Intermediate Stop",
      expectedArrival: typeof stop === "string" ? null : stop.expectedArrival,
      expectedDeparture:
        typeof stop === "string" ? null : stop.expectedDeparture,
    })),
    { name: container.destination, type: "Destination" },
  ];
};

const getCoveredSegments = (booking, checkpoints) => {
  const container = booking.container;

  if (!container?.segments?.length || !booking.pickup || !booking.dropoff) {
    return [];
  }

  const pickupIndex = checkpoints.findIndex(
    (point) => point.name === booking.pickup,
  );

  const dropoffIndex = checkpoints.findIndex(
    (point) => point.name === booking.dropoff,
  );

  if (pickupIndex < 0 || dropoffIndex <= pickupIndex) {
    return [];
  }

  return container.segments.slice(pickupIndex, dropoffIndex);
};

const BookingHistory = () => {
  const dispatch = useDispatch();

  const { bookings, loading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getProviderBookingHistory());

    return () => {
      dispatch(clearBookingError());
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading booking history...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        No booking history found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">
          Booking History
        </h1>

        <div className="space-y-6">
          {bookings.map((booking) => {
            const container = booking.container;
            const checkpoints = getCheckpoints(container);
            const coveredSegments = getCoveredSegments(booking, checkpoints);

            return (
              <div key={booking._id} className="rounded-xl bg-white p-6 shadow">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Container: {container?.containerNumber || "N/A"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Booking ID: {booking._id}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
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

                <div className="mb-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-semibold text-gray-700">
                      Exporter Details
                    </h3>

                    <p className="text-gray-600">
                      Name: {booking.exporter?.name || "N/A"}
                    </p>

                    <p className="break-words text-gray-600">
                      Email: {booking.exporter?.email || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-semibold text-gray-700">
                      Booking Details
                    </h3>

                    <p className="text-gray-600">
                      Pickup: {booking.pickup || "Not available"}
                    </p>

                    <p className="text-gray-600">
                      Drop-off: {booking.dropoff || "Not available"}
                    </p>

                    <p className="text-gray-600">
                      Requested Weight: {booking.requestedWeight} kg
                    </p>

                    <p className="text-gray-600">
                      Requested Volume: {booking.requestedVolume} m³
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Booked on: {formatDateTime(booking.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="mb-3 font-semibold text-gray-700">
                    Full Container Route
                  </h3>

                  <div className="space-y-3">
                    {checkpoints.map((checkpoint, index) => (
                      <div
                        key={`${checkpoint.name}-${index}`}
                        className="flex gap-3"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`mt-1 h-3 w-3 rounded-full ${
                              index === 0
                                ? "bg-green-500"
                                : index === checkpoints.length - 1
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                            }`}
                          />

                          {index < checkpoints.length - 1 && (
                            <div className="mt-1 min-h-6 w-0.5 flex-1 bg-gray-300" />
                          )}
                        </div>

                        <div className="pb-3">
                          <p className="font-medium text-gray-800">
                            {checkpoint.name || "Unnamed checkpoint"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {checkpoint.type}
                          </p>

                          {checkpoint.expectedArrival && (
                            <p className="text-sm text-gray-500">
                              Expected arrival:{" "}
                              {formatDateTime(checkpoint.expectedArrival)}
                            </p>
                          )}

                          {checkpoint.expectedDeparture && (
                            <p className="text-sm text-gray-500">
                              Expected departure:{" "}
                              {formatDateTime(checkpoint.expectedDeparture)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="mb-3 font-semibold text-gray-700">
                    Segments Covered by This Booking
                  </h3>

                  {coveredSegments.length > 0 ? (
                    <div className="space-y-3">
                      {coveredSegments.map((segment, index) => (
                        <div
                          key={
                            segment._id ||
                            `${segment.from}-${segment.to}-${index}`
                          }
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <p className="font-medium text-gray-800">
                            {segment.from} → {segment.to}
                          </p>

                          <div className="mt-2 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                            <p>
                              Available weight:{" "}
                              {segment.availableWeightCapacity} kg
                            </p>

                            <p>
                              Available volume:{" "}
                              {segment.availableVolumeCapacity} m³
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Segment details are unavailable for this booking.
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500">
                    Container route: {container?.origin || "N/A"} →{" "}
                    {container?.destination || "N/A"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Departure: {formatDate(container?.departureDate)}
                  </p>

                  <p className="text-sm text-gray-500">
                    Arrival: {formatDate(container?.arrivalDate)}
                  </p>

                  <button
                    onClick={() =>
                      (window.location.href = `/provider/bookings/${booking._id}`)
                    }
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
