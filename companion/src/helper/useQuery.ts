export default (url: string) => {
  const elements = new URL(url).search.replace("?", "").split("&");
  return elements
    .map((e) => {
      const [k, v] = e.split("=");
      return { [k]: v };
    })
    .reduce((a, v) => {
      const [key, value] = Object.entries(v)[0];
      return { ...a, [key]: value };
    }, {});
};
