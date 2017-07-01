import { Skill, Launch, Intent, SessionEnded } from 'alexa-annotations';
import { say, ask } from 'alexa-response';
import ssml from 'alexa-ssml-jsx';

import countries from './countries';
import continent from './continent';

@Skill({ logging: true, applicationId: 'amzn1.ask.skill.f6a1e125-65ca-4c7a-9c8c-b781cad37b40' })
export default class AlexaCountryQuizSkill {

  AlexaCountryQuizSkill(session) {
    this.session = session;
  }

  _getRandomEntry(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  _getContinentQuestion() {
    const country = this._getNextCountry();
    return {
      type: 'continent',
      iso: country.iso3,
      country: country.name,
      question: `Auf welchem Kontinent liegt ${country.name}?`,
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
    let country;
    do {
      country = this._getNextCountry();
    } while(!country.borders);

    return {
      type: 'neighbour',
      isoCode: country.iso3,
      country: country.name,
      question: `Nenne ein Nachbarland von ${country.name}.`,
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

    return this._getRandomEntry(list).call(this);
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
    return this._getRandomEntry(countries.getAll());
  }

  _getCard(country) {
    return {
      title: 'Länder Quiz',
      type: 'Standard',
      image: {
        smallImageUrl: country.flag.smallImageUrl,
        largeImageUrl: country.flag.largeImageUrl
      }
    }
  }

  @Launch
  launch() {
    const data = this._getQuestion();
    return ask(`Willkommen beim Länder Quiz. Hier ist die erste Frage: ${data.question}`)
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
