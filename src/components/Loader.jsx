import { useLoading } from "../context/LoadingContext";

export default function Loader() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}
