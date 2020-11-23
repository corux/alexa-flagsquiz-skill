import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import {
  BaseIntentHandler,
  getQuestion,
  Intents,
  isAnswerCorrect,
  ISessionAttributes,
} from "../../../utils";

@Intents("InfoIntent", "AMAZON.HelpIntent")
export class InfoIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;

    const correctAnswers = attributes.history.filter(isAnswerCorrect).length;
    const totalAnswers = attributes.history.length;
    let text: string;
    if (correctAnswers === totalAnswers) {
      text = `Du hast alle ${totalAnswers} Fragen richtig beantwortet.`;
    } else if (correctAnswers === 0) {
      text = `Du hast noch keine der ${totalAnswers} Fragen richtig beantwortet.`;
    } else if (totalAnswers === 0) {
      text = "Du hast noch keine Fragen beantwortet";
    }

    return getQuestion(handlerInput, false, text);
  }
}
