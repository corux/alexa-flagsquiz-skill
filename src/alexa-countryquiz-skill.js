import { Skill, Launch, Intent, SessionEnded } from 'alexa-annotations';
import { say, ask } from 'alexa-response';
import ssml from 'alexa-ssml-jsx';

import countryjs from 'countryjs';
import availableFlags from 'svg-country-flags/countries.json';
import continent from './continent';

@Skill
export default class AlexaCountryQuizSkill {

  AlexaCountryQuizSkill(session) {
    this.session = session;
  }

  _createResponse() {
    return say('WQi');
  }

  _getRandomEntry(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  _isAcceptedIsoCode(isoCode) {
    const translations = countryjs.translations(value);
    const borders = countryjs.borders(value);
    const region = countryjs.region(value);

    const isNameAvailable = translations && translations['de'];
    const isFlagAvailable = Object.keys(availableFlags).map(value => value.toLowerCase())
      .includes(isoCode.toLowerCase());
    const isBordersAvailable = borders.length > 0;
    const isRegionAvailable = !!region;

    return isNameAvailable && isFlagAvailable && isBordersAvailable && isRegionAvailable;
  }

  _getContinentQuestion() {
    const country = this._getNextCountry();
    const name = countryjs.info(country).translations['de'];
    return {
      type: 'continent',
      iso: country,
      country: name,
      question: `Auf welchem Kontinent liegt ${name}?`,
      try: 0
    };
  }

  _handleContinentQuestion(answer) {
    const data = this.session.attributes;
    if (answer === continent.getTranslation(countryjs.region(data.iso))) {
      return {
        success: true
      };
    }

    data.success = false;
    data.try++;
    return data;
  }

  _getNeighbourQuestion() {
    const country = this._getNextCountry();
    const name = countryjs.info(country).translations['de'];
    return {
      type: 'neighbour',
      isoCode: country,
      country: name,
      question: `Nenne ein Nachbarland von ${name}.`,
      try: 0
    };
  }

  _handleNeighbourQuestion(answer) {
    const data = this.session.attributes;
    if (answer === data.country) {
      return {
        success: true
      };
    }

    data.success = false;
    data.try++;
    return data;
  }

  _getQuestion() {
    const list = [
      this._getContinentQuestion,
      this._getNeighbourQuestion
    ];

    return this._getRandomEntry(list)();
  }

  _handleAnswer(answer) {
    if (!this.session.attributes || !this.session.attributes.type) {
      return this.launch();
    }

    const handlers = {
      neighbour: this._handleNeighbourQuestion,
      continent: this._handleContinentQuestion
    };

    const result = handlers[this.session.attributes.type](answer);
    if (result.success) {
      const data = this._getQuestion();
      return ask(`Das war richtig! ${data.question}`)
        .reprompt(data.question)
        .attributes(data);
    }

    return ask('Das war nicht richtig. Versuche es noch einmal.')
      .reprompt(result.question)
      .attributes(result);
  }

  _getNextCountry() {
    let isoCode;
    let count = 0;
    do {
      isoCode = this._getRandomEntry(Object.keys(availableFlags));
      count++;
    } while(!this._isAcceptedIsoCode(isoCode) && count < 5);

    if (count >= 5) {
      throw new Error('Kein verfügbares Land gefunden.');
    }

    return isoCode;
  }

  _getCard(isoCode) {
    const image = `https://cdn.rawgit.com/hjnilsson/country-flags/9e827754/png1000px/${isoCode.toLowerCase()}.png`;
    return {
      title: 'Länder Quiz',
      type: 'Standard',
      image: {
        smallImageUrl: image,
        largeImageUrl: image
      }
    }
  }

  @Launch
  launch() {
    const data = this._getQuestion();
    return ask(`Willkommen beim Länder Quiz. ${data.question}`)
      .reprompt(data.question)
      .attributes(data);
  }

  @Intent('CountryIntent')
  countryIntent({ country }) {
    return this._handleAnswer(country);
  }

  @Intent('ContinentIntent')
  countryIntent({ continent }) {
    return this._handleAnswer(continent);
  }

  @Intent('HintIntent')
  hintIntent() {
    return ask('Hier ein Hinweis.');
  }

  @Intent('StatisticsIntent')
  statisticsIntent() {
    return ask('Deine Statistik ist hier');
  }

  @Intent('AMAZON.HelpIntent')
  help() {
    return ask('Hier ist die Hilfe.');
  }

  @Intent('AMAZON.CancelIntent', 'AMAZON.StopIntent')
  stop() {
    return say('Bis bald!');
  }

  @SessionEnded
  sessionEnded() {
    // need to handle session ended event to circumvent error
    return {};
  }

}
