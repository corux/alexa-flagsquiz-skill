import { Skill, Launch, Intent, SessionEnded } from 'alexa-annotations';
import { say, ask } from 'alexa-response';
import ssml from 'alexa-ssml-jsx';

import countries from './countries';

@Skill
export default class AlexaCountryQuizSkill {

  _getRandomEntry(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  _getQuestion() {
    const list = [
      {fn: this._getContinentQuestion, probability: 0.4},
      {fn: this._getNeighbourQuestion, probability: 0.4},
      {fn: this._getCapitalQuestion, probability: 0.2}
    ];

    const random = Math.random();
    let threshold = 0;
    for (let i = 0; i < list.length; i++) {
      threshold += list[i].probability;
      if (threshold >= random) {
        return list[i].fn.call(this);
      }
    }
  }

  _getContinentQuestion() {
    let country;
    do {
      country = this._getNextCountry();
    } while(!country.region);

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
    } while(country.borders && country.borders.length === 0);

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
      .map(border => {
        const country = countries.getByIso3(border);
        return country && country.name;
      })
      .filter(val => !!val);
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

  _getCapitalQuestion() {
    // limit the capital question to countries from europe or countries with a population > 30.000.000
    let country;
    do {
      country = this._getNextCountry();
    } while((!country.region || country.region.toLowerCase() !== 'europa') && country.population < 30000000);

    return {
      type: 'capital',
      iso: country.iso3,
      country: country.name,
      question: `Zu welchem Land gehört die Hauptstadt ${country.capital}?`,
      try: 0
    };
  }

  _handleCapitalQuestion(answer, attributes) {
    const expectedAnswer = countries.getByIso3(attributes.iso).name;
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

  _handleAnswer(answer, session) {
    if (!session || !session.attributes || !session.attributes.type) {
      return this.launch();
    }

    const handlers = {
      neighbour: this._handleNeighbourQuestion,
      continent: this._handleContinentQuestion,
      capital: this._handleCapitalQuestion
    };

    const result = handlers[session.attributes.type](answer, session.attributes);
    if (result.success) {
      const data = this._getQuestion();
      data.correctQuestions = session.attributes.correctQuestions + 1;
      return ask(`Das war richtig! ${data.question}`)
        .reprompt(data.question)
        .attributes(data);
    }

    if (result.try >= 3) {
      const data = this._getQuestion();
      data.wrongQuestions = session.attributes.wrongQuestions + 1;
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
    };
  }

  _getSlotValue(request, name) {
    try {
      const slot = request.intent.slots[name];
      return slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    } catch (e) {
      return null;
    }
  }

  @Launch
  launch() {
    const data = this._getQuestion();
    data.wrongQuestions = 0;
    data.correctQuestions = 0;
    return ask(`Willkommen beim Länder Quiz. Hier ist die erste Frage: ${data.question}`)
      .reprompt(data.question)
      .attributes(data);
  }

  @Intent('CountryIntent')
  countryIntent({ country }, { session, request }) {
    return this._handleAnswer(this._getSlotValue(request, 'country') || country, session);
  }

  @Intent('ContinentIntent')
  continentIntent({ continent }, { session, request }) {
    return this._handleAnswer(this._getSlotValue(request, 'continent') || continent, session);
  }

  @Intent('AMAZON.RepeatIntent')
  repeatIntent({}, { session }) {
    const data = session.attributes;
    return ask(data.question)
      .reprompt(data.question)
      .attributes(data);
  }

  @Intent('SkipIntent', 'AMAZON.NextIntent')
  skipIntent({}, { session }) {
    const data = this._getQuestion();
    data.wrongQuestions = session.attributes.wrongQuestions + 1;
    return ask(data.question)
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
    const total = data.wrongQuestions + data.correctQuestions;
    if (total <= 0) {
      statistic = 'Du hast noch keine Fragen beantwortet.';
    } else if (data.wrongQuestions === 0) {
      const num = total === 1 ? '' : total;
      statistic = `Du hast alle ${num} Fragen richtig beantwortet.`;
    } else {
      statistic = `Du hast ${data.correctQuestions} von ${total} Fragen richtig beantwortet.`;
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
