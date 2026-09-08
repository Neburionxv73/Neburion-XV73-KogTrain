import type { PlatformLanguage } from "@/components/PlatformLanguageProvider";
import { localizeTrainingText } from "@/lib/trainingLocale";

const answers: Record<string,string> = {
  "identisch":"identical","eine Position anders":"one position differs","umgekehrte Reihenfolge":"reversed order","nur die Größe ist anders":"only the size differs",
  "oben links":"top left","oben Mitte":"top center","oben rechts":"top right","Mitte links":"middle left","Mitte":"center","Mitte rechts":"middle right","unten links":"bottom left","unten Mitte":"bottom center","unten rechts":"bottom right",
  "hören":"hearing","laufen":"walking","greifen":"grasping","riechen":"smelling","Konto":"account","Tisch":"table","Fenster":"window","Stift":"pen","Film":"film","Karte":"map","Stuhl":"chair","Wolke":"cloud","Zeit":"time","Gewicht":"weight","Länge":"length","Lautstärke":"volume","Lösung":"solution","Pause":"break","Farbe":"color","Geräusch":"sound","Musikstück":"piece of music","Gebäude":"building","Landkarte":"map","Werkzeug":"tool","Satz":"sentence","Ton":"tone","Zahl":"number","Datum":"date","Tonhöhe":"pitch","Antwort":"answer","Geruch":"smell","Form":"shape","Baum":"tree","Straße":"street","Uhr":"clock","Schiff":"ship","Zug":"train","Fahrrad":"bicycle","Haus":"house","Aufnahme":"recording","Treppe":"stairs",
  "Taro ist ein Luma":"Taro is a Luma","Taro ist kein Luma":"Taro is not a Luma","Alle Luma sind Neri":"All Luma are Neri","Nichts folgt":"Nothing follows",
  "Mira ist nicht schwer":"Mira is not heavy","Mira ist schwer":"Mira is heavy","Alles Leichte ist Selo":"Everything light is Selo","Mira ist rot":"Mira is red",
  "Ria ist nicht träge":"Ria is not sluggish","Ria ist träge":"Ria is sluggish","Ria ist langsam":"Ria is slow","Alle Nicht-Trägen sind Karo":"All non-sluggish beings are Karo",
  "Einige Varo üben":"Some Varo practice","Alle Varo üben":"All Varo practice","Kein Varo übt":"No Varo practice","Alle Übenden sind Musiker":"All who practice are musicians",
  "X ist nicht R":"X is not R","X ist R":"X is R","Alle R sind P":"All R are P","Kein P ist Q":"No P is Q",
  "Einige D sind F":"Some D are F","Alle D sind F":"All D are F","Kein D ist F":"No D are F","Alle F sind E":"All F are E",
  "X ist nicht D":"X is not D","X ist D":"X is D","Alle D sind A":"All D are A","Kein A ist B":"No A is B",
  "Einige H sind nicht L":"Some H are not L","Alle H sind K":"All H are K","Alle L sind H":"All L are H","Kein H ist J":"No H is J",
  "Einige T sind U":"Some T are U","Alle T sind U":"All T are U","Kein T ist U":"No T are U","Alle U sind R":"All U are R",
  "Einige Q sind nicht N":"Some Q are not N","Alle Q sind M":"All Q are M","Einige N sind P":"Some N are P","Alle P sind N":"All P are N",
  "Wie verhalten sich die beiden Formreihen zueinander?":"How do the two shape sequences relate to each other?",
  "Welches Zeichen setzt die visuelle Reihe fort?":"Which symbol continues the visual sequence?",
  "Welches Zeichen ergänzt die Matrix?":"Which symbol completes the matrix?",
};

