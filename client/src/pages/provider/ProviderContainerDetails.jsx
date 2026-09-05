import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyContainerById,
  departContainer,
  clearContainerError,
  clearCurrentContainer,
} from "../../features/containers/containerSlice.js";
const ProviderContainerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentContainer, loading, error } = useSelector(
    (state) => state.containers,
  );
  useEffect(() => {
    dispatch(getMyContainerById(id));
    return () => {
      dispatch(clearCurrentContainer());
      dispatch(clearContainerError());
    };
  }, [dispatch, id]);
  const handleDepart = async () => {
    const result = await dispatch(departContainer(id));
    if (departContainer.fulfilled.match(result)) {
      dispatch(getMyContainerById(id));
    }
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };
  if (loading && !currentContainer) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {" "}
        <p className="text-gray-600">Loading container...</p>{" "}
      </div>
    );
  }
  if (error && !currentContainer) {
    return (
      <div className="min-h-screen bg-gray-100">
        {" "}
        <nav className="bg-teal-600 text-white px-6 py-4">
          {" "}
          <h1 className="text-xl font-bold">CargoShare</h1>{" "}
        </nav>{" "}
        <main className="max-w-3xl mx-auto px-6 py-8">
          {" "}
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {" "}
            {error}{" "}
          </div>{" "}
          <button
            onClick={() => navigate("/provider/containers")}
            className="mt-5 bg-teal-600 text-white px-5 py-3 rounded-lg font-medium"
          >
            {" "}
            Back to My Containers{" "}
          </button>{" "}
        </main>{" "}
      </div>
    );
  }
  if (!currentContainer) {
    return null;
  }
  const container = currentContainer;
  return (
    <div className="min-h-screen bg-gray-100">
      {" "}
      <nav className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
        {" "}
        <h1 className="text-xl font-bold">CargoShare</h1>{" "}
        <button
          onClick={() => navigate("/provider/dashboard")}
          className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium"
        >
          {" "}
          Dashboard{" "}
        </button>{" "}
      </nav>{" "}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {" "}
        <button
          onClick={() => navigate("/provider/containers")}
          className="text-teal-600 font-medium mb-4"
        >
          {" "}
          ← Back to My Containers{" "}
        </button>{" "}
        <div className="bg-white rounded-xl shadow-md p-6">
          {" "}
          {/* Header */}{" "}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            {" "}
            <div>
              {" "}
              <h2 className="text-2xl font-bold text-gray-800">
                {" "}
                {container.containerNumber}{" "}
              </h2>{" "}
              <p className="text-gray-600 mt-1">
                {" "}
                {container.origin} → {container.destination}{" "}
              </p>{" "}
            </div>{" "}
            <span className="self-start sm:self-auto bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
              {" "}
              {container.status}{" "}
            </span>{" "}
          </div>{" "}
          {/* Container Information */}{" "}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {" "}
            <div className="bg-gray-50 rounded-lg p-3">
              {" "}
              <p className="text-xs text-gray-500">Departure</p>{" "}
              <p className="font-medium text-gray-800 mt-1">
                {" "}
                {formatDate(container.departureDate)}{" "}
              </p>{" "}
            </div>{" "}
            <div className="bg-gray-50 rounded-lg p-3">
              {" "}
              <p className="text-xs text-gray-500">Arrival</p>{" "}
              <p className="font-medium text-gray-800 mt-1">
                {" "}
                {formatDate(container.arrivalDate)}{" "}
              </p>{" "}
            </div>{" "}
            <div className="bg-gray-50 rounded-lg p-3">
              {" "}
              <p className="text-xs text-gray-500">Weight Available</p>{" "}
              <p className="font-medium text-gray-800 mt-1">
                {" "}
                {container.availableWeightCapacity} kg{" "}
              </p>{" "}
              <p className="text-xs text-gray-500">
                {" "}
                of {container.totalWeightCapacity} kg{" "}
              </p>{" "}
            </div>{" "}
            <div className="bg-gray-50 rounded-lg p-3">
              {" "}
              <p className="text-xs text-gray-500">Volume Available</p>{" "}
              <p className="font-medium text-gray-800 mt-1">
                {" "}
                {container.availableVolumeCapacity} m³{" "}
              </p>{" "}
              <p className="text-xs text-gray-500">
                {" "}
                of {container.totalVolumeCapacity} m³{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          {/* Pricing */}{" "}
          <div className="mt-3 bg-gray-50 rounded-lg p-3">
            {" "}
            <p className="text-xs text-gray-500">Pricing</p>{" "}
            <p className="font-medium text-gray-800 mt-1">
              {" "}
              ₹{container.pricePerKg} per kg{" "}
            </p>{" "}
          </div>{" "}
          {/* Actions */}{" "}
          {container.status === "available" && (
            <button
              onClick={handleDepart}
              disabled={loading}
              className="w-full mt-5 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {" "}
              {loading ? "Departing..." : "Depart Container"}{" "}
            </button>
          )}{" "}
          {container.status === "in-transit" && (
            <button
              onClick={() => navigate(`/provider/containers/${id}/location`)}
              className="w-full mt-5 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700"
            >
              {" "}
              Start Live Tracking{" "}
            </button>
          )}{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
};

export default ProviderContainerDetails;
