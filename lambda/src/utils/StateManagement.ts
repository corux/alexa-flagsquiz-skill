import { HandlerInput } from "ask-sdk-core";
import { ISessionAttributes, States } from ".";

export abstract class StateManagement {
  public getState(handlerInput: HandlerInput): States {
    const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
    return attributes.state;
  }

  public setState(handlerInput: HandlerInput, state: States) {
    const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
    attributes.state = state;
  }

  public getStateData(handlerInput: HandlerInput): any {
    const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
    const state = attributes.state.toString();
    if (!attributes.stateData) {
      attributes.stateData = {};
    }
    if (!attributes.stateData[state]) {
      attributes.stateData[state] = {};
    }

    return attributes.stateData[state];
  }
}
