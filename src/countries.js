import countries from './data.json';

export default {
  getByIso3: (iso) => {
    return countries.find(value => value.iso3 && iso && value.iso3.toUpperCase() === iso.toUpperCase());
  },
  getAll: () => {
      return countries;
  }
};
