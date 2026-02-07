import { useEffect, useState } from "react";

export function useClock() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  return currentDateTime;
}