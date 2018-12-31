import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { getResponse } from ".";
import { BaseIntentHandler, getAnswerText, getLocale, Intents, ISessionAttributes } from "../../../utils";

@Intents("SkipIntent", "AMAZON.NextIntent")
export class SkipIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    const attributesManager = handlerInput.attributesManager;
    const attributes = attributesManager.getSessionAttributes() as ISessionAttributes;
    const current = attributes.history.filter((item) => !item.answer)[0];
    const locale = getLocale(handlerInput);

    current.answer = "-";
    return await getResponse(handlerInput, `Die Lösung war ${getAnswerText(current, locale)}.`);
  }
}
