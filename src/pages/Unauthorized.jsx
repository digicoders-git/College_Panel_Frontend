import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-bold text-red-500 mb-2">403</h1>
      <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
      <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
        Go Back
      </button>
    </div>
  );
}
