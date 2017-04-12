import { Skill, Launch, Intent, SessionEnded } from 'alexa-annotations';
import { say, ask } from 'alexa-response';
import ssml from 'alexa-ssml-jsx';

import countryjs from 'countryjs';
import availableFlags from 'svg-country-flags/countries.json';

@Skill
export default class AlexaCountryQuizSkill {

  _createResponse() {
    return say('WQi');
  }

  _getRandomEntry(array) {
    return array[Math.floor(Math.random() * (array.length + 1))];
  }

  _isAcceptedIsoCode(isoCode) {
    const translations = countryjs.translations(value);
    const isNameAvailable = translations && translations['de'];
    const isFlagAvailable = Object.keys(availableFlags).map(value => value.toLowerCase())
      .includes(isoCode.toLowerCase());

    return isNameAvailable && isFlagAvailable;
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
      title: 'Flaggen Quiz',
      type: 'Standard',
      image: {
        smallImageUrl: image,
        largeImageUrl: image
      }
    }
  }

  @Launch
  launch() {
    const isoCode = this._getNextCountry();
    return ask('Willkommen beim Flaggen Quiz. Ich habe eine Flagge an deine Alexa App gesendet. Um welches Land handelt es sich?')
      .reprompt('Zu welchem Land gehört die Flagge?')
      .card(this._getCard(isoCode))
      .attributes({
        country: isoCode
      });
  }

  @Intent('CountryIntent')
  countryIntent({ country }) {
    return this._createResponse();
  }

  @Intent('HintIntent')
  hintIntent() {

  }

  @Intent('AMAZON.HelpIntent')
  help() {
    return ask('')
      .reprompt('');
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
