const OSRM_URL = process.env.OSRM_URL || "https://router.project-osrm.org";

const hasCoordinates = (location) => {
  const coordinates = location?.coordinates?.coordinates;

  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every(Number.isFinite) &&
    coordinates[0] >= -180 &&
    coordinates[0] <= 180 &&
    coordinates[1] >= -90 &&
    coordinates[1] <= 90
  );
};

const getRoute = async (locations) => {
  const coordinates = locations
    .map((location) => location.coordinates.coordinates.join(","))
    .join(";");

  const response = await fetch(
    `${OSRM_URL}/route/v1/driving/${coordinates}?overview=false&steps=false`,
  );

  if (!response.ok) {
    throw new Error("Routing service request failed.");
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("Could not calculate the road route.");
  }

  return data.routes[0];
};

export const findTripMatch = async (trip, job) => {
  const locations = [
    trip.origin,
    job.pickupLocation,
    job.dropLocation,
    trip.destination,
  ];

  if (!locations.every(hasCoordinates)) {
    return {
      matches: false,
      reason: "Coordinates are missing.",
    };
  }

  const weightKg = Number(job.weightKg);

  const volumeM3 =
    (Number(job.lengthCm) * Number(job.widthCm) * Number(job.heightCm)) /
    1_000_000;

  if (
    !Number.isFinite(weightKg) ||
    !Number.isFinite(volumeM3) ||
    weightKg <= 0 ||
    volumeM3 <= 0
  ) {
    return {
      matches: false,
      reason: "Invalid package dimensions or weight.",
    };
  }

  if (
    weightKg > trip.spareCapacityWeightKg ||
    volumeM3 > trip.spareCapacityVolumeM3
  ) {
    return {
      matches: false,
      reason: "Package exceeds available capacity.",
    };
  }

  // Calculate the route in the required order:
  // origin -> pickup -> drop-off -> destination.
  const route = await getRoute(locations);

  if (route.legs.length !== 3) {
    return {
      matches: false,
      reason: "Could not calculate route segments.",
    };
  }

  // Compare with travelling directly to the destination.
  const directRoute = await getRoute([trip.origin, trip.destination]);

  const totalDistanceKm =
    route.legs.reduce((sum, leg) => sum + leg.distance, 0) / 1000;

  const directDistanceKm = directRoute.distance / 1000;

  const detourKm = Math.max(0, totalDistanceKm - directDistanceKm);

  const totalDurationMinutes =
    route.legs.reduce((sum, leg) => sum + leg.duration, 0) / 60;

  const directDurationMinutes = directRoute.duration / 60;

  const detourMinutes = Math.max(
    0,
    totalDurationMinutes - directDurationMinutes,
  );

  if (detourKm > trip.maxDetourKm || detourMinutes > trip.maxDetourMinutes) {
    return {
      matches: false,
      reason: "Detour exceeds the traveller's limits.",
    };
  }

  // Estimate when the traveller reaches the pickup point.
  const estimatedPickupTime =
    new Date(trip.departureTime).getTime() + route.legs[0].duration * 1000;

  if (
    estimatedPickupTime < new Date(job.pickupWindowStart).getTime() ||
    estimatedPickupTime > new Date(job.pickupWindowEnd).getTime()
  ) {
    return {
      matches: false,
      reason: "Pickup time is outside the requested window.",
    };
  }

  return {
    matches: true,
    detourKm: Number(detourKm.toFixed(2)),
    detourMinutes: Math.round(detourMinutes),
    estimatedPickupTime: new Date(estimatedPickupTime),
    packageVolumeM3: Number(volumeM3.toFixed(4)),
    estimatedRouteDistanceKm: Number(totalDistanceKm.toFixed(2)),
  };
};
