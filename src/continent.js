const i18nContinents = {
  Asia: "Asien",
  Europe: "Europa",
  Africa: "Afrika",
  Oceania: "Ozeanien",
  Americas: "Amerika"
};

export default {
  getAll: () => {
    return Object.values(i18nContinents);
  },
  getTranslation: (en) => {
    return i18nContinents[en];
  }
};
