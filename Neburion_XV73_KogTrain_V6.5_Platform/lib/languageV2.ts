import {
  createLanguageSession as createBaseLanguageSession,
  LANGUAGE_SESSION_LENGTH,
  LANGUAGE_STORAGE_KEY,
  type LanguageMode,
  type LanguageSession,
  type LanguageTask,
} from "@/lib/language";
import {
  difficultyFromEvidence,
  finalizeBalancedSessionTasks,
  readRecentTaskIds,
  shuffled,
  type Difficulty,
} from "@/lib/dynamicTraining";

export { LANGUAGE_SESSION_LENGTH, LANGUAGE_STORAGE_KEY };
export type { LanguageMode, LanguageSession, LanguageTask };

const HISTORY_SCOPE = "language-v4";

function task(
  id: string,
  mode: LanguageMode,
  difficulty: Difficulty,
  prompt: string,
  detail: string,
  correct: string,
  distractors: string[],
  explanation: string,
): LanguageTask {
  const options = shuffled([correct, ...distractors]).slice(0, 4);
  return { id, mode, difficulty, prompt, detail, options, answer: options.indexOf(correct), explanation };
}

const V4_BANK: LanguageTask[] = [
  task("v4-syn-bedacht","synonym",1,"Welches Wort bedeutet fast dasselbe wie „bedacht“?","Wähle die treffendste Bedeutung.","überlegt",["hastig","laut","zufällig"],"Bedacht bedeutet überlegt und mit Umsicht."),
  task("v4-syn-robust","synonym",2,"Welches Wort kommt „robust“ am nächsten?","Achte auf die Bedeutung im allgemeinen Sprachgebrauch.","widerstandsfähig",["zerbrechlich","flüchtig","unklar"],"Robust bezeichnet etwas Belastbares oder Widerstandsfähiges."),
  task("v4-syn-konsistent","synonym",3,"Welches Wort ist ein gutes Synonym für „konsistent“?","Wähle die präziseste Bedeutung.","widerspruchsfrei",["sprunghaft","mehrdeutig","zufällig"],"Konsistent bedeutet in sich stimmig und widerspruchsfrei."),
  task("v4-syn-differenziert","synonym",3,"Was bedeutet „differenziert“ am ehesten?","Achte auf den argumentativen Kontext.","nuanciert",["vereinfacht","ungeprüft","gleichförmig"],"Differenziert bedeutet fein unterschieden oder nuanciert."),

  task("v4-ant-stabil","antonym",1,"Was ist das Gegenteil von „stabil“?","Finde das passende Gegenwort.","instabil",["fest","ruhig","tragfähig"],"Instabil ist das direkte Gegenwort zu stabil."),
  task("v4-ant-transparent","antonym",2,"Welches Wort steht „transparent“ im übertragenen Sinn gegenüber?","Gemeint ist Nachvollziehbarkeit.","undurchsichtig",["sichtbar","offen","klar"],"Undurchsichtig bezeichnet einen schwer nachvollziehbaren Sachverhalt."),
  task("v4-ant-konvergent","antonym",3,"Was ist das begriffliche Gegenteil von „konvergent“?","Wähle das fachlich passende Gegenstück.","divergent",["parallel","kohärent","linear"],"Konvergent bedeutet zusammenlaufend, divergent auseinanderlaufend."),
  task("v4-ant-rigide","antonym",3,"Welches Wort steht „rigide“ am stärksten entgegen?","Achte auf die Bedeutung von starr/unflexibel.","flexibel",["streng","fest","konstant"],"Flexibel ist das semantische Gegenstück zu rigide."),

  task("v4-ana-karte","analogy",1,"Karte : Orientierung = Wörterbuch : ?","Werkzeug und Hauptfunktion.","Bedeutung",["Entfernung","Gewicht","Temperatur"],"Eine Karte unterstützt Orientierung, ein Wörterbuch beim Ermitteln von Bedeutungen."),
  task("v4-ana-architekt","analogy",2,"Architekt : Gebäude = Autor : ?","Person und geschaffenes Werk.","Text",["Papier","Leser","Drucker"],"Ein Architekt entwirft Gebäude, ein Autor verfasst Texte."),
  task("v4-ana-indiz","analogy",3,"Indiz : Schlussfolgerung = Symptom : ?","Hinweis und daraus abgeleitete Deutung.","Diagnose",["Therapie","Zufall","Messgerät"],"Ein Symptom kann wie ein Indiz als Grundlage einer Diagnose dienen."),
  task("v4-ana-prämisse","analogy",3,"Prämisse : Argument = Fundament : ?","Bestandteil mit tragender Funktion.","Gebäude",["Fenster","Farbe","Werkzeug"],"Prämissen tragen ein Argument, wie ein Fundament ein Gebäude trägt."),

  task("v4-cat-legierungen","category",1,"Messing, Bronze und Stahl gehören zu …","Finde den passenden Oberbegriff.","Metallwerkstoffen",["Kunststoffen","Gasgemischen","Textilien"],"Alle drei sind metallische Werkstoffe bzw. Legierungen/Stähle."),
  task("v4-cat-konjunktionen","category",2,"„obwohl“, „weil“ und „während“ sind …","Bestimme die grammatische Kategorie.","Konjunktionen",["Adjektive","Pronomen","Interjektionen"],"Diese Wörter verbinden Satzteile oder Nebensätze."),
  task("v4-cat-methoden","category",3,"Induktion, Deduktion und Abduktion sind Formen von …","Finde den präzisesten Oberbegriff.","Schlussverfahren",["Zeitformen","Messskalen","Stilmitteln"],"Alle drei sind logische bzw. wissenschaftliche Schlussverfahren."),
  task("v4-cat-semantik","category",3,"Synonymie, Antonymie und Polysemie sind Phänomene der …","Finde die fachlich passendste Kategorie.","Semantik",["Phonetik","Orthografie","Metrik"],"Sie betreffen Bedeutungsbeziehungen zwischen Wörtern."),

  task("v4-field-planung","wordfield",1,"Welches Wort gehört am wenigsten zum Wortfeld „Planung“?","Finde den Ausreißer.","verdampfen",["organisieren","priorisieren","terminieren"],"Verdampfen gehört nicht zum semantischen Feld Planung."),
  task("v4-field-begruenden","wordfield",2,"Welcher Begriff passt am wenigsten zu „begründen“?","Drei Begriffe stehen für argumentatives Stützen.","verzieren",["belegen","erläutern","rechtfertigen"],"Verzieren hat keine argumentative Funktion."),
  task("v4-field-erkenntnis","wordfield",3,"Welcher Begriff gehört am wenigsten zum Wortfeld „Erkenntnisgewinn“?","Achte auf die begriffliche Nähe.","Dekoration",["Analyse","Beobachtung","Hypothese"],"Dekoration trägt nicht primär zum Erkenntnisgewinn bei."),
  task("v4-field-kohärenz","wordfield",3,"Welches Wort passt am wenigsten zum Feld „Zusammenhang/Kohärenz“?","Finde den semantischen Fremdkörper.","Isolation",["Verknüpfung","Konsistenz","Bezug"],"Isolation steht eher für Trennung als für Zusammenhang."),

  task("v4-sent-ziel","sentence",1,"Welche Fortsetzung ist logisch?","Sie überprüfte den Termin noch einmal, damit …","kein Missverständnis entstand",["der Kalender schwerer wurde","Zeit rückwärts lief","die Zahl schlief"],"Die Kontrolle dient plausibel dazu, Missverständnisse zu vermeiden."),
  task("v4-sent-einschraenkung","sentence",2,"Welche Ergänzung erhält die Einschränkung korrekt?","Die Methode ist schnell, allerdings …","nicht in jedem Fall zuverlässig",["deshalb immer fehlerfrei","ohne jede Bedingung perfekt","und Geschwindigkeit ist eine Farbe"],"„Allerdings“ kündigt eine Einschränkung oder Gegenposition an."),
  task("v4-sent-konzession","sentence",3,"Welche Fortsetzung bildet eine korrekte Konzession?","Selbst wenn die Daten vollständig sind, …","müssen sie noch interpretiert werden",["entfällt jede Analyse automatisch","ist jede Schlussfolgerung wahr","kann kein Kontext existieren"],"Vollständige Daten ersetzen nicht die Interpretation."),
  task("v4-sent-inferenz","sentence",3,"Welche Ergänzung folgt logisch aus der Aussage?","Die Messung wurde dreimal unter denselben Bedingungen wiederholt und ergab jedes Mal denselben Wert; daher …","spricht das für eine gute Reproduzierbarkeit",["ist die Theorie endgültig bewiesen","sind Messfehler unmöglich","wird jede andere Messung identisch sein"],"Wiederholbare Ergebnisse sprechen für Reproduzierbarkeit, nicht für absolute Gewissheit."),

  task("v4-rel-schaltplan","relation",1,"Schaltplan verhält sich zu Stromkreis wie Bauplan zu …","Darstellung und dargestelltes System.","Gebäude",["Werkzeug","Farbe","Material"],"Beide Pläne bilden die Struktur eines Systems ab."),
  task("v4-rel-daten","relation",2,"Daten verhalten sich zu Analyse wie Zutaten zu …","Ausgangsmaterial und Verarbeitung.","Rezept/Zubereitung",["Verpackung","Küche","Preis"],"Daten werden analysiert, Zutaten werden verarbeitet bzw. zubereitet."),
  task("v4-rel-prämisse","relation",3,"Prämisse verhält sich zu Schlussfolgerung wie Befund zu …","Grundlage und daraus abgeleitetes Ergebnis.","Diagnose",["Werkzeug","Messung","Zufall"],"Ein Befund kann Grundlage einer Diagnose sein wie eine Prämisse einer Schlussfolgerung."),
  task("v4-rel-modell","relation",3,"Modell verhält sich zu Wirklichkeit wie Karte zu …","Abbildung und abgebildeter Gegenstand.","Gebiet",["Kompass","Papier","Maßstab"],"Ein Modell repräsentiert Wirklichkeit, eine Karte ein Gebiet."),

  task("v4-ctx-laden","context",1,"Was bedeutet „laden“ in diesem Satz?","Bitte lade die Datei auf den Server.","übertragen",["mit Energie versorgen","einladen","Gewicht auflegen"],"Im IT-Kontext bedeutet hochladen, Daten zu übertragen."),
  task("v4-ctx-fassen","context",2,"Was bedeutet „fassen“ hier?","Der Bericht fasst die Ergebnisse in drei Punkten zusammen.","komprimiert darstellen",["mit der Hand greifen","festnehmen","einen Behälter füllen"],"Im Kontext bedeutet zusammenfassen, Inhalte verdichtet darzustellen."),
  task("v4-ctx-scharf","context",3,"Welche Bedeutung hat „scharf“ in diesem Satz?","Die Kritik an der Entscheidung fiel ungewöhnlich scharf aus.","heftig/deutlich",["gut geschliffen","stark gewürzt","hoch aufgelöst"],"Hier beschreibt „scharf“ die Intensität der Kritik."),
  task("v4-ctx-tragen2","context",3,"Was bedeutet „tragen“ in diesem Satz?","Mehrere Faktoren tragen zum Ergebnis bei.","beitragen",["transportieren","stützen","Kleidung anhaben"],"In diesem Kontext bedeutet tragen zu: einen Beitrag leisten."),
];

function scoreForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 1) return 0;
  if (difficulty === 2) return 5;
  return 7;
}

export function createLanguageSession(
  bestScore: number,
  recentIds: string[] = [],
  completedSessions = 0,
): LanguageSession {
  const percent = Math.round((bestScore / LANGUAGE_SESSION_LENGTH) * 100);
  const difficulty = difficultyFromEvidence({ percent, attempts: completedSessions * LANGUAGE_SESSION_LENGTH });
  const sharedHistory = readRecentTaskIds(HISTORY_SCOPE, 144);
  const mergedHistory = [...new Set([...recentIds, ...sharedHistory])].slice(-144);
  const base = createBaseLanguageSession(scoreForDifficulty(difficulty), mergedHistory);
  const eligibleV4 = V4_BANK.filter((item) => item.difficulty <= difficulty && !mergedHistory.includes(item.id));
  const fallbackV4 = V4_BANK.filter((item) => item.difficulty <= difficulty);
  const candidates = [...base.tasks, ...(eligibleV4.length >= LANGUAGE_SESSION_LENGTH ? eligibleV4 : fallbackV4)];
  const tasks = finalizeBalancedSessionTasks(HISTORY_SCOPE, candidates, LANGUAGE_SESSION_LENGTH, 144);
  return { ...base, difficulty, tasks };
}