const rules:Array<[RegExp,string]> = [
  [/Wie zeigt der Pfeil nach (\d+)° Drehung im Uhrzeigersinn\?/g,"Which way does the arrow point after a $1° clockwise rotation?"],
  [/Wie zeigt der Pfeil nach (\d+)° Drehung gegen den Uhrzeigersinn\?/g,"Which way does the arrow point after a $1° counterclockwise rotation?"],
  [/Welcher Pfeil ist die vertikale Spiegelung\?/g,"Which arrow is the vertical reflection?"],
  [/Welcher Pfeil ist die horizontale Spiegelung\?/g,"Which arrow is the horizontal reflection?"],
  [/Welche Form entsteht nach horizontaler Spiegelung\?/g,"Which shape results after horizontal reflection?"],
  [/Welche Form entsteht nach horizontaler und danach vertikaler Spiegelung\?/g,"Which shape results after horizontal and then vertical reflection?"],
  [/Folge den Bewegungen (.+)\. Wo landet der Punkt\?/g,"Follow the movements $1. Where does the dot end up?"],
  [/Finde (.+)\. An welcher Position steht das Ziel\?/g,"Find $1. At which position is the target?"],
  [/Welches Symbol stand an Position (\d+)\?/g,"Which symbol was at position $1?"],
  [/Welches Feld liegt rechts daneben vom markierten Punkt\?/g,"Which cell is directly to the right of the marked point?"],
  [/Welches Feld liegt links daneben vom markierten Punkt\?/g,"Which cell is directly to the left of the marked point?"],
  [/Welches Feld liegt direkt darunter vom markierten Punkt\?/g,"Which cell is directly below the marked point?"],
  [/Welches Feld liegt direkt darüber vom markierten Punkt\?/g,"Which cell is directly above the marked point?"],
  [/Die Drehung erfolgt diesmal gegen den Uhrzeigersinn\. Jede Vierteldrehung entspricht 90 Grad\./g,"This rotation is counterclockwise. Each quarter turn equals 90 degrees."],
  [/Jede Vierteldrehung entspricht 90 Grad im Uhrzeigersinn\./g,"Each quarter turn equals 90 degrees clockwise."],
  [/Links und rechts werden gespiegelt\./g,"Left and right are reflected."],
  [/Zwei Spiegelungen werden nacheinander ausgeführt; die zweite arbeitet mit dem bereits gespiegelten Ergebnis\./g,"Two reflections are applied in sequence; the second uses the already reflected result."],
  [/Die Formen wiederholen sich in einer festen zyklischen Reihenfolge\./g,"The shapes repeat in a fixed cyclic sequence."],
  [/Die beiden Formen wechseln sich regelmäßig ab\./g,"The two shapes alternate regularly."],
  [/Jede Zeile verschiebt die Drei-Symbol-Folge um eine Position\./g,"Each row shifts the three-symbol sequence by one position."],
  [/Die Bewegungen werden nacheinander im 3×3-Raster ausgeführt\./g,"The movements are applied one after another in the 3×3 grid."],
  [/Ein einzelner Zielreiz unterscheidet sich von den Distraktoren\./g,"A single target stimulus differs from the distractors."],
  [/Vergleiche Position, Reihenfolge und Form beider Reihen systematisch\./g,"Compare the position, order and shape of both sequences systematically."],
  [/Die Aufgabe prüft den kurzfristigen Abruf einer zuvor gezeigten Symbolfolge\./g,"This task tests short-term recall of a previously shown symbol sequence."],
  [/Die Lösung entsteht aus der räumlichen Beziehung zum Ausgangsfeld, nicht aus einer Bewegungsfolge\./g,"The solution comes from the spatial relation to the starting cell, not from a movement sequence."],
];

export function localizeSessionText(value:string|undefined, language:PlatformLanguage):string {
  if(!value || language==="de") return value ?? "";
  const mapped = answers[value];
  if(mapped) return mapped;
  let out = value;
  for(const [pattern,replacement] of rules) out=out.replace(pattern,replacement);
  out = localizeTrainingText(out,language);
  return out;
}
