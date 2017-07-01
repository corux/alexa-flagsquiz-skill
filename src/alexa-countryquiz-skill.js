import { Skill, Launch, Intent, SessionEnded } from 'alexa-annotations';
import { say, ask } from 'alexa-response';
import ssml from 'alexa-ssml-jsx';

import countries from './countries';
import continent from './continent';

@Skill
export default class AlexaCountryQuizSkill {

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

  _handleContinentQuestion(answer, attributes) {
    const expectedAnswer = countries.getByIso3(attributes.iso).region;
    console.log(`Answer: "${answer}", Expected answer: "${expectedAnswer}"`);
    if (answer && answer.toUpperCase() === expectedAnswer.toUpperCase()) {
      return {
        success: true
      };
    }

    attributes.success = false;
    attributes.try++;
    return attributes;
  }

  _getNeighbourQuestion() {
    let country;
    do {
      country = this._getNextCountry();
    } while(!country.borders);

    return {
      type: 'neighbour',
      iso: country.iso3,
      country: country.name,
      question: `Nenne ein Nachbarland von ${country.name}.`,
      try: 0
    };
  }

  _handleNeighbourQuestion(answer, attributes) {
    const expectedAnswer = countries.getByIso3(attributes.iso).borders
      .map(border => countries.getByIso3(border))
      .filter(val => !!val)
      .map(val => val.name);
    console.log(`Answer: "${answer}", Expected answer: "${expectedAnswer}"`);
    if (expectedAnswer.find(val => answer && answer.toUpperCase() === val.toUpperCase())) {
      return {
        success: true
      };
    }

    attributes.success = false;
    attributes.try++;
    return attributes;
  }

  _getQuestion() {
    const list = [
      this._getContinentQuestion,
      this._getNeighbourQuestion
    ];

    return this._getRandomEntry(list).call(this);
  }

  _handleAnswer(answer, session) {
    if (!session || !session.attributes || !session.attributes.type) {
      return this.launch();
    }

    const handlers = {
      neighbour: this._handleNeighbourQuestion,
      continent: this._handleContinentQuestion
    };

    const result = handlers[session.attributes.type](answer, session.attributes);
    if (result.success) {
      const data = this._getQuestion();
      data.numQuestions = session.attributes.numQuestions + 1;
      data.correctQuestions = session.attributes.correctQuestions + 1;
      return ask(`Das war richtig! ${data.question}`)
        .reprompt(data.question)
        .attributes(data);
    }

    if (result.try >= 3) {
      const data = this._getQuestion();
      data.numQuestions = session.attributes.numQuestions + 1;
      return ask(`Das war nicht richtig. Hier ist die nächste Frage: ${data.question}`)
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
    data.numQuestions = 1;
    data.correctQuestions = 0;
    return ask(`Willkommen beim Länder Quiz. Hier ist die erste Frage: ${data.question}`)
      .reprompt(data.question)
      .attributes(data);
  }

  @Intent('CountryIntent')
  countryIntent({ country }, { session }) {
    return this._handleAnswer(country, session);
  }

  @Intent('ContinentIntent')
  continentIntent({ continent }, { session }) {
    return this._handleAnswer(continent, session);
  }

  @Intent('SkipIntent')
  skipIntent({}, { session }) {
    const data = this._getQuestion();
    data.numQuestions++;
    return ask(`Hier ist die nächste Frage: ${data.question}`)
      .reprompt(data.question)
      .attributes(data);
  }

  @Intent('HintIntent')
  hintIntent({}, { session }) {
    const data = session.attributes;
    return ask(`Zu dieser Frage gibt es keinen Hinweis. ${data.question}`)
      .reprompt(data.question)
      .attributes(data);
  }

  @Intent('StatisticsIntent')
  statisticsIntent({}, { session }) {
    const data = session.attributes;
    let statistic;
    if (data.numQuestions <= 1) {
      statistic = 'Du hast noch keine Fragen beantwortet.';
    } else if (data.correctQuestions === data.numQuestions - 1) {
      const num = data.correctQuestions === 1 ? '' : data.correctQuestions;
      statistic = `Du hast alle ${num} Fragen richtig beantwortet.`;
    } else {
      statistic = `Du hast ${data.correctQuestions} von ${data.numQuestions - 1} Fragen richtig beantwortet.`
    }

    return ask(`${statistic} ${data.question}`)
      .reprompt(data.question)
      .attributes(data);
  }

  @Intent('AMAZON.HelpIntent')
  help({}, { session }) {
    const data = session.attributes;
    return ask(`Wenn du ein Frage nicht beantworten kannst, sage einfach "nächste Frage". Die aktuelle Frage lautet: ${data.question}`)
      .reprompt(data.question)
      .attributes(data);
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
