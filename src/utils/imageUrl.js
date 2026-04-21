export const getImgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  
  const uploadUrl = import.meta.env.VITE_UPLOAD_URL || "http://localhost:8000";
  
  // Ensure we don't have double slashes if path also starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${uploadUrl}${cleanPath}`;
};
