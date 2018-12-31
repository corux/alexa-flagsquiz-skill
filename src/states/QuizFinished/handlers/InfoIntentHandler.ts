import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { BaseIntentHandler, Intents, ISessionAttributes } from "../../../utils";

@Intents("InfoIntent")
export class InfoIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
    const reprompt = `Bist du bereit für die nächste Runde?`;
    let textVal = "";
    if (attributes.round > 0) {
      const round = attributes.round === 1 ? "eine" : attributes.round;
      textVal = `Du hast bereits ${round} Runde${attributes.round > 1 ? "n" : ""} gespielt.`;
    }
    return handlerInput.responseBuilder
      .speak(`${textVal} ${reprompt}`)
      .reprompt(reprompt)
      .getResponse();
  }
}
