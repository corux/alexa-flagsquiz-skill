import { HandlerInput } from "ask-sdk-core";
import { IntentRequest, Response } from "ask-sdk-model";
import {
  BaseIntentHandler, calculatePoints, getAnswerText,
  getLocale, getNumberOfQuestions, getQuestion, getRandomEntry, getSlotValue,
  Intents,
  IPersistentAttributes,
  isAnswerCorrect,
  ISessionAttributes,
  States,
} from "../../../utils";

export async function getResponse(handlerInput: HandlerInput, successText: string): Promise<Response> {
  const attributesManager = handlerInput.attributesManager;
  const attributes = attributesManager.getSessionAttributes() as ISessionAttributes;

  const remainingQuestions = attributes.history.filter((item) => !item.answer).length;
  const isFinished = remainingQuestions === 0;
  if (isFinished) {
    const totalAnswers = attributes.history.length;
    const correctAnswers = attributes.history.filter(isAnswerCorrect).length;

    const persistentAttributes = await attributesManager.getPersistentAttributes() as IPersistentAttributes;
    persistentAttributes.scores = persistentAttributes.scores || [];
    persistentAttributes.scores.push({
      correct: correctAnswers,
      points: calculatePoints(attributes.history),
      region: attributes.region,
      time: new Date().getDate(),
      total: totalAnswers,
    });
    attributesManager.savePersistentAttributes();

    attributes.state = States.QuizFinished;
    attributes.round++;

    const reprompt = "Möchtest du nochmal spielen?";
    let correctAnswersText = `<say-as interpret-as="number">${correctAnswers}</say-as> von ${totalAnswers}`;
    if (correctAnswers === 0) { correctAnswersText = `keine der ${totalAnswers}`; }
    if (correctAnswers === 1) { correctAnswersText = `eine von ${totalAnswers}`; }
    if (correctAnswers === totalAnswers) { correctAnswersText = `alle ${totalAnswers}`; }
    let text = `${successText} Du hast ${correctAnswersText} Fragen richtig beantwortet. `;
    text += reprompt;
    return handlerInput.responseBuilder
      .speak(text)
      .reprompt(reprompt)
      .getResponse();
  }

  return getQuestion(handlerInput,
    remainingQuestions === 1 || remainingQuestions === getNumberOfQuestions(),
    successText);
}

@Intents("CountryIntent", "ContinentIntent")
export class AnswerIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
    const current = attributes.history.filter((item) => !item.answer)[0];
    const locale = getLocale(handlerInput);

    const slots = (handlerInput.requestEnvelope.request as IntentRequest).intent.slots;
    const slotValue = getSlotValue(current.type === "continent" ? slots.continent : slots.country);
    if (!slotValue) {
      const reprompt = "Bitte versuche es noch einmal.";
      return handlerInput.responseBuilder
        .speak(`Ich habe dich nicht verstanden. ${reprompt}`)
        .reprompt(reprompt)
        .getResponse();
    }

    current.answer = slotValue;
    if (isAnswerCorrect(current)) {
      const speechcon = getRandomEntry([
        "richtig", "bingo", "bravo",
        "prima", "stimmt", "super",
        "yay", "jawohl",
      ]);
      return getResponse(handlerInput, `<say-as interpret-as='interjection'>${speechcon}</say-as>!`);
    }

    return getResponse(handlerInput, `Die richtige Antwort war ${getAnswerText(current, locale)}.`);
  }
}
