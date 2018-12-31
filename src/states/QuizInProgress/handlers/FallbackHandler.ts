import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { BaseIntentHandler, Fallback } from "../../../utils";

@Fallback()
export class FallbackHandler extends BaseIntentHandler {
  public handle(handlerInput: HandlerInput): Response {
    return handlerInput.responseBuilder
      .speak("Ich habe dich nicht verstanden. Bitte wiederhole den Befehl.")
      .reprompt("Bitte wiederhole den Befehl.")
      .getResponse();
  }
}
