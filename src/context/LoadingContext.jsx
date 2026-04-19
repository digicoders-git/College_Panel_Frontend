import { createContext, useContext, useState, useEffect } from "react";
import { loadingStore } from "../utils/loadingStore";

const LoadingContext = createContext({
  isLoading: false,
  setLoading: () => {},
});

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return loadingStore.subscribe((state) => {
      setIsLoading(state);
    });
  }, []);

  // Manual trigger for page changes
  const setLoading = (state) => {
    if (state) loadingStore.start();
    else loadingStore.stop();
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
