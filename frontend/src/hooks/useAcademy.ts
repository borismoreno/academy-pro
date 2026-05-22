import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

import { fetchCoaches } from "@/services/academy.service";

export function useAcademy() {
  const {
    data: coaches = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.academies.all(),
    queryFn: fetchCoaches,
  });

  return {
    coaches,
    isLoading,
    isError,
  };
}
