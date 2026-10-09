export default (url: string): Record<string, string | undefined> => {
  const params = new URL(url).searchParams,
    result: Record<string, string | undefined> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};
