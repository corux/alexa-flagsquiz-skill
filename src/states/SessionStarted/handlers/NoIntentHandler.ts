import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { BaseIntentHandler, Intents } from "../../../utils";

@Intents("AMAZON.NoIntent")
export class NoIntentHandler extends BaseIntentHandler {
  public handle(handlerInput: HandlerInput): Response {
    return handlerInput.responseBuilder
      .speak("Ich freu mich, wenn du später nochmal vorbei kommst. Bis bald!")
      .withShouldEndSession(true)
      .getResponse();
  }
}
