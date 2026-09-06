import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

import {
  getContainerLocation,
  clearContainerError,
  clearCurrentContainer,
} from "../../features/containers/containerSlice.js";

const Tracking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentContainer, loading, error } = useSelector(
    (state) => state.containers,
  );

  const MapUpdater = ({ latitude, longitude }) => {
    const map = useMap();

    useEffect(() => {
      map.setView([latitude, longitude], map.getZoom());
    }, [map, latitude, longitude]);

    return null;
  };

  useEffect(() => {
    dispatch(getContainerLocation(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!currentContainer || currentContainer.status !== "in-transit") {
      return;
    }

    const intervalId = setInterval(() => {
      dispatch(getContainerLocation(id));
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch, id, currentContainer?.status]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentContainer());
      dispatch(clearContainerError());
    };
  }, [dispatch]);

  if (error && !currentContainer) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-teal-600 text-white px-6 py-4">
          <h1 className="text-xl font-bold">CargoShare</h1>
        </nav>

        <main className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>

          <button
            onClick={() => navigate("/exporter/bookings")}
            className="mt-5 bg-teal-600 text-white px-5 py-3 rounded-lg font-medium"
          >
            Back to My Bookings
          </button>
        </main>
      </div>
    );
  }

  if (!currentContainer) {
    return null;
  }

  const location = currentContainer.currentLocation;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CargoShare</h1>

        <button
          onClick={() => navigate("/exporter/dashboard")}
          className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium"
        >
          Dashboard
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/exporter/bookings")}
          className="text-teal-600 font-medium mb-5"
        >
          ← Back to My Bookings
        </button>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Track Shipment
              </h2>

              <p className="text-gray-600 mt-1">
                {currentContainer.containerNumber}
              </p>
            </div>

            <span className="self-start sm:self-auto bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
              {currentContainer.status}
            </span>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-5">
            <p className="text-sm text-gray-500">Route</p>

            <p className="font-medium text-gray-800 mt-1">
              {currentContainer.origin} → {currentContainer.destination}
            </p>
          </div>

          {location ? (
            <div className="mt-5">
              <h3 className="font-semibold text-gray-800 mb-3">
                Current Location
              </h3>

              <div className="rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={[location.latitude, location.longitude]}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="h-96 w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapUpdater
                    latitude={location.latitude}
                    longitude={location.longitude}
                  />

                  <Marker position={[location.latitude, location.longitude]}>
                    <Popup>
                      <strong>{currentContainer.containerNumber}</strong>
                      <br />
                      Current container location
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                <p>Latitude: {location.latitude}</p>

                <p>Longitude: {location.longitude}</p>

                {location.updatedAt && (
                  <p className="mt-1">
                    Last updated:{" "}
                    {new Date(location.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-5 bg-yellow-100 text-yellow-700 px-4 py-3 rounded-lg">
              No GPS location has been recorded yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tracking;
