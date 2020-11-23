import { RequestHandler } from "ask-sdk-core";
import { AmazonHelpIntentHandler } from "../../handlers";
import { State, StateHandler, States } from "../../utils";
import {
  FallbackHandler,
  InfoIntentHandler,
  NoIntentHandler,
  QuizIntentHandler,
  YesIntentHandler,
} from "./handlers";

@State(States.QuizFinished)
export class QuizFinishedStateHandler extends StateHandler {
  public get handlers(): RequestHandler[] {
    return [
      new NoIntentHandler(),
      new YesIntentHandler(),
      new QuizIntentHandler(),
      new InfoIntentHandler(),
      new AmazonHelpIntentHandler(),
      new FallbackHandler(),
    ];
  }
}
