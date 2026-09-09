import type { PlatformLanguage } from "@/components/PlatformLanguageProvider";
import { localizeSessionText as baseLocalizeSessionText } from "./sessionLocale";

const exact:Record<string,string>={
  "Ziffernpaar":"Digit pair",
  "Fremdwort erkennen":"Intruder word",
  "Symbolpaar":"Symbol pair",
  "Fehlende Position":"Missing position",
  "Verzögerter Vergleich":"Delayed match",
  "Welches Wort war NICHT in der gezeigten Gruppe?":"Which word was NOT in the shown group?",
  "Welche markierte Position fehlt im zweiten Muster?":"Which marked position is missing from the second pattern?",
  "Merke dir alle markierten Felder. Danach fehlt genau eine Position.":"Remember all marked cells. Afterwards exactly one position is missing.",
};

const rules:Array<[RegExp,string]>=[
  [/^Welche Ziffern standen an Position (\d+) und (\d+)\?$/g,"Which digits were at positions $1 and $2?"],
  [/^Merke dir (\d+) Ziffern\. Danach werden zwei Positionen gleichzeitig abgefragt\.$/g,"Remember $1 digits. Afterwards two positions are queried at the same time."],
  [/^Gesucht waren die Positionen (\d+) und (\d+)\.$/g,"The requested positions were $1 and $2."],
  [/^Merke dir (\d+) Wörter\. Danach erscheint ein Wort, das vorher nicht dabei war\.$/g,"Remember $1 words. Afterwards one word appears that was not shown before."],
  [/^(.+) war das einzige Wort, das nicht in der ursprünglichen Gruppe vorkam\.$/g,"$1 was the only word that did not appear in the original group."],
  [/^Welche Symbole standen an Position (\d+) und (\d+)\?$/g,"Which symbols were at positions $1 and $2?"],
  [/^Merke dir (\d+) Symbole\. Zwei Positionen werden anschließend gemeinsam abgefragt\.$/g,"Remember $1 symbols. Two positions are then queried together."],
  [/^Die gesuchten Symbole waren (.+)\.$/g,"The requested symbols were $1."],
  [/^Gefehlt hat (.+)\.$/g,"The missing position was $1."],
  [/^Ist das letzte Symbol identisch mit dem Symbol (\d+) Positionen davor\?$/g,"Is the last symbol identical to the symbol $1 positions earlier?"],
  [/^Beobachte (\d+) Symbole und halte einen längeren Abstand aktiv im Arbeitsgedächtnis\.$/g,"Observe $1 symbols and keep a longer interval active in working memory."],
  [/^Verglichen wird das letzte Symbol mit dem Element (\d+) Positionen davor\.$/g,"The last symbol is compared with the element $1 positions earlier."],
];

export function localizeSessionText(value:string|undefined,language:PlatformLanguage):string{
  if(!value||language==="de")return value??"";
  const direct=exact[value];
  if(direct)return direct;
  let out=value;
  for(const [pattern,replacement] of rules)out=out.replace(pattern,replacement);
  return baseLocalizeSessionText(out,language);
}
