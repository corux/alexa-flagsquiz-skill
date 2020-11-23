import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { BaseIntentHandler, getQuestion, Intents } from "../../../utils";

@Intents("HintIntent")
export class HintIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    return getQuestion(
      handlerInput,
      false,
      "Zu dieser Frage gibt es keinen Hinweis."
    );
  }
}
