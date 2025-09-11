import { getArticles } from "../../API/apiArticles";
import { useQuery } from "@tanstack/react-query";

export function useArticles() {
  const { isLoading, data, error } = useQuery({
    queryKey: ["articles"],
    queryFn: getArticles,
  });
  return { isLoading, error, data };
}
