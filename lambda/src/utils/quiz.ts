import { ContinentCode, IContinent, ICountry } from "@corux/country-data";
import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { ISessionAttributes } from "./attributes";
import countries from "./countries";
import { getLocale } from "./request";
import { States } from "./State";

export interface IQuestion {
  iso: string;
  type: "continent" | "capital" | "neighbour";
  answer: string;
}

export function getNumberOfQuestions(): number {
  return 8;
}

export function getRandomEntry<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffle<T>(array: T[]): T[] {
  let m = array.length;

  // While there remain elements to shuffle
  while (m) {
    // Pick a remaining element
    const i = Math.floor(Math.random() * m--);

    // And swap it with the current element
    const t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function createContinentQuestions(
  allCountries: ICountry[],
  num: number
): IQuestion[] {
  const knownCountries = allCountries.filter((item) => item.region);
  const selected = shuffle(knownCountries).slice(0, num);

  const questions = selected.map(
    (item) =>
      ({
        iso: item.iso3,
        type: "continent",
      } as IQuestion)
  );

  return questions;
}

function createNeighbourQuestions(
  allCountries: ICountry[],
  num: number
): IQuestion[] {
  const knownCountries = shuffle(
    allCountries.filter((item) => item.borders.length > 0)
  );
  const selected: ICountry[] = [];
  for (let i = 0; i < knownCountries.length && selected.length < num; i++) {
    const current = knownCountries[i];
    const neighbourAlreadySelected =
      selected
        .reduce((a, b) => a.concat(b.borders), [] as string[])
        .indexOf(current.iso3) !== -1;
    if (!neighbourAlreadySelected) {
      selected.push(current);
    }
  }

  return selected.map(
    (country) =>
      ({
        iso: country.iso3,
        type: "neighbour",
      } as IQuestion)
  );
}

function createCapitalQuestions(
  allCountries: ICountry[],
  num: number,
  region?: ContinentCode
): IQuestion[] {
  const knownCountries = allCountries.filter(
    (item) =>
      item.continent.code === (region || ContinentCode.EUROPE) &&
      item.name !== item.capital &&
      item.capital
  );
  const selected = shuffle(knownCountries).slice(0, num);

  return selected.map(
    (country) =>
      ({
        iso: country.iso3,
        type: "capital",
      } as IQuestion)
  );
}

function createQuestions(
  handlerInput: HandlerInput,
  region?: IContinent
): IQuestion[] {
  const locale = getLocale(handlerInput);
  let all = countries.getAll(locale);
  if (region) {
    all = all.filter((item) => item.continent.code === region.code);
  }

  let questions: IQuestion[];
  if (region) {
    questions = [].concat(
      createNeighbourQuestions(all, 7),
      createCapitalQuestions(all, 4, region.code)
    );
  } else {
    questions = [].concat(
      createContinentQuestions(all, 4),
      createNeighbourQuestions(all, 4),
      createCapitalQuestions(all, 3)
    );
  }
  return shuffle(questions).slice(0, getNumberOfQuestions());
}

function questionToText(question: IQuestion, country: ICountry): string {
  switch (question.type) {
    case "capital":
      return `Zu welchem Land gehört die Hauptstadt ${country.capital}?`;
    case "continent":
      return `Auf welchem Kontinent liegt ${country.name}?`;
    case "neighbour":
      return `Nenne ein Nachbarland von ${country.name}.`;
  }
}

export function isAnswerCorrect(question: IQuestion): boolean {
  const country = countries.getByIso3(question.iso, "en-US");
  switch (question.type) {
    case "capital":
      return question.answer === question.iso;
    case "continent":
      return question.answer === country.continent.code;
    case "neighbour":
      return country.borders.indexOf(question.answer) !== -1;
  }
}

export function calculatePoints(questions: IQuestion[]): number {
  const correctAnswers = questions.map(isAnswerCorrect);
  const allAnswersCorrect = correctAnswers.filter((item) => !item).length === 0;

  const pointsForQuestions = correctAnswers
    .map((item) => (item ? 5 : 0))
    .reduce((a, b) => a + b, 0);
  const bonus = allAnswersCorrect ? 10 : 0;

  return pointsForQuestions + bonus;
}

export function getAnswerText(question: IQuestion, locale: string): string {
  const country = countries.getByIso3(question.iso, locale);
  switch (question.type) {
    case "capital":
      return country.name;
    case "continent":
      return countries.getRegionByCode(country.continent.code, locale).name;
    case "neighbour":
      const neighbours = country.borders.map(
        (iso) => countries.getByIso3(iso, locale).name
      );
      if (neighbours.length <= 2) {
        return neighbours.join(" oder ");
      } else {
        return `z.B. ${neighbours.slice(0, 2).join(" oder ")}`;
      }
  }
}

export function getQuestion(
  handlerInput: HandlerInput,
  includeQuestionPrefix: boolean,
  textPrefix?: string
): Response {
  const locale = getLocale(handlerInput);
  const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
  const current = attributes.history.filter((item) => !item.answer)[0];
  const country = countries.getByIso3(current.iso, locale);

  const reprompt = questionToText(current, country);
  let text = `${textPrefix || ""} `;
  if (includeQuestionPrefix) {
    const isFirstQuestion =
      attributes.history.filter((item) => item.answer).length === 0;
    const isLastQuestion =
      attributes.history.filter((item) => !item.answer).length === 1;
    const num = isFirstQuestion
      ? "erste"
      : isLastQuestion
      ? "letzte"
      : "nächste";
    text += `Hier ist die ${num} Frage. `;
  }
  text += reprompt;

  const response = handlerInput.responseBuilder.speak(text).reprompt(reprompt);

  return response.getResponse();
}

export function startQuiz(
  handlerInput: HandlerInput,
  region?: IContinent
): Response {
  const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;

  attributes.state = States.QuizInProgress;
  attributes.region = region ? region.code : undefined;
  attributes.history = createQuestions(handlerInput, region);

  const text = region
    ? `Das Quiz wird mit Ländern aus ${region.name} gestartet.`
    : "";
  return getQuestion(handlerInput, true, text);
}
