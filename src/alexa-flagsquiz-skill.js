import { Skill, Launch, Intent, SessionEnded } from 'alexa-annotations';
import { say, ask } from 'alexa-response';
import ssml from 'alexa-ssml-jsx';

@Skill
export default class AlexaFlagsQuizSkill {

  _createResponse() {
    return say('Hallo');
  }

  @Launch
  launch() {
    return this._createResponse();
  }

  @Intent('CountryIntent')
  countryIntent() {
    return this._createResponse();
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
