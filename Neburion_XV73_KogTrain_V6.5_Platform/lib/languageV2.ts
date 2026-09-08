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

function task(id:string,mode:LanguageMode,difficulty:Difficulty,prompt:string,detail:string,correct:string,distractors:string[],explanation:string):LanguageTask{
  const options=shuffled([correct,...distractors]).slice(0,4);
  return {id,mode,difficulty,prompt,detail,options,answer:options.indexOf(correct),explanation};
}

const V4_BANK: LanguageTask[] = [
  task("v4-syn-bedacht","synonym",1,"Welches Wort bedeutet fast dasselbe wie „bedacht“?","Wähle die treffendste Bedeutung.","überlegt",["hastig","laut","zufällig"],"Bedacht bedeutet überlegt und mit Umsicht."),
  task("v4-syn-robust","synonym",2,"Welches Wort kommt „robust“ am nächsten?","Achte auf die Bedeutung im allgemeinen Sprachgebrauch.","widerstandsfähig",["zerbrechlich","flüchtig","unklar"],"Robust bezeichnet etwas Belastbares oder Widerstandsfähiges."),
  task("v4-syn-konsistent","synonym",3,"Welches Wort ist ein gutes Synonym für „konsistent“?","Wähle die präziseste Bedeutung.","widerspruchsfrei",["sprunghaft","mehrdeutig","zufällig"],"Konsistent bedeutet in sich stimmig und widerspruchsfrei."),
  task("v4-syn-kontext","synonym",2,"Welches Wort ersetzt „knapp“ hier am besten?","Der Bericht fasst die Ergebnisse knapp zusammen.","kurz",["eng","selten","arm"],"Im Satz bedeutet knapp: kurz und auf das Wesentliche reduziert."),
  task("v4-ant-stabil","antonym",1,"Was ist das Gegenteil von „stabil“?","Finde das passende Gegenwort.","instabil",["fest","ruhig","tragfähig"],"Instabil ist das direkte Gegenwort zu stabil."),
  task("v4-ant-transparent","antonym",2,"Welches Wort steht „transparent“ im übertragenen Sinn gegenüber?","Gemeint ist Nachvollziehbarkeit.","undurchsichtig",["sichtbar","offen","klar"],"Undurchsichtig bezeichnet einen schwer nachvollziehbaren Sachverhalt."),
  task("v4-ant-konvergent","antonym",3,"Was ist das begriffliche Gegenteil von „konvergent“?","Wähle das fachlich passende Gegenstück.","divergent",["parallel","kohärent","linear"],"Konvergent bedeutet zusammenlaufend, divergent auseinanderlaufend."),
  task("v4-ant-kontext","antonym",2,"Welches Wort bildet im Satz den stärksten Gegensatz zu „vorläufig“?","Die Entscheidung ist vorläufig und noch nicht endgültig.","endgültig",["unsicher","kurz","schnell"],"Vorläufig steht hier im direkten Gegensatz zu endgültig."),
  task("v4-ana-karte","analogy",1,"Karte : Orientierung = Wörterbuch : ?","Werkzeug und Hauptfunktion.","Bedeutung",["Entfernung","Gewicht","Temperatur"],"Eine Karte unterstützt Orientierung, ein Wörterbuch beim Ermitteln von Bedeutungen."),
  task("v4-ana-architekt","analogy",2,"Architekt : Gebäude = Autor : ?","Person und geschaffenes Werk.","Text",["Papier","Leser","Drucker"],"Ein Architekt entwirft Gebäude, ein Autor verfasst Texte."),
  task("v4-ana-indiz","analogy",3,"Indiz : Schlussfolgerung = Symptom : ?","Hinweis und daraus abgeleitete Deutung.","Diagnose",["Therapie","Zufall","Messgerät"],"Ein Symptom kann wie ein Indiz als Grundlage einer Diagnose dienen."),
  task("v4-ana-reverse","analogy",3,"Welche Paarung besitzt dieselbe Beziehung wie „Kapitel : Buch“?","Erkenne die Teil-Ganzes-Beziehung statt ein einzelnes Wort zu ergänzen.","Szene : Film",["Autor : Text","Schlüssel : Tür","Frage : Antwort"],"Eine Szene ist Teil eines Films wie ein Kapitel Teil eines Buches ist."),
  task("v4-cat-legierungen","category",1,"Messing, Bronze und Stahl gehören zu …","Finde den passenden Oberbegriff.","Metallwerkstoffen",["Kunststoffen","Gasgemischen","Textilien"],"Alle drei sind metallische Werkstoffe bzw. Legierungen/Stähle."),
  task("v4-cat-konjunktionen","category",2,"„obwohl“, „weil“ und „während“ sind …","Bestimme die grammatische Kategorie.","Konjunktionen",["Adjektive","Pronomen","Interjektionen"],"Diese Wörter verbinden Satzteile oder Nebensätze."),
  task("v4-cat-methoden","category",3,"Induktion, Deduktion und Abduktion sind Formen von …","Finde den präzisesten Oberbegriff.","Schlussverfahren",["Zeitformen","Messskalen","Stilmitteln"],"Alle drei sind logische bzw. wissenschaftliche Schlussverfahren."),
  task("v4-cat-ausreisser","category",2,"Welcher Begriff gehört nicht in dieselbe Kategorie?","Kupfer · Eisen · Aluminium · Glas","Glas",["Kupfer","Eisen","Aluminium"],"Kupfer, Eisen und Aluminium sind Metalle; Glas nicht."),
  task("v4-field-planung","wordfield",1,"Welches Wort gehört am wenigsten zum Wortfeld „Planung“?","Finde den Ausreißer.","verdampfen",["organisieren","priorisieren","terminieren"],"Verdampfen gehört nicht zum semantischen Feld Planung."),
  task("v4-field-begruenden","wordfield",2,"Welcher Begriff passt am wenigsten zu „begründen“?","Drei Begriffe stehen für argumentatives Stützen.","verzieren",["belegen","erläutern","rechtfertigen"],"Verzieren hat keine argumentative Funktion."),
  task("v4-field-erkenntnis","wordfield",3,"Welcher Begriff gehört am wenigsten zum Wortfeld „Erkenntnisgewinn“?","Achte auf die begriffliche Nähe.","Dekoration",["Analyse","Beobachtung","Hypothese"],"Dekoration trägt nicht primär zum Erkenntnisgewinn bei."),
  task("v4-field-cluster","wordfield",3,"Welche Dreiergruppe ist semantisch am engsten verbunden?","Vergleiche die Bedeutungsnähe der Gruppen.","prüfen · kontrollieren · verifizieren",["laufen · rechnen · blau","Tisch · mutig · lesen","Wolke · entscheiden · Metall"],"Alle drei Wörter der richtigen Gruppe bezeichnen Formen des Überprüfens."),
  task("v4-sent-ziel","sentence",1,"Welche Fortsetzung ist logisch?","Sie überprüfte den Termin noch einmal, damit …","kein Missverständnis entstand",["der Kalender schwerer wurde","Zeit rückwärts lief","die Zahl schlief"],"Die Kontrolle dient plausibel dazu, Missverständnisse zu vermeiden."),
  task("v4-sent-einschraenkung","sentence",2,"Welche Ergänzung erhält die Einschränkung korrekt?","Die Methode ist schnell, allerdings …","nicht in jedem Fall zuverlässig",["deshalb immer fehlerfrei","ohne jede Bedingung perfekt","und Geschwindigkeit ist eine Farbe"],"„Allerdings“ kündigt eine Einschränkung oder Gegenposition an."),
  task("v4-sent-konzession","sentence",3,"Welche Fortsetzung bildet eine korrekte Konzession?","Selbst wenn die Daten vollständig sind, …","müssen sie noch interpretiert werden",["entfällt jede Analyse automatisch","ist jede Schlussfolgerung wahr","kann kein Kontext existieren"],"Vollständige Daten ersetzen nicht die Interpretation."),
  task("v4-sent-ursache","sentence",2,"Welche Satzfolge bildet eine plausible Ursache-Wirkungs-Kette?","Wähle die logisch zusammenhängende Variante.","Es regnete stark → die Straße wurde nass",["Die Straße wurde nass → gestern war Montag","Es regnete stark → Metall wurde leichter","Der Kalender fiel → die Temperatur las"],"Starker Regen kann direkt dazu führen, dass eine Straße nass wird."),
  task("v4-rel-schaltplan","relation",1,"Schaltplan verhält sich zu Stromkreis wie Bauplan zu …","Darstellung und dargestelltes System.","Gebäude",["Werkzeug","Farbe","Material"],"Beide Pläne bilden die Struktur eines Systems ab."),
  task("v4-rel-daten","relation",2,"Daten verhalten sich zu Analyse wie Zutaten zu …","Ausgangsmaterial und Verarbeitung.","Rezept/Zubereitung",["Verpackung","Küche","Preis"],"Daten werden analysiert, Zutaten werden verarbeitet bzw. zubereitet."),
  task("v4-rel-prämisse","relation",3,"Prämisse verhält sich zu Schlussfolgerung wie Befund zu …","Grundlage und daraus abgeleitetes Ergebnis.","Diagnose",["Werkzeug","Messung","Zufall"],"Ein Befund kann Grundlage einer Diagnose sein wie eine Prämisse einer Schlussfolgerung."),
  task("v4-rel-paarvergleich","relation",3,"Welches Paar zeigt dieselbe Beziehung wie „Thermometer : Temperatur“?","Suche Instrument und gemessene Größe.","Waage : Gewicht",["Buch : Autor","Schloss : Schlüssel","Regen : Wolke"],"Eine Waage misst Gewicht wie ein Thermometer Temperatur misst."),
  task("v4-ctx-laden","context",1,"Was bedeutet „laden“ in diesem Satz?","Bitte lade die Datei auf den Server.","übertragen",["mit Energie versorgen","einladen","Gewicht auflegen"],"Im IT-Kontext bedeutet hochladen, Daten zu übertragen."),
  task("v4-ctx-fassen","context",2,"Was bedeutet „fassen“ hier?","Der Bericht fasst die Ergebnisse in drei Punkten zusammen.","komprimiert darstellen",["mit der Hand greifen","festnehmen","einen Behälter füllen"],"Im Kontext bedeutet zusammenfassen, Inhalte verdichtet darzustellen."),
  task("v4-ctx-scharf","context",3,"Welche Bedeutung hat „scharf“ in diesem Satz?","Die Kritik an der Entscheidung fiel ungewöhnlich scharf aus.","heftig/deutlich",["gut geschliffen","stark gewürzt","hoch aufgelöst"],"Hier beschreibt „scharf“ die Intensität der Kritik."),
  task("v4-ctx-zug","context",2,"Welche Bedeutung hat „Zug“ in diesem Satz?","Der Zug des Schachspielers überraschte alle.","Spielhandlung",["Eisenbahn","Luftbewegung","Gesichtsausdruck"],"Im Schach bezeichnet Zug eine einzelne Spielhandlung."),
];

