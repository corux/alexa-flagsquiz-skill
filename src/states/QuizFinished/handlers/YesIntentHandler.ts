import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { BaseIntentHandler, getLocale, Intents, ISessionAttributes, startQuiz, States } from "../../../utils";
import countries from "../../../utils/countries";

@Intents("AMAZON.YesIntent")
export class YesIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
    const locale = getLocale(handlerInput);
    this.setState(handlerInput, States.QuizInProgress);
    const region = countries.getRegionByCode(attributes.region, locale);
    return startQuiz(handlerInput, region);
  }
}
