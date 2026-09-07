import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateProfile,
  changePassword,
  clearError,
} from "../features/auth/authSlice.js";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(updateProfile(formData));

    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    const result = await dispatch(
      changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    );

    if (changePassword.fulfilled.match(result)) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordSuccess("Password changed successfully.");
    } else {
      setPasswordError(result.payload || "Password change failed.");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
    });

    dispatch(clearError());
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-700 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={() =>
              navigate(
                user.role === "provider"
                  ? "/provider/dashboard"
                  : "/exporter/dashboard",
              )
            }
          >
            CargoShare
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="bg-white text-teal-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
          >
            Go Back
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>

          <p className="text-gray-500 mt-2">
            Manage your CargoShare account information.
          </p>

          {error && (
            <div className="mt-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!isEditing ? (
            <>
              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {user.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {user.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1 capitalize">
                    {user.role}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <button
                  onClick={() => {
                    dispatch(clearError());
                    setIsEditing(true);
                  }}
                  className="bg-teal-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-700"
                >
                  Edit Profile
                </button>
              </div>

              <div className="mt-10 pt-8 border-t">
                <h3 className="text-xl font-semibold text-gray-800">
                  Change Password
                </h3>

                <p className="text-gray-500 mt-2">
                  Update your password to keep your account secure.
                </p>

                {passwordError && (
                  <p className="mt-4 text-sm text-red-600">{passwordError}</p>
                )}

                {passwordSuccess && (
                  <p className="mt-4 text-sm text-green-600">
                    {passwordSuccess}
                  </p>
                )}

                <form
                  onSubmit={handlePasswordSubmit}
                  className="mt-6 space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>

                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>

                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      passwordData.newPassword !== passwordData.confirmPassword
                    }
                    className="bg-gray-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-2 w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-500"
                />

                <p className="text-sm text-gray-500 mt-2">
                  Email cannot be changed.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