const EN_BANK: LanguageTask[] = [
 task("en-syn-calm","synonym",1,"Which word means nearly the same as “calm”?","Choose the closest meaning.","peaceful",["noisy","rapid","rough"],"Calm and peaceful describe a state with little agitation."),
 task("en-ant-ancient","antonym",1,"What is the opposite of “ancient”?","Choose the best antonym.","modern",["historic","old","remote"],"Modern is the direct opposite in age and period."),
 task("en-ana-key","analogy",1,"Key : lock = password : ?","Tool and protected access.","account",["window","table","pencil"],"A key opens a lock; a password grants access to an account."),
 task("en-cat-fruit","category",1,"Apple, pear and orange belong to which category?","Choose the best category.","fruit",["tools","metals","vehicles"],"All three are types of fruit."),
 task("en-field-plan","wordfield",1,"Which word belongs least to the field “planning”?","Find the outlier.","evaporate",["organize","prioritize","schedule"],"Evaporate is unrelated to planning."),
 task("en-sent-goal","sentence",1,"Which continuation is logical?","She checked the appointment again so that …","no misunderstanding would occur",["the calendar became heavier","time moved backwards","the number fell asleep"],"Checking the appointment can prevent misunderstandings."),
 task("en-rel-map","relation",1,"Map relates to orientation as dictionary relates to …","Tool and primary function.","meaning",["weight","temperature","distance"],"A map supports orientation; a dictionary helps determine meaning."),
 task("en-ctx-charge","context",1,"What does “charge” mean in this sentence?","Please charge the battery before leaving.","supply with electrical energy",["accuse formally","set a price","rush forward"],"In this context, charge means supplying a battery with electrical energy."),
 task("en-syn-robust","synonym",2,"Which word is closest to “robust”?","Use the general meaning.","resilient",["fragile","unclear","temporary"],"Robust means strong and able to withstand stress."),
 task("en-ant-transparent","antonym",2,"Which word contrasts with “transparent” when talking about a process?","Think about clarity and traceability.","opaque",["clear","open","visible"],"Opaque can describe a process that is difficult to understand or inspect."),
 task("en-ana-author","analogy",2,"Architect : building = author : ?","Person and created work.","text",["paper","reader","printer"],"An architect designs buildings; an author creates texts."),
 task("en-cat-conjunction","category",2,"“although”, “because” and “while” are …","Choose the grammatical category.","conjunctions",["adjectives","pronouns","interjections"],"These words connect clauses or ideas."),
 task("en-field-reason","wordfield",2,"Which word belongs least with “justify”?","Three choices support an argument.","decorate",["explain","support","defend"],"Decorate does not perform an argumentative function."),
 task("en-sent-contrast","sentence",2,"Which continuation preserves the contrast?","The method is fast; however, …","it is not always reliable",["it is therefore always perfect","speed is a color","it needs no conditions"],"However introduces a limitation or contrast."),
 task("en-rel-data","relation",2,"Data relates to analysis as ingredients relate to …","Input material and processing.","cooking",["packaging","price","shelf"],"Data are analyzed; ingredients are processed through cooking."),
 task("en-ctx-sharp","context",2,"What does “sharp” mean here?","The criticism of the decision was unusually sharp.","harsh",["well sharpened","high resolution","spicy"],"Here sharp describes the intensity and severity of criticism."),
 task("en-syn-consistent","synonym",3,"Which word is the best synonym for “consistent”?","Choose the most precise meaning.","coherent",["random","ambiguous","erratic"],"Consistent can mean internally coherent and free of contradiction."),
 task("en-ant-convergent","antonym",3,"What is the conceptual opposite of “convergent”?","Choose the technical counterpart.","divergent",["parallel","linear","coherent"],"Convergent means coming together; divergent means moving apart."),
 task("en-ana-evidence","analogy",3,"Evidence : conclusion = symptom : ?","Clue and derived interpretation.","diagnosis",["therapy","instrument","coincidence"],"A symptom can support a diagnosis just as evidence supports a conclusion."),
 task("en-cat-reasoning","category",3,"Induction, deduction and abduction are forms of …","Choose the most precise category.","reasoning",["tenses","measurement scales","writing styles"],"All three are forms of logical or scientific reasoning."),
 task("en-field-insight","wordfield",3,"Which term belongs least to “gaining insight”?","Compare semantic closeness.","decoration",["analysis","observation","hypothesis"],"Decoration is not primarily part of gaining insight."),
 task("en-sent-concession","sentence",3,"Which continuation forms a valid concession?","Even if the data are complete, …","they still need to be interpreted",["all analysis becomes unnecessary","every conclusion is true","context cannot exist"],"Complete data do not replace interpretation."),
 task("en-rel-premise","relation",3,"Premise relates to conclusion as finding relates to …","Basis and derived result.","diagnosis",["tool","measurement","chance"],"A finding can support a diagnosis as a premise supports a conclusion."),
 task("en-ctx-move","context",3,"What does “move” mean in this sentence?","The chess player’s move surprised everyone.","game action",["change of home","physical exercise","emotional effect"],"In chess, a move is one game action."),
];

