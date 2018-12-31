import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import {
  BaseIntentHandler,
  getNumberOfQuestions,
  IPersistentAttributes,
  Request,
} from "../../../utils";

@Request("LaunchRequest")
export class LaunchRequestHandler extends BaseIntentHandler {
  public canHandle(handlerInput: HandlerInput): boolean {
    const session = handlerInput.requestEnvelope.session;
    return super.canHandle(handlerInput) || (session && session.new);
  }

  public async handle(handlerInput: HandlerInput): Promise<Response> {
    let text: string;
    const attributes = await handlerInput.attributesManager.getPersistentAttributes() as IPersistentAttributes;
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    if (!attributes.lastAccess || attributes.lastAccess < new Date().getTime() - oneWeekMs) {
      text = `Willkommen beim Länder Quiz!
        Ich stelle dir ${getNumberOfQuestions()} Fragen zu den Ländern der Welt.
        Versuche möglichst viele richtige Antworten zu erzielen.`;
    } else {
      text = "Willkommen zurück beim Länder Quiz!";
    }

    const reprompt = "Bist du bereit für die erste Runde?";
    return handlerInput.responseBuilder
      .speak(`${text} ${reprompt}`)
      .reprompt(reprompt)
      .getResponse();
  }
}
