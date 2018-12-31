import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { BaseIntentHandler, getQuestion, Intents } from "../../../utils";

@Intents("AMAZON.RepeatIntent")
export class RepeatIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    return getQuestion(handlerInput, false);
  }
}
