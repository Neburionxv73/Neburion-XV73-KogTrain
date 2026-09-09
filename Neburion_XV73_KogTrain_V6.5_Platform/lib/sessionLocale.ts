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
  "Reagiere nur, wenn der gezeigte Reiz dem Zielreiz entspricht.":"Respond only when the shown stimulus matches the target stimulus.",
  "Reagiere nur, wenn der erste gezeigte Reiz dem Zielreiz entspricht. Der zweite Reiz ist Ablenkung.":"Respond only when the first shown stimulus matches the target stimulus. The second stimulus is a distractor.",
  "Achte auf die aktuelle Regel – nicht auf die Regel der vorherigen Aufgabe.":"Follow the current rule — not the rule from the previous task.",
  "Drei mögliche Regeln wechseln. Prüfe jedes Mal nur die aktuell angezeigte Regel.":"Three possible rules alternate. Each time, follow only the rule currently shown.",
  "Wechsle zwischen den Regeln GEFÜLLT und KONTUR.":"Switch between the FILLED and OUTLINE rules.",
  "Bewerte nur den ersten Reiz nach der aktuell eingeblendeten Merkmalsregel. Der zweite ist Ablenkung.":"Judge only the first stimulus using the currently displayed feature rule. The second is a distractor.",
  "Ähnliche Konturen sind Distraktoren.":"Similar outlines are distractors.",
  "Die zweite Form ist ein Konfliktreiz und darf deine Entscheidung nicht verändern.":"The second shape is a conflicting stimulus and must not change your decision.",
  "Beachte gleichzeitig Farbe und Form.":"Track color and shape at the same time.",
  "Beachte Farbe und Form gleichzeitig; ähnliche Kombinationen liegen bewusst dicht beieinander.":"Track color and shape at the same time; similar combinations are deliberately placed close together.",
  "Verfolge Farbe und Form gleichzeitig. Nur die exakte Kombination zählt.":"Track color and shape simultaneously. Only the exact combination counts.",
  "Ignoriere das geschriebene Farbwort und antworte nach dem Farbsymbol.":"Ignore the written color word and answer according to the color symbol.",
  "Ignoriere beide Wörter und antworte ausschließlich nach dem mittleren Farbsymbol.":"Ignore both words and answer only according to the middle color symbol.",
  "Ignoriere das Richtungswort und antworte nur nach dem Pfeil.":"Ignore the direction word and answer only according to the arrow.",
  "Ignoriere beide Richtungswörter und bewerte nur den mittleren Pfeil.":"Ignore both direction words and judge only the middle arrow.",
  "Alternierendes Go / No-Go":"Alternating Go / No-Go","Paar-Suche":"Pair search","Zahlen-Regelwechsel":"Number rule switching","Stoppsignal":"Stop signal","Doppelbedingung":"Dual condition","Schnellvergleich":"Rapid comparison","Symbol-Wort-Konflikt":"Symbol-word conflict",
  "Die Zielregel wechselt zwischen zwei Reizen. Reagiere nur auf das aktuell aktive Ziel.":"The target rule alternates between two stimuli. Respond only to the currently active target.",
  "Achte auf beide Symbole und ihre Reihenfolge. Vertauschte Paare zählen nicht.":"Track both symbols and their order. Reversed pairs do not count.",
  "Bewerte nur die letzte Zahl nach der eingeblendeten Regel. Vorherige Zahlen dienen als Ablenkung.":"Judge only the last number using the displayed rule. Earlier numbers are distractors.",
  "Reagiere auf den Zielreiz – außer ein Stoppsignal erscheint.":"Respond to the target stimulus unless a stop signal appears.",
  "Das Stoppsignal kann direkt nach dem Zielreiz erscheinen. Hemme dann die vorbereitete Reaktion.":"The stop signal can appear immediately after the target. Inhibit the prepared response when it does.",
  "Ein ✖ hebt die Reaktionsregel sofort auf.":"A ✖ immediately cancels the response rule.",
  "Prüfe Farbe und Zahleneigenschaft gleichzeitig. Beide Bedingungen müssen erfüllt sein.":"Check color and the number property at the same time. Both conditions must be met.",
  "Ignoriere die geschriebenen Richtungen und antworte ausschließlich nach dem Pfeilsymbol.":"Ignore the written directions and answer only according to the arrow symbol.",
  "Welche Seite zeigt die größere Zahl?":"Which side shows the larger number?","Welche Richtung zeigt das Symbol?":"Which direction does the symbol point?",
  "Links":"Left","Rechts":"Right","Gleich":"Equal","OBEN":"UP","UNTEN":"DOWN","LINKS":"LEFT","RECHTS":"RIGHT","Reagieren":"Respond","Ignorieren":"Ignore","Ja":"Yes","Nein":"No","GERADE":"EVEN","UNGERADE":"ODD",
};

