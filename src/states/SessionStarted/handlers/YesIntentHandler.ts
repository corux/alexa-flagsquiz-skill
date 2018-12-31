import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { BaseIntentHandler, Intents, startQuiz, States } from "../../../utils";

@Intents("AMAZON.YesIntent")
export class YesIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    this.setState(handlerInput, States.QuizInProgress);
    return startQuiz(handlerInput);
  }
}
