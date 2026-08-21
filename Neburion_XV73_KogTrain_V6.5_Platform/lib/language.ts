import { difficultyFromPercent, shuffled, type Difficulty } from "@/lib/dynamicTraining";

export type LanguageMode = "synonym" | "antonym" | "analogy" | "category" | "wordfield" | "sentence" | "relation" | "context";
export type LanguageTask = {
  id: string;
  mode: LanguageMode;
  difficulty: Difficulty;
  prompt: string;
  detail: string;
  options: string[];
  answer: number;
  explanation: string;
};
export type LanguageSession = { difficulty: Difficulty; tasks: LanguageTask[] };
export const LANGUAGE_SESSION_LENGTH = 8;
export const LANGUAGE_STORAGE_KEY = "neburion-v65-language-stats-v3";

const bank: LanguageTask[] = [
  { id:"syn-ruhig", mode:"synonym", difficulty:1, prompt:"Welches Wort bedeutet fast dasselbe wie „ruhig“?", detail:"Wähle die ähnlichste Bedeutung.", options:["gelassen","laut","eilig","grell"], answer:0, explanation:"Gelassen beschreibt einen ruhigen, ausgeglichenen Zustand." },
  { id:"syn-praezise", mode:"synonym", difficulty:1, prompt:"Welches Wort passt am besten zu „präzise“?", detail:"Finde die ähnlichste Bedeutung.", options:["genau","zufällig","unsicher","laut"], answer:0, explanation:"Präzise bedeutet genau oder sehr treffend." },
  { id:"syn-komplex", mode:"synonym", difficulty:2, prompt:"Welches Wort kommt „komplex“ am nächsten?", detail:"Achte auf die Bedeutung.", options:["vielschichtig","einfach","leer","kurz"], answer:0, explanation:"Komplex bezeichnet etwas Vielschichtiges oder schwer Überschaubares." },
  { id:"syn-sukzessive", mode:"synonym", difficulty:3, prompt:"Welches Wort ist ein gutes Synonym für „sukzessive“?", detail:"Wähle die passendste Bedeutung.", options:["schrittweise","gleichzeitig","rückwärts","zufällig"], answer:0, explanation:"Sukzessive bedeutet nach und nach oder schrittweise." },

  { id:"ant-heiss", mode:"antonym", difficulty:1, prompt:"Was ist das Gegenteil von „heiß“?", detail:"Finde das Gegenwort.", options:["kalt","warm","hell","trocken"], answer:0, explanation:"Kalt ist das direkte Gegenwort zu heiß." },
  { id:"ant-mutig", mode:"antonym", difficulty:1, prompt:"Was ist das Gegenteil von „mutig“?", detail:"Wähle das passendste Gegenwort.", options:["ängstlich","kräftig","schnell","freundlich"], answer:0, explanation:"Ängstlich steht semantisch im Gegensatz zu mutig." },
  { id:"ant-knapp", mode:"antonym", difficulty:2, prompt:"Welches Wort steht „knapp“ im Sinn von „wenig vorhanden“ gegenüber?", detail:"Achte auf den Kontext.", options:["reichlich","eng","kurz","dicht"], answer:0, explanation:"Reichlich bedeutet, dass von etwas viel vorhanden ist." },
  { id:"ant-implizit", mode:"antonym", difficulty:3, prompt:"Welches Wort ist das Gegenteil von „implizit“?", detail:"Finde das begriffliche Gegenstück.", options:["explizit","indirekt","verdeckt","ungeklärt"], answer:0, explanation:"Explizit bedeutet ausdrücklich; implizit bedeutet nur mitgemeint." },

  { id:"ana-hand", mode:"analogy", difficulty:1, prompt:"Hand verhält sich zu Finger wie Fuß zu …", detail:"Ergänze die Beziehung.", options:["Zehe","Knie","Arm","Schulter"], answer:0, explanation:"Finger sind Teil der Hand, Zehen Teil des Fußes." },
  { id:"ana-vogel", mode:"analogy", difficulty:1, prompt:"Vogel verhält sich zu fliegen wie Fisch zu …", detail:"Ergänze die typische Tätigkeit.", options:["schwimmen","laufen","graben","klettern"], answer:0, explanation:"Fliegen ist typisch für Vögel, Schwimmen für Fische." },
  { id:"ana-buch", mode:"analogy", difficulty:2, prompt:"Buch : lesen = Musik : ?", detail:"Gegenstand und typische Tätigkeit.", options:["hören","tragen","sehen","zeichnen"], answer:0, explanation:"Ein Buch wird gelesen, Musik wird gehört." },
  { id:"ana-thermometer", mode:"analogy", difficulty:3, prompt:"Thermometer : Temperatur = Waage : ?", detail:"Instrument und Messgröße.", options:["Gewicht","Länge","Zeit","Helligkeit"], answer:0, explanation:"Ein Thermometer misst Temperatur, eine Waage Gewicht." },

  { id:"cat-baeume", mode:"category", difficulty:1, prompt:"Welcher Oberbegriff passt zu Eiche, Buche und Ahorn?", detail:"Finde die gemeinsame Kategorie.", options:["Bäume","Blumen","Gräser","Moose"], answer:0, explanation:"Eiche, Buche und Ahorn sind Baumarten." },
  { id:"cat-werkzeuge", mode:"category", difficulty:1, prompt:"Hammer, Säge und Zange gehören zu …", detail:"Finde den Oberbegriff.", options:["Werkzeugen","Getränken","Möbeln","Tieren"], answer:0, explanation:"Alle drei sind Werkzeuge." },
  { id:"cat-emotionen", mode:"category", difficulty:2, prompt:"Freude, Angst und Ärger sind …", detail:"Finde die gemeinsame Kategorie.", options:["Emotionen","Farben","Materialien","Berufe"], answer:0, explanation:"Freude, Angst und Ärger sind emotionale Zustände." },
  { id:"cat-abstrakt", mode:"category", difficulty:3, prompt:"Demokratie, Monarchie und Diktatur sind Formen von …", detail:"Finde den präzisesten Oberbegriff.", options:["Herrschaftssystemen","Wirtschaftsgütern","Sprachfamilien","Naturgesetzen"], answer:0, explanation:"Alle drei bezeichnen politische Herrschafts- oder Regierungssysteme." },

  { id:"field-sprechen", mode:"wordfield", difficulty:1, prompt:"Welches Wort gehört am wenigsten zum Wortfeld „sprechen“?", detail:"Finde den Ausreißer.", options:["zeichnen","flüstern","rufen","erzählen"], answer:0, explanation:"Zeichnen beschreibt keine Form des Sprechens." },
  { id:"field-licht", mode:"wordfield", difficulty:1, prompt:"Welches Wort passt nicht zum Wortfeld „Licht“?", detail:"Finde den Ausreißer.", options:["schweigen","leuchten","strahlen","glänzen"], answer:0, explanation:"Schweigen beschreibt keinen Lichteindruck." },
  { id:"field-bewegen", mode:"wordfield", difficulty:2, prompt:"Welches Verb gehört am wenigsten zu „Fortbewegung“?", detail:"Drei Wörter bezeichnen Bewegung.", options:["überlegen","rennen","kriechen","gleiten"], answer:0, explanation:"Überlegen beschreibt einen Denkprozess, keine Fortbewegung." },
  { id:"field-kommunikation", mode:"wordfield", difficulty:3, prompt:"Welcher Begriff gehört am wenigsten zum semantischen Feld „Kommunikation“?", detail:"Achte auf die begriffliche Nähe.", options:["Verdunstung","Dialog","Mitteilung","Rückmeldung"], answer:0, explanation:"Verdunstung ist ein physikalischer Prozess und kein Kommunikationsbegriff." },

  { id:"sent-regen", mode:"sentence", difficulty:1, prompt:"Welche Fortsetzung ist am logischsten?", detail:"Obwohl es stark regnete, …", options:["nahm sie einen Regenschirm","wurde Wasser zu Staub","war der Himmel wolkenlos","blieb alles trocken"], answer:0, explanation:"Ein Regenschirm ist eine plausible Reaktion auf starken Regen." },
  { id:"sent-muede", mode:"sentence", difficulty:1, prompt:"Welche Fortsetzung passt am besten?", detail:"Nachdem er die ganze Nacht gearbeitet hatte, …", options:["war er müde","wurde der Boden höher","war gestern morgen","kochte der Schnee"], answer:0, explanation:"Nach einer Nacht Arbeit ist Müdigkeit plausibel." },
  { id:"sent-kontrast", mode:"sentence", difficulty:2, prompt:"Welche Ergänzung erhält den Gegensatz?", detail:"Die Aufgabe war schwierig, dennoch …", options:["löste sie sie vollständig","war sie nie gestellt worden","bestand sie aus Wasser","schlief die Zahl"], answer:0, explanation:"„Dennoch“ kündigt eine Handlung trotz der Schwierigkeit an." },
  { id:"sent-kausal", mode:"sentence", difficulty:3, prompt:"Welche Ergänzung stellt eine korrekte Ursache-Wirkungs-Beziehung her?", detail:"Da die Nachfrage stark stieg, …", options:["erhöhte das Unternehmen die Produktion","wurde gestern rückwärts","verschwand jede Ursache","blieb die Nachfrage unbeachtet und identisch"], answer:0, explanation:"Steigende Nachfrage kann plausibel zu höherer Produktion führen." },

  { id:"rel-schluessel", mode:"relation", difficulty:1, prompt:"Schlüssel verhält sich zu Schloss wie Passwort zu …", detail:"Mittel und Zugang.", options:["Konto","Fenster","Stuhl","Papier"], answer:0, explanation:"Schlüssel und Passwort ermöglichen Zugang zu einem geschützten Bereich." },
  { id:"rel-pinsel", mode:"relation", difficulty:1, prompt:"Pinsel verhält sich zu malen wie Stift zu …", detail:"Werkzeug und Tätigkeit.", options:["schreiben","schlafen","springen","kochen"], answer:0, explanation:"Ein Pinsel dient zum Malen, ein Stift zum Schreiben." },
  { id:"rel-ursache", mode:"relation", difficulty:2, prompt:"Funke verhält sich zu Feuer wie Ursache zu …", detail:"Finde die gleiche Beziehung.", options:["Wirkung","Zufall","Pause","Frage"], answer:0, explanation:"Eine Ursache kann eine Wirkung auslösen, wie ein Funke ein Feuer auslösen kann." },
  { id:"rel-hypothese", mode:"relation", difficulty:3, prompt:"Hypothese verhält sich zu Prüfung wie Behauptung zu …", detail:"Aussage und Überprüfung.", options:["Beleg","Gewohnheit","Farbe","Richtung"], answer:0, explanation:"Eine Behauptung wird durch Belege geprüft oder gestützt." },

  { id:"ctx-bank", mode:"context", difficulty:1, prompt:"Was bedeutet „Bank“ in diesem Satz?", detail:"Sie setzte sich auf die Bank im Park.", options:["Sitzmöbel","Geldinstitut","Flussrand","Werkzeug"], answer:0, explanation:"Im Park bezeichnet Bank hier ein Sitzmöbel." },
  { id:"ctx-schloss", mode:"context", difficulty:1, prompt:"Was bedeutet „Schloss“ hier?", detail:"Das Schloss auf dem Hügel wurde im 17. Jahrhundert erbaut.", options:["Gebäude","Türmechanismus","Getränk","Werkzeug"], answer:0, explanation:"Der Hinweis auf Bauzeit und Hügel zeigt, dass ein Gebäude gemeint ist." },
  { id:"ctx-ziehen", mode:"context", difficulty:2, prompt:"Was bedeutet „ziehen“ in diesem Satz?", detail:"Im Herbst ziehen viele Vögel nach Süden.", options:["wandern","zerren","zeichnen","wiegen"], answer:0, explanation:"Hier bedeutet ziehen, den Aufenthaltsort saisonal zu wechseln." },
  { id:"ctx-tragen", mode:"context", difficulty:3, prompt:"Welche Bedeutung hat „tragen“ in diesem Satz?", detail:"Die Säulen tragen das Dach.", options:["stützen","anziehen","transportieren","ertragen"], answer:0, explanation:"Im baulichen Kontext bedeutet tragen, eine Last zu stützen." }
];

function shuffledTask(task: LanguageTask): LanguageTask {
  const correct = task.options[task.answer];
  const options = shuffled(task.options);
  return { ...task, options, answer: options.indexOf(correct) };
}

export function createLanguageSession(bestScore: number, recentIds: string[] = []): LanguageSession {
  const difficulty = difficultyFromPercent((bestScore / LANGUAGE_SESSION_LENGTH) * 100);
  const modes: LanguageMode[] = ["synonym","antonym","analogy","category","wordfield","sentence","relation","context"];
  const tasks = modes.map((mode) => {
    const eligible = bank.filter((item) => item.mode === mode && item.difficulty <= difficulty);
    const fresh = eligible.filter((item) => !recentIds.includes(item.id));
    const source = fresh.length ? fresh : eligible;
    return shuffledTask(shuffled(source)[0]);
  });
  return { difficulty, tasks: shuffled(tasks) };
}
