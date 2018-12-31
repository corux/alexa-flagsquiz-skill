import { HandlerInput, ResponseInterceptor } from "ask-sdk-core";
import { IPersistentAttributes, ISessionAttributes } from "../utils";

export class InitializeSessionInterceptor implements ResponseInterceptor {
  public async process(handlerInput: HandlerInput): Promise<void> {
    if (handlerInput.requestEnvelope.session.new) {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
      sessionAttributes.round = 0;
      sessionAttributes.stateData = {};

      const attributes = await handlerInput.attributesManager.getPersistentAttributes() as IPersistentAttributes;
      attributes.lastAccess = new Date().getTime();
      handlerInput.attributesManager.savePersistentAttributes();
    }
  }
}
