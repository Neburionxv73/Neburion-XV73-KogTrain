import type { PlatformLanguage } from "@/components/PlatformLanguageProvider";
import { localizeTrainingText } from "@/lib/trainingLocale";

const answers: Record<string,string> = {
  "identisch":"identical",
  "eine Position anders":"one position differs",
  "umgekehrte Reihenfolge":"reversed order",
  "nur die Größe ist anders":"only the size differs",
  "oben links":"top left",
  "oben Mitte":"top center",
  "oben rechts":"top right",
  "Mitte links":"middle left",
  "Mitte":"center",
  "Mitte rechts":"middle right",
  "unten links":"bottom left",
  "unten Mitte":"bottom center",
  "unten rechts":"bottom right",
  "hören":"hearing",
  "Konto":"account",
  "Film":"film",
  "Zeit":"time",
  "Lösung":"solution",
  "Musikstück":"piece of music",
  "Satz":"sentence",
  "Datum":"date",
  "Antwort":"answer",
  "Baum":"tree",
  "Schiff":"ship",
  "Aufnahme":"recording",
  "Taro ist ein Luma":"Taro is a Luma",
  "Mira ist nicht schwer":"Mira is not heavy",
  "Ria ist nicht träge":"Ria is not sluggish",
  "Einige Varo üben":"Some Varo practice",
  "X ist nicht R":"X is not R",
  "Einige D sind F":"Some D are F",
  "X ist nicht D":"X is not D",
  "Einige H sind nicht L":"Some H are not L",
  "Einige T sind U":"Some T are U",
  "Einige Q sind nicht N":"Some Q are not N",
};

export function localizeSessionText(value:string|undefined, language:PlatformLanguage):string {
  if(!value || language==="de") return value ?? "";
  const mapped = answers[value];
  if(mapped) return mapped;
  return localizeTrainingText(value,language);
}
