import { VirtualAlexa } from "virtual-alexa";
import { handler } from "../src";

describe("AMAZON.HelpIntent", () => {
  let alexa: VirtualAlexa;
  beforeEach(() => {
    alexa = VirtualAlexa.Builder()
      .handler(handler)
      .interactionModelFile("models/de-DE.json")
      .create();
    alexa.dynamoDB().mock();
  });

  it("Provide help message", async () => {
    await alexa.launch();
    const result: any = await alexa.utter("help");
    expect(result.response.outputSpeech.ssml).toContain(
      "dein Wissen über die Länder der Welt testen"
    );
    expect(result.response.shouldEndSession).toBe(false);
  });
});
