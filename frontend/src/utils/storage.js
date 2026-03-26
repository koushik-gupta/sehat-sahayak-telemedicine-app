// src/utils/storage.js
export const getPharmacies = () =>
  JSON.parse(localStorage.getItem("pharmacies")) || [];

export const setPharmacies = (data) =>
  localStorage.setItem("pharmacies", JSON.stringify(data));
