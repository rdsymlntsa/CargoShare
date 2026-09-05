import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyContainerById,
  updateContainerLocation,
  clearContainerError,
  clearCurrentContainer,
} from "../../features/containers/containerSlice.js";

const UpdateContainerLocation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentContainer, loading, error } = useSelector(
    (state) => state.containers,
  );

  const [tracking, setTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const watchIdRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    dispatch(getMyContainerById(id));

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      dispatch(clearCurrentContainer());
      dispatch(clearContainerError());
    };
  }, [dispatch, id]);

  const sendLocationUpdate = (position) => {
    const now = Date.now();

    if (now - lastUpdateRef.current < 15000) {
      return;
    }

    lastUpdateRef.current = now;

    const { latitude, longitude } = position.coords;

    dispatch(
      updateContainerLocation({
        id,
        locationData: {
          latitude,
          longitude,
        },
      }),
    );
  };

  const startTracking = () => {
    setTrackingError("");

    if (!navigator.geolocation) {
      setTrackingError("GPS is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        sendLocationUpdate(position);
        setTracking(true);
      },
      (error) => {
        setTracking(false);

        if (error.code === error.PERMISSION_DENIED) {
          setTrackingError(
            "Location permission was denied. Please allow location access.",
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setTrackingError("Your current location could not be determined.");
        } else if (error.code === error.TIMEOUT) {
          setTrackingError(
            "Getting your location timed out. Please try again.",
          );
        } else {
          setTrackingError("Unable to access your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    watchIdRef.current = watchId;
    setTracking(true);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setTracking(false);
  };

  if (loading && !currentContainer) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading container...</p>
      </div>
    );
  }

  if (!currentContainer) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Container not found.</p>
      </div>
    );
  }

  if (currentContainer.status !== "in-transit") {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-teal-600 text-white px-6 py-4">
          <h1 className="text-xl font-bold">CargoShare</h1>
        </nav>

        <main className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800">
              Tracking Unavailable
            </h2>

            <p className="text-gray-600 mt-2">
              Live GPS tracking is available only after the container has
              departed.
            </p>

            <button
              onClick={() => navigate(`/provider/containers/${id}`)}
              className="mt-6 bg-teal-600 text-white px-5 py-3 rounded-lg font-medium"
            >
              Back to Container
            </button>
          </div>
        </main>
      </div>
    );
  }

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

      <main className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(`/provider/containers/${id}`)}
          className="text-teal-600 font-medium mb-5"
        >
          ← Back to Container
        </button>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Live GPS Tracking
          </h2>

          <p className="text-gray-600 mt-1">
            {currentContainer.containerNumber}
          </p>

          <div className="mt-6 bg-gray-50 rounded-lg p-5">
            <p className="text-gray-500 text-sm">Route</p>

            <p className="font-medium text-gray-800 mt-1">
              {currentContainer.origin} → {currentContainer.destination}
            </p>
          </div>

          {tracking && (
            <div className="mt-5 bg-green-100 text-green-700 px-4 py-3 rounded-lg">
              Live tracking is active. Your GPS location is being updated
              automatically.
            </div>
          )}

          {(trackingError || error) && (
            <div className="mt-5 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {trackingError || error}
            </div>
          )}

          {currentContainer.currentLocation && (
            <div className="mt-5 border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-3">
                Last Recorded Location
              </h3>

              <p className="text-sm text-gray-500">
                Latitude: {currentContainer.currentLocation.latitude}
              </p>

              <p className="text-sm text-gray-500">
                Longitude: {currentContainer.currentLocation.longitude}
              </p>

              {currentContainer.currentLocation.updatedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Last updated:{" "}
                  {new Date(
                    currentContainer.currentLocation.updatedAt,
                  ).toLocaleString()}
                </p>
              )}
            </div>
          )}

          <div className="mt-6">
            {!tracking ? (
              <button
                onClick={startTracking}
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
              >
                Start Live Tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700"
              >
                Stop Live Tracking
              </button>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Keep this page open while transporting the container so CargoShare
            can receive your GPS updates.
          </p>
        </div>
      </main>
    </div>
  );
};

export default UpdateContainerLocation;
