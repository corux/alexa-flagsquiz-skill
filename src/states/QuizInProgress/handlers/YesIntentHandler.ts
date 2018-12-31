import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { BaseIntentHandler, getLocale, Intents, startQuiz } from "../../../utils";
import countries from "../../../utils/countries";

@Intents("AMAZON.YesIntent")
export class YesIntentHandler extends BaseIntentHandler {
  public canHandle(handlerInput: HandlerInput): boolean {
    return super.canHandle(handlerInput) && this.getStateData(handlerInput).nextRegion;
  }

  public async handle(handlerInput: HandlerInput): Promise<Response> {
    const locale = getLocale(handlerInput);
    const region = countries.getRegionByCode(this.getStateData(handlerInput).nextRegion, locale);
    return startQuiz(handlerInput, region);
  }
}
