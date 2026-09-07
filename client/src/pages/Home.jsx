import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, authChecked } = useSelector(
    (state) => state.auth,
  );

  const handleDashboard = () => {
    if (user?.role === "exporter") {
      navigate("/exporter/dashboard");
    } else if (user?.role === "provider") {
      navigate("/provider/dashboard");
    } else if (user?.role === "admin") {
      navigate("/admin/dashboard");
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-teal-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">CargoShare</h1>

          {isAuthenticated ? (
            <button
              onClick={handleDashboard}
              className="bg-white text-teal-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-100"
            >
              Dashboard
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="border border-white px-5 py-2 rounded-lg font-medium hover:bg-white hover:text-teal-700"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="bg-white text-teal-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-100"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-teal-700 text-white px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Share Capacity. Move Smarter.
          </h2>

          <p className="max-w-2xl mx-auto mt-6 text-lg text-teal-100">
            CargoShare connects exporters with transportation providers, making
            unused container capacity easier to discover, book, and track.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-teal-700 px-7 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/login")}
              className="border border-white px-7 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-700"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              How CargoShare Works
            </h2>

            <p className="mt-3 text-gray-600">
              A simple way to connect cargo with available transportation
              capacity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-teal-600">1</div>

              <h3 className="text-xl font-semibold text-gray-800 mt-4">
                Find Capacity
              </h3>

              <p className="text-gray-600 mt-3">
                Exporters can browse available containers and find
                transportation capacity that matches their requirements.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-teal-600">2</div>

              <h3 className="text-xl font-semibold text-gray-800 mt-4">
                Book Space
              </h3>

              <p className="text-gray-600 mt-3">
                Request the weight and volume capacity needed for your shipment
                and wait for provider approval.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-teal-600">3</div>

              <h3 className="text-xl font-semibold text-gray-800 mt-4">
                Track Shipments
              </h3>

              <p className="text-gray-600 mt-3">
                Once your booking is approved and the container is in transit,
                track its latest location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Built for Both Sides
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="border rounded-xl p-7">
              <h3 className="text-2xl font-bold text-gray-800">
                For Exporters
              </h3>

              <ul className="mt-5 space-y-3 text-gray-600">
                <li>✓ Browse available containers</li>
                <li>✓ Request transportation capacity</li>
                <li>✓ Manage your bookings</li>
                <li>✓ Track approved shipments</li>
              </ul>
            </div>

            <div className="border rounded-xl p-7">
              <h3 className="text-2xl font-bold text-gray-800">
                For Providers
              </h3>

              <ul className="mt-5 space-y-3 text-gray-600">
                <li>✓ List available container capacity</li>
                <li>✓ Manage booking requests</li>
                <li>✓ Track container movement</li>
                <li>✓ Manage shipment delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Ready to get started?
          </h2>

          <p className="mt-3 text-gray-600">
            Join CargoShare and make transportation capacity easier to use.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="mt-7 bg-teal-600 text-white px-7 py-3 rounded-lg font-semibold hover:bg-teal-700"
          >
            Create an Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-800 text-teal-100 px-6 py-6">
        <div className="max-w-7xl mx-auto text-center">
          <p>© 2026 CargoShare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
