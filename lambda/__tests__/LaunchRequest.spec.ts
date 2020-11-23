import { VirtualAlexa } from "virtual-alexa";
import { handler } from "../src";

describe("LaunchRequest", () => {
  let alexa: VirtualAlexa;
  beforeEach(() => {
    alexa = VirtualAlexa.Builder()
      .handler(handler)
      .interactionModelFile("skill-package/interactionModels/custom/de-DE.json")
      .create();
    alexa.dynamoDB().mock();
  });

  test("Ask to start quiz", async () => {
    const result = await alexa.launch();

    expect(result.response.outputSpeech.ssml).toContain(
      "Bist du bereit für die erste Runde?"
    );
    expect(result.response.shouldEndSession).toBe(false);
  });

  test("Should provide help message only on first launch", async () => {
    const result1 = await alexa.launch();
    expect(result1.response.outputSpeech.ssml).toContain(
      "Willkommen beim Länder Quiz"
    );

    await alexa.endSession();

    const result2 = await alexa.launch();
    expect(result2.response.outputSpeech.ssml).toContain(
      "Willkommen zurück beim Länder Quiz"
    );
  });
});
