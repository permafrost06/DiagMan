const startAfter = (arr, elementID) => {
  const idx = arr.map((item) => item._id).indexOf(elementID);
  return arr.slice(idx + 1);
};

const endBefore = (arr, elementID) => {
  const idx = arr.map((item) => item._id).indexOf(elementID);
  return arr.slice(0, idx);
};

export const limitTo = (arr, lim) => {
  return arr.slice(0, lim);
};

export const limitToLast = (arr, lim) => {
  return arr.slice(arr.length - lim);
};

export const lastPage = (arr, lim) => {
  return arr.slice(Math.floor(arr.length / lim) * lim);
};

export const nextPage = (arr, lastID, lim) => {
  return limitTo(startAfter(arr, lastID), lim);
};

export const prevPage = (arr, firstID, lim) => {
  return limitToLast(endBefore(arr, firstID), lim);
};
