import { VirtualAlexa } from "virtual-alexa";
import { handler } from "../src";

describe("LaunchRequest", () => {
  let alexa: VirtualAlexa;
  beforeEach(() => {
    alexa = VirtualAlexa.Builder()
      .handler(handler)
      .interactionModelFile("models/de-DE.json")
      .create();
    alexa.dynamoDB().mock();
  });

  test("Ask to start quiz", async () => {
    const result = await alexa.launch();

    expect(result.response.outputSpeech.ssml).toContain("Bist du bereit für die erste Runde?");
    expect(result.response.shouldEndSession).toBe(false);
  });
});
