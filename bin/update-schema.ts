import { CountryData } from "@corux/country-data";
import * as program from "commander";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import countries from "../src/utils/countries";

program
  .option("--file <path>", "Schema file to update.")
  .option("--lang <code>", "Language code to use")
  .parse(process.argv);

const file = program.file;
const lang = program.lang;

const schema = JSON.parse(fs.readFileSync(file).toString());
const all = countries.getAll(lang);

const countryOutput: any = {
  name: "COUNTRY",
};
countryOutput.values = all.filter((country) => country && country.iso3 && country.name)
  .map((country) => {
    let synonyms = [].concat(
      country.longName !== country.name ? [country.longName] : [],
      country.altNames || [],
    ).filter((n) => !!n);
    synonyms = synonyms.filter((n, i) => synonyms.indexOf(n) === i);
    return {
      iso3: country.iso3,
      name: country.name,
      synonyms: synonyms.length ? synonyms : undefined,
    };
  })
  .map((country) => ({
    id: country.iso3,
    name: {
      value: country.name,
      // tslint:disable-next-line:object-literal-sort-keys
      synonyms: country.synonyms,
    },
  }));

const continentOutput: any = {
  name: "CONTINENT",
};
continentOutput.values = new CountryData(lang).getContinents()
  .map((region) => ({
    id: region.code,
    name: {
      value: region.name,
    },
  }));

schema.interactionModel.languageModel.types = [continentOutput, countryOutput];

const schemaFile = path.join(process.cwd(), file);
fs.writeFile(schemaFile, JSON.stringify(schema, null, 2), "utf8", (err) => {
  if (err) {
    process.exit(1);
  }
});
