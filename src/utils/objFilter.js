export default (obj, func) => {
  const ret = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (!!func(value)) {
      ret[key] = obj[key];
    }
  });
  return ret;
};
