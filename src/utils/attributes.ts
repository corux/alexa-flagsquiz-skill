import { IQuestion, States } from ".";

export interface ISessionAttributes {
  round: number;
  history: IQuestion[];
  status: "PLAYING" | "STOPPED";
  state: States;
  stateData: { [key: string]: any };
  region?: string;
  nextRegion?: string;
}

export interface IPersistentAttributes {
  lastAccess: number;
  scores: Array<{ time: number, total: number, correct: number, region: string, points: number }>;
}