function scoreForDifficulty(difficulty:Difficulty){return difficulty===1?0:difficulty===2?5:7;}

export function createLanguageSession(bestScore:number,recentIds:string[]=[],completedSessions=0,forcedDifficulty?:Difficulty,language:"de"|"en"="de"):LanguageSession{
  const percent=Math.round((bestScore/LANGUAGE_SESSION_LENGTH)*100);
  const difficulty=forcedDifficulty ?? difficultyFromEvidence({percent,attempts:completedSessions*LANGUAGE_SESSION_LENGTH});
  const sharedHistory=readRecentTaskIds(HISTORY_SCOPE,144);
  const mergedHistory=[...new Set([...recentIds,...sharedHistory])].slice(-144);
  const base=createBaseLanguageSession(scoreForDifficulty(difficulty),mergedHistory);
  const source=language==="en"?EN_BANK:V4_BANK;
  const eligible=source.filter(item=>item.difficulty<=difficulty&&!mergedHistory.includes(item.id));
  const fallback=source.filter(item=>item.difficulty<=difficulty);
  const candidates=language==="en"?(eligible.length>=LANGUAGE_SESSION_LENGTH?eligible:fallback):[...base.tasks,...(eligible.length>=LANGUAGE_SESSION_LENGTH?eligible:fallback)];
  const tasks=finalizeBalancedSessionTasks(HISTORY_SCOPE,candidates,LANGUAGE_SESSION_LENGTH,144);
  return {...base,difficulty,tasks};
}