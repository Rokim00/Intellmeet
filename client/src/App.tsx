import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Signup } from './pages/Signup';

// Temporary dummy dashboard to verify successful registration redirect
const TestDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#0d0f11] text-white flex flex-col items-center justify-center p-6">
      <div className="bg-[#14171a] border border-neutral-800 p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
        <div className="bg-[#1a1d24] p-4 rounded-xl text-left text-sm space-y-2 text-neutral-300">
          <p><span className="text-neutral-500">Name:</span> {user?.name}</p>
          <p><span className="text-neutral-500">Email:</span> {user?.email}</p>
          <p><span className="text-neutral-500">Role:</span> {user?.role}</p>
          <p><span className="text-neutral-500">User ID:</span> {user?._id}</p>
        </div>
        <button
          onClick={() => logout()}
          className="w-full py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<TestDashboard />} />
          {/* Temporary placeholder for login until we build it next */}
          <Route path="/login" element={<div className="text-white p-6 bg-black min-h-screen">Login Page Coming Next</div>} />
          <Route path="*" element={<Navigate to="/signup" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}