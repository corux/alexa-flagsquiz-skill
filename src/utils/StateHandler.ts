import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { States } from ".";
import { StateManagement } from "./StateManagement";

export function State(state: States) {
  return <T extends StateHandler>(target: new () => T) => {
    target.prototype.state = state;
  };
}

export abstract class StateHandler extends StateManagement implements RequestHandler {
  private readonly state: States;

  public abstract get handlers(): RequestHandler[];

  public canHandle(handlerInput: HandlerInput): boolean {
    return this.getState(handlerInput) === this.state;
  }

  public async handle(handlerInput: HandlerInput): Promise<Response> {
    for (const handler of this.handlers) {
      if (handler.canHandle(handlerInput)) {
        return handler.handle(handlerInput);
      }
    }
  }
}
