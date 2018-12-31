import { RequestHandler } from "ask-sdk-core";
import { State, StateHandler, States } from "../../utils";
import {
  AnswerIntentHandler,
  FallbackHandler,
  InfoIntentHandler,
  NoIntentHandler,
  QuizIntentHandler,
  RepeatIntentHandler,
  SkipIntentHandler,
  YesIntentHandler,
} from "./handlers";

@State(States.QuizInProgress)
export class QuizInProgressStateHandler extends StateHandler {
  public get handlers(): RequestHandler[] {
    return [
      new AnswerIntentHandler(),
      new SkipIntentHandler(),
      new RepeatIntentHandler(),
      new YesIntentHandler(),
      new NoIntentHandler(),
      new InfoIntentHandler(),
      new QuizIntentHandler(),
      new FallbackHandler(),
    ];
  }
}
