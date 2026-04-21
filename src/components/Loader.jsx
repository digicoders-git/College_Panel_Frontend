import { useLoading } from "../context/LoadingContext";

export default function Loader() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md animate-loader-fade-in pointer-events-none">
      <div className="w-15 h-15 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin" />
    </div>
  );
}
