import countries from './data.json';

export default {
  getByIso3: (iso) => {
    return countries.filter(value => value.iso3 == iso);
  },
  getAll: () => {
      return countries;
  }
};
