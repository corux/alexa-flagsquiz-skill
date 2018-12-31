import { CountryData, ICountry, IRegion, Region } from "@corux/country-data";

const cache: { [lang: string]: CountryData } = {};

function getInstance(lang: string) {
  const countryData = cache[lang] || (cache[lang] = new CountryData(lang));
  return countryData;
}

export default {
  getAll: (lang: string): ICountry[] => {
    return getInstance(lang).getCountries();
  },
  getByIso3: (iso: string, lang: string): ICountry => {
    return getInstance(lang).getCountries()
      .find((value) => value.iso3 && iso && value.iso3.toUpperCase() === iso.toUpperCase());
  },
  getRegionByCode: (code: string, lang: string): IRegion => {
    const regions = getInstance(lang).getRegions().filter((item) => item.code === code);
    return regions.length ? regions[0] : undefined;
  },
};
