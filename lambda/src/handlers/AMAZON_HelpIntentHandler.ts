import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import {
  BaseIntentHandler,
  getNumberOfQuestions,
  Intents,
  ISessionAttributes,
} from "../utils";

@Intents("AMAZON.HelpIntent")
export class AmazonHelpIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;

    const reprompt = `Bist du bereit für die ${
      attributes.round === 0 ? "erste" : "nächste"
    } Runde?`;
    const helpText = `Mit dem Länder Quiz kannst du dein Wissen über die Länder der Welt testen.
      Pro Runde stelle ich dir ${getNumberOfQuestions()} Fragen.
      ${reprompt}`;

    return handlerInput.responseBuilder
      .speak(helpText)
      .reprompt(reprompt)
      .getResponse();
  }
}
