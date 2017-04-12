const i18nContinents = {
  Asia: "Asien",
  Europe: "Europa",
  Africa: "Afrika",
  Oceania: "Ozeanien",
  Americas: "Amerika"
};

export default {
  getTranslation: (en) => {
    return i18nContinents[en];
  }
};
