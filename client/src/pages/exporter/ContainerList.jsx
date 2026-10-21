import { useEffect, useState } from "react";
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

  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    minWeight: "",
    minVolume: "",
    maxPrice: "",
  });

  useEffect(() => {
    dispatch(getContainers());

    return () => {
      dispatch(clearContainerError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFilters((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ""),
    );

    dispatch(getContainers(activeFilters));
  };

  const handleClearFilters = () => {
    setFilters({
      origin: "",
      destination: "",
      departureDate: "",
      minWeight: "",
      minVolume: "",
      maxPrice: "",
    });

    dispatch(getContainers());
  };

  const formatDate = (value) => {
    if (!value) return "Not scheduled";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not scheduled";
    }

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStops = (container) => {
    const intermediateStops = Array.isArray(container.intermediateStops)
      ? container.intermediateStops
      : [];

    return [
      container.origin,
      ...intermediateStops.map((stop) =>
        typeof stop === "string" ? stop : stop?.name,
      ),
      container.destination,
    ].filter(Boolean);
  };

  const getStopSchedule = (container, stopName) => {
    const stop = (container.intermediateStops || []).find(
      (item) =>
        typeof item === "object" &&
        item?.name?.toLowerCase() === stopName?.toLowerCase(),
    );

    return stop || null;
  };

  const getStatusClass = (status) => {
    if (status === "available") {
      return "bg-green-100 text-green-700";
    }

    if (status === "full") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const getRouteCapacity = (container, route) => {
    const segments = Array.isArray(container.segments)
      ? container.segments
      : [];

    const startIndex = Number(route.startIndex);
    const endIndex = Number(route.endIndex);

    if (
      !Number.isInteger(startIndex) ||
      !Number.isInteger(endIndex) ||
      startIndex < 0 ||
      endIndex <= startIndex ||
      endIndex > segments.length
    ) {
      return null;
    }

    const routeSegments = segments.slice(startIndex, endIndex);

    if (routeSegments.length === 0) {
      return null;
    }

    const capacities = routeSegments.map((segment) => ({
      weight: Number(segment.availableWeightCapacity),
      volume: Number(segment.availableVolumeCapacity),
    }));

    if (
      capacities.some(
        (capacity) =>
          !Number.isFinite(capacity.weight) ||
          !Number.isFinite(capacity.volume),
      )
    ) {
      return null;
    }

    return {
      weight: Math.min(...capacities.map((capacity) => capacity.weight)),
      volume: Math.min(...capacities.map((capacity) => capacity.volume)),
    };
  };

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
          Find cargo space along your required route. Choose a valid pickup and
          drop-off checkpoint instead of booking the entire journey.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-6 rounded-xl bg-white p-5 shadow"
        >
          <h3 className="text-lg font-semibold text-gray-800">
            Search Containers
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Origin
              </label>
              <input
                type="text"
                name="origin"
                value={filters.origin}
                onChange={handleChange}
                placeholder="e.g. Delhi"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Destination
              </label>
              <input
                type="text"
                name="destination"
                value={filters.destination}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Departure Date
              </label>
              <input
                type="date"
                name="departureDate"
                value={filters.departureDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Minimum Weight (kg)
              </label>
              <input
                type="number"
                name="minWeight"
                value={filters.minWeight}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 5000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Minimum Volume (m³)
              </label>
              <input
                type="number"
                name="minVolume"
                value={filters.minVolume}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 10"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Maximum Price (₹/kg)
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 50"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              Clear Filters
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && containers.length === 0 && (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">
              No containers match your search criteria.
            </p>
          </div>
        )}

        {loading && containers.length > 0 && (
          <p className="mt-4 text-sm text-gray-500">
            Updating container results...
          </p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {containers.map((container) => {
            const stops = getStops(container);
            const matchingRoutes = Array.isArray(container.matchingRoutes)
              ? container.matchingRoutes
              : [];

            return (
              <div
                key={container._id}
                className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Container</p>
                    <h3 className="mt-1 text-xl font-bold text-gray-800">
                      {container.containerNumber || "N/A"}
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${getStatusClass(
                      container.status,
                    )}`}
                  >
                    {container.status || "Unknown"}
                  </span>
                </div>

                <div className="mt-5 rounded-lg bg-teal-50 p-4">
                  <p className="text-sm font-medium text-teal-800">
                    Full Route · {Math.max(0, stops.length - 2)} intermediate{" "}
                    {stops.length - 2 === 1 ? "stop" : "stops"}
                  </p>

                  <div className="mt-3 space-y-3">
                    {stops.map((stop, index) => {
                      const isIntermediate =
                        index > 0 && index < stops.length - 1;
                      const schedule = isIntermediate
                        ? getStopSchedule(container, stop)
                        : null;

                      return (
                        <div
                          key={`${stop}-${index}`}
                          className="flex items-start gap-3"
                        >
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                index === 0 || index === stops.length - 1
                                  ? "bg-teal-600 text-white"
                                  : "border border-teal-600 bg-white text-teal-700"
                              }`}
                            >
                              {index + 1}
                            </span>

                            {index < stops.length - 1 && (
                              <span className="h-4 w-0.5 bg-teal-200" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {stop}
                            </p>

                            {isIntermediate && (
                              <div className="mt-1 space-y-1 text-xs text-gray-500">
                                <p>
                                  Arrival:{" "}
                                  {formatDate(schedule?.expectedArrival)}
                                </p>
                                <p>
                                  Departure:{" "}
                                  {formatDate(schedule?.expectedDeparture)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">
                      Overall weight available
                    </p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {container.availableWeightCapacity ?? "N/A"} kg
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">
                      Overall volume available
                    </p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {container.availableVolumeCapacity ?? "N/A"} m³
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <h4 className="font-semibold text-gray-800">
                    Matching Pickup & Drop-off Options
                  </h4>

                  {matchingRoutes.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {matchingRoutes.map((route, index) => {
                        const capacity = getRouteCapacity(container, route);

                        return (
                          <div
                            key={`${route.pickup}-${route.dropoff}-${index}`}
                            className="rounded-lg border border-teal-100 p-3"
                          >
                            <p className="font-medium text-gray-800">
                              {route.pickup} → {route.dropoff}
                            </p>

                            {capacity ? (
                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Minimum weight available on route
                                  </p>
                                  <p className="font-semibold text-gray-800">
                                    {capacity.weight} kg
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-500">
                                    Minimum volume available on route
                                  </p>
                                  <p className="font-semibold text-gray-800">
                                    {capacity.volume} m³
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-gray-500">
                                Route-specific capacity details are unavailable.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                      No matching route options were returned. Open the
                      container details to check its available booking options.
                    </p>
                  )}
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="font-semibold text-gray-800">
                      ₹{container.pricePerKg ?? "N/A"} / kg
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500">Departure</span>
                    <span className="text-right font-medium text-gray-800">
                      {formatDate(container.departureDate)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500">Expected arrival</span>
                    <span className="text-right font-medium text-gray-800">
                      {formatDate(container.arrivalDate)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/exporter/containers/${container._id}`)
                  }
                  className="mt-6 w-full rounded-lg bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700"
                >
                  View Route & Details
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ContainerList;
