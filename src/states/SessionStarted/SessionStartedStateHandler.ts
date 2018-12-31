import { HandlerInput, RequestHandler } from "ask-sdk-core";
import { AmazonHelpIntentHandler } from "../../handlers";
import { State, StateHandler, States } from "../../utils";
import {
  FallbackHandler,
  LaunchRequestHandler,
  NoIntentHandler,
  QuizIntentHandler,
  YesIntentHandler,
} from "./handlers";

@State(States.SessionStarted)
export class SessionStartedStateHandler extends StateHandler {
  public canHandle(handlerInput: HandlerInput): boolean {
    const newSession = handlerInput.requestEnvelope.session && handlerInput.requestEnvelope.session.new;
    if (newSession) {
      this.setState(handlerInput, States.SessionStarted);
    }

    return super.canHandle(handlerInput);
  }

  public get handlers(): RequestHandler[] {
    return [
      new QuizIntentHandler(),
      new LaunchRequestHandler(),
      new YesIntentHandler(),
      new NoIntentHandler(),
      new AmazonHelpIntentHandler(),
      new FallbackHandler(),
    ];
  }
}
