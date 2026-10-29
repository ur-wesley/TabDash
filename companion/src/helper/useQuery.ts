const useQuery = (url: string): Record<string, string | undefined> => {
  const params = new URL(url).searchParams,
    result: Record<string, string | undefined> = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
};

export default useQuery;
