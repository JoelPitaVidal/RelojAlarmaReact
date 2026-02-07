import { useClock } from "../hooks/useClock";
import { formatDate } from "../utils/time";

export function Clock() {
  const currentDateTime = useClock();
  return <h3>{formatDate(currentDateTime)}</h3>;
}