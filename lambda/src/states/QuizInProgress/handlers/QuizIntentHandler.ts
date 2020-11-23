import { HandlerInput } from "ask-sdk-core";
import { IntentRequest, Response } from "ask-sdk-model";
import {
  BaseIntentHandler,
  getLocale,
  getSlotValue,
  Intents,
} from "../../../utils";
import countries from "../../../utils/countries";

@Intents("QuizIntent")
export class QuizIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    const data = this.getStateData(handlerInput);
    const region = this.getRegion(handlerInput);
    data.nextRegion = region ? region.code : "ALL";

    const regionText = region ? `mit Ländern aus ${region.name}` : "";
    const reprompt = `Möchtest du trotzdem eine neue Runde ${regionText} starten?`;
    return handlerInput.responseBuilder
      .speak(`Die aktuelle Runde ist noch nicht beendet. ${reprompt}`)
      .reprompt(reprompt)
      .getResponse();
  }

  private getRegion(handlerInput: HandlerInput) {
    const regionValue = getSlotValue(
      (handlerInput.requestEnvelope.request as IntentRequest).intent.slots
        .region
    );
    const locale = getLocale(handlerInput);

    const region = countries.getRegionByCode(regionValue, locale);
    return region;
  }
}
