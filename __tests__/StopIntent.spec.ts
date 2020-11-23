import AWS = require("aws-sdk");
import { VirtualAlexa } from "virtual-alexa";
import { handler } from "../src";

describe("AMAZON.StopIntent, AMAZON.CancelIntent", () => {
  let alexa: VirtualAlexa;
  beforeEach(() => {
    alexa = VirtualAlexa.Builder()
      .handler(handler)
      .interactionModelFile("models/de-DE.json")
      .create();
    alexa.dynamoDB().mock();
  });

  it("StopIntent ends session", async () => {
    const result: any = await alexa.utter("stop");
    expect(result.response.outputSpeech.ssml).toContain("Bis bald");
    expect(result.response.shouldEndSession).toBe(true);
  });

  it("CancelIntent ends session", async () => {
    const result: any = await alexa.utter("cancel");
    expect(result.response.outputSpeech.ssml).toContain("Bis bald");
    expect(result.response.shouldEndSession).toBe(true);
  });
});