type Replacement = string | ((substring:string,...args:string[])=>string);
const rules:Array<[RegExp,Replacement]> = [
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
  [/Für diese Aufgabe galt Regel ([A-C]) mit Zielreiz (.+)\./g,"For this task, rule $1 applied with target stimulus $2."],
  [/^Aktives Ziel: (.+)$/g,"Active target: $1"],
  [/^Wie oft erscheint exakt (.+)\?$/g,"How often does exactly $1 appear?"],
  [/^Das Zielpaar (.+) erscheint (\d+)-mal\.$/g,"The target pair $1 appears $2 times."],
  [/^Aktive Regel: (GERADE|UNGERADE)$/g,(_m,rule)=>`Active rule: ${rule==="GERADE"?"EVEN":"ODD"}`],
  [/^Die letzte Zahl war (\d+); für (GERADE|UNGERADE) ist die richtige Reaktion (Reagieren|Ignorieren)\.$/g,(_m,n,rule,response)=>`The last number was ${n}; for ${rule==="GERADE"?"EVEN":"ODD"} the correct response is ${response==="Reagieren"?"Respond":"Ignore"}.`],
  [/^Passt (.+) zu (.+) \+ (GERADE|UNGERADE)\?$/g,(_m,value,color,rule)=>`Does ${value} match ${color} + ${rule==="GERADE"?"EVEN":"ODD"}?`],
  [/^Farbe (passt|passt nicht); die Zahl (passt|passt nicht) zur Regel (GERADE|UNGERADE)\.$/g,(_m,colorState,numberState,rule)=>`The color ${colorState==="passt"?"matches":"does not match"}; the number ${numberState==="passt"?"matches":"does not match"} the ${rule==="GERADE"?"EVEN":"ODD"} rule.`],
  [/^Vergleiche sofort, ohne nachzurechnen\. Zielzeit: (\d+) ms\.$/g,"Compare immediately without calculating. Target time: $1 ms."],
  [/^(\d+) war die größere Zahl\.$/g,"$1 was the larger number."],
  [/^Entscheidend war (.+), also (LINKS|RECHTS|OBEN|UNTEN)\.$/g,(_m,symbol,direction)=>`The decisive symbol was ${symbol}, so the direction was ${{LINKS:"LEFT",RECHTS:"RIGHT",OBEN:"UP",UNTEN:"DOWN"}[direction]??direction}.`],
  [/^Aktiv war (.+); gezeigt wurde (.+)\.$/g,"The active target was $1; the shown stimulus was $2."],
];

export function localizeSessionText(value:string|undefined, language:PlatformLanguage):string {
  if(!value || language==="de") return value ?? "";
  const mapped = answers[value];
  if(mapped) return mapped;
  let out = value;
  for(const [pattern,replacement] of rules) out = typeof replacement==="string" ? out.replace(pattern,replacement) : out.replace(pattern,replacement);
  out = localizeTrainingText(out,language);
  return out;
}
