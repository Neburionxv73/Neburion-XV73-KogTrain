import type { PlatformLanguage } from "@/components/PlatformLanguageProvider";

const exact:Record<string,string>={
  "Fehlende Wörter":"Missing words","Sprache & Satzverständnis":"Language & sentence comprehension","Sprichwörter":"Proverbs","Erinnern & Sprachwissen":"Memory & language knowledge","Bild & Begriff":"Image & concept","Zuordnen & Wiedererkennen":"Matching & recognition","Alltagswissen":"Everyday knowledge","Orientierung & Alltag":"Orientation & everyday life",

  "Am Morgen trinke ich gern eine Tasse ___.":"In the morning I like to drink a cup of ___.","Kaffee":"coffee","Schrank":"cabinet","Wiese":"meadow","Schuh":"shoe","Gesucht ist ein typisches Getränk.":"Look for a typical drink.",
  "Bei Regen nehme ich einen ___ mit.":"When it rains, I take an ___ with me.","Regenschirm":"umbrella","Teller":"plate","Kissen":"pillow","Löffel":"spoon","Er schützt vor Nässe.":"It protects you from the rain.",
  "Im Winter trage ich eine warme ___.":"In winter I wear a warm ___.","Jacke":"jacket","Gabel":"fork","Tasse":"cup","Lampe":"lamp","Gesucht ist Kleidung.":"Look for an item of clothing.",
  "Zum Schreiben brauche ich einen ___.":"To write, I need a ___.","Stift":"pen","Topf":"pot","Schlüssel":"key","Damit schreibt man auf Papier.":"You use it to write on paper.",
  "Zum Frühstück esse ich gern Brot mit ___.":"For breakfast I like bread with ___.","Marmelade":"jam","Seife":"soap","Hammer":"hammer","Kabel":"cable","Gesucht ist ein Brotaufstrich.":"Look for a spread for bread.",
  "Der Zug fährt am ___ ab.":"The train departs from the ___.","Bahnhof":"station","Garten":"garden","Bad":"bathroom","Bett":"bed","Dort beginnen viele Zugreisen.":"Many train journeys begin there.",
  "Für eine Wanderung packe ich Wasser in den ___.":"For a hike, I pack water in my ___.","Rucksack":"backpack","Backofen":"oven","Briefkasten":"mailbox","Schreibtisch":"desk","Damit trägt man Dinge unterwegs.":"You carry things in it while travelling.",
  "Vor dem Schlafengehen stelle ich den ___ auf sieben Uhr.":"Before going to sleep, I set the ___ for seven o'clock.","Wecker":"alarm clock","Besen":"broom","Er erinnert dich am Morgen an die Uhrzeit.":"It reminds you of the time in the morning.",
  "Gemüse schneide ich auf einem ___.":"I cut vegetables on a ___.","Schneidebrett":"cutting board","Kopfkissen":"pillow","Teppich":"carpet","Es gehört in die Küche.":"It belongs in the kitchen.",
  "Für kalte Getränke stelle ich die Flasche in den ___.":"To keep a drink cold, I put the bottle in the ___.","Kühlschrank":"refrigerator","Kleiderschrank":"wardrobe","Ofen":"oven","Dort bleiben Lebensmittel kühl.":"Food stays cold there.",
  "Zum Öffnen der Haustür brauche ich meinen ___.":"To open the front door I need my ___.","Er passt in das Türschloss.":"It fits the door lock.",
  "Beim Radfahren trage ich zur Sicherheit einen ___.":"When cycling, I wear a ___ for safety.","Helm":"helmet","Schal":"scarf","Ordner":"folder","Er schützt den Kopf.":"It protects your head.",
  "Eine wichtige Notiz schreibe ich in meinen ___.":"I write an important note in my ___.","Kalender":"calendar","Darin lassen sich Termine und Erinnerungen festhalten.":"You can record appointments and reminders in it.",
  "Nach dem Händewaschen trockne ich sie mit einem ___.":"After washing my hands, I dry them with a ___.","Handtuch":"towel","Es nimmt Wasser auf.":"It absorbs water.",

  "Morgenstund hat ___ im Mund.":"The early bird catches the ___.","Gold":"worm","Brot":"bread","Regen":"rain","Holz":"wood","Ein bekanntes Sprichwort über den frühen Start.":"A familiar proverb about starting early.",
  "Viele Köche verderben den ___.":"Too many cooks spoil the ___.","Brei":"broth","Es geht um zu viele Beteiligte.":"It is about too many people being involved.",
  "Übung macht den ___.":"Practice makes ___.","Meister":"perfect","Sommer":"summer","Weg":"way","Wiederholung verbessert Können.":"Repetition improves skill.",
  "Aller Anfang ist ___.":"Every beginning is ___.","schwer":"difficult","rund":"round","leise":"quiet","blau":"blue","Der Beginn braucht oft mehr Kraft.":"Starting often takes more effort.",
  "Was du heute kannst besorgen, das verschiebe nicht auf ___.":"Never put off until ___ what you can do today.","morgen":"tomorrow","gestern":"yesterday","mittags":"noon","Sonntag":"Sunday","Nicht aufschieben.":"Do not put things off.",
  "Ende gut, alles ___.":"All's well that ends ___.","gut":"well","neu":"new","klein":"small","offen":"open","Ein positives Ende zählt.":"A positive ending matters.",
  "Wo ein Wille ist, ist auch ein ___.":"Where there's a will, there's a ___.","Entschlossenheit hilft beim Finden einer Lösung.":"Determination helps you find a solution.",
  "Geteiltes Leid ist halbes ___.":"A trouble shared is a trouble ___.","Leid":"halved","Gemeinsam trägt sich eine Belastung leichter.":"A burden is easier to carry together.",
  "Wer anderen eine Grube gräbt, fällt selbst ___.":"Whoever digs a pit for others falls ___ themselves.","hinein":"into it","hinaus":"out","hinauf":"up","vorbei":"past it","Das Sprichwort warnt vor Schadenfreude.":"The proverb warns against wishing harm on others.",
  "Kleider machen ___.":"Clothes make the ___.","Leute":"man","Tage":"days","Straßen":"streets","Bäume":"trees","Äußeres beeinflusst den Eindruck.":"Appearance influences the impression you make.",
  "Reden ist Silber, Schweigen ist ___.":"Speech is silver, silence is ___.","Das Sprichwort bewertet Zurückhaltung besonders hoch.":"The proverb places a high value on restraint.",
  "Andere Länder, andere ___.":"Different countries, different ___.","Sitten":"customs","Fenster":"windows","Gemeint sind unterschiedliche Gewohnheiten und Regeln.":"It refers to different customs and rules.",
  "Wer rastet, der ___.":"If you rest, you ___.","rostet":"rust","lacht":"laugh","rennt":"run","kocht":"cook","Aktivität hält in Bewegung.":"Activity keeps you moving.",
  "Zeit ist ___.":"Time is ___.","Geld":"money","Sand":"sand","Das Sprichwort betont den Wert von Zeit.":"The proverb emphasizes the value of time.",

  "Welcher Begriff passt zu 🐶?":"Which term matches 🐶?","Hund":"dog","Katze":"cat","Vogel":"bird","Fisch":"fish","Ein Haustier mit vier Pfoten.":"A pet with four paws.",
  "Welcher Begriff passt zu ☕?":"Which term matches ☕?","Ein warmes Getränk.":"A warm drink.",
  "Welcher Begriff passt zu 🚲?":"Which term matches 🚲?","Fahrrad":"bicycle","Zug":"train","Auto":"car","Boot":"boat","Es hat zwei Räder und Pedale.":"It has two wheels and pedals.",
  "Welcher Begriff passt zu 🌳?":"Which term matches 🌳?","Baum":"tree","Haus":"house","Uhr":"clock","Er wächst im Wald oder Garten.":"It grows in a forest or garden.",
  "Welcher Begriff passt zu 🔑?":"Which term matches 🔑?","Damit öffnet man eine Tür.":"You use it to open a door.",
  "Welcher Begriff passt zu ⏰?":"Which term matches ⏰?","Sie zeigt die Zeit.":"It shows the time.",
  "Welcher Begriff passt zu 🧭?":"Which term matches 🧭?","Kompass":"compass","Buch":"book","Er hilft bei der Orientierung.":"It helps with orientation.",
  "Welcher Begriff passt zu 🥕?":"Which term matches 🥕?","Karotte":"carrot","Apfel":"apple","Käse":"cheese","Ein orangefarbenes Gemüse.":"An orange vegetable.",
  "Welcher Begriff passt zu 📚?":"Which term matches 📚?","Bücher":"books","Schuhe":"shoes","Man liest darin.":"You read them.",
  "Welcher Begriff passt zu 🔨?":"Which term matches 🔨?","Ein Werkzeug zum Einschlagen von Nägeln.":"A tool used to drive in nails.",
  "Welcher Begriff passt zu ✉️?":"Which term matches ✉️?","Brief":"letter","Er wird verschickt oder zugestellt.":"It is sent or delivered.",
  "Welcher Begriff passt zu 🚌?":"Which term matches 🚌?","Bus":"bus","Ein öffentliches Verkehrsmittel auf der Straße.":"A form of public transport that travels on roads.",
  "Welcher Begriff passt zu 🥛?":"Which term matches 🥛?","Milch":"milk","Ein helles Getränk.":"A light-colored drink.",
  "Welcher Begriff passt zu 🧤?":"Which term matches 🧤?","Handschuh":"glove","Hut":"hat","Er wird an der Hand getragen.":"It is worn on the hand.",

  "Wo kauft man Medikamente?":"Where do you buy medication?","Apotheke":"pharmacy","Bäckerei":"bakery","Park":"park","Gesucht ist ein Fachgeschäft für Arzneimittel.":"Look for a specialist shop for medicines.",
  "Wo hebt man normalerweise Bargeld ab?":"Where do you normally withdraw cash?","Bankomat":"ATM","Dort erhält man Geld mit Karte.":"You can get cash there using a card.",
  "Was braucht man typischerweise für eine Busfahrt?":"What do you typically need for a bus journey?","Fahrschein":"ticket","Kochtopf":"cooking pot","Eine Fahrberechtigung.":"It gives you permission to travel.",
  "Welche Nummer steht in Österreich für den Euro-Notruf?":"Which number is the European emergency number in Austria?","Europäische Notrufnummer.":"European emergency number.",
  "Was prüft man vor einem Arzttermin am besten?":"What should you check before a doctor's appointment?","Datum und Uhrzeit":"date and time","Schuhgröße":"shoe size","Wetter von gestern":"yesterday's weather","Fernsehprogramm":"TV schedule","Damit man pünktlich ist.":"So that you arrive on time.",
  "Wo wirft man einen frankierten Brief ein?":"Where do you post a stamped letter?","Er gehört zur Post.":"It belongs to the postal service.",
  "Welche Information hilft dir an einer Bushaltestelle am meisten?":"Which information is most useful at a bus stop?","Fahrplan":"timetable","Speisekarte":"menu","Rezept":"recipe","Er zeigt Abfahrtszeiten und Linien.":"It shows departure times and routes.",
  "Du möchtest Lebensmittel kühl halten. Was nutzt du?":"You want to keep food cold. What do you use?","Heizkörper":"radiator","Er hält Lebensmittel bei niedriger Temperatur.":"It keeps food at a low temperature.",
  "Was kontrollierst du vor dem Verlassen der Wohnung sinnvollerweise?":"What should you check before leaving your home?","Sofakissen":"sofa cushion","Blumenvase":"flower vase","Teppichmuster":"carpet pattern","Ohne ihn kommst du möglicherweise nicht wieder hinein.":"Without it, you may not be able to get back inside.",
  "Auf einer Rechnung steht 18 € und du bezahlst mit 20 €. Wie viel Rückgeld erhältst du?":"A bill is €18 and you pay with €20. How much change do you receive?","20 minus 18.":"20 minus 18.",
  "Du hast um 14:30 Uhr einen Termin. Wann solltest du spätestens losgehen, wenn der Weg 20 Minuten dauert?":"You have an appointment at 2:30 PM. What is the latest time you should leave if the journey takes 20 minutes?","14:10 Uhr":"2:10 PM","14:25 Uhr":"2:25 PM","14:30 Uhr":"2:30 PM","13:30 Uhr":"1:30 PM","Ziehe die Wegzeit vom Termin ab.":"Subtract the travel time from the appointment time.",
  "Welche Ampelfarbe bedeutet im Straßenverkehr normalerweise Stopp?":"Which traffic-light color normally means stop?","Rot":"red","Grün":"green","Blau":"blue","Weiß":"white","Diese Farbe signalisiert Anhalten.":"This color signals that you must stop.",
  "Wo findest du normalerweise Abfahrtszeiten für einen Zug?":"Where do you normally find train departure times?","Kassenbon":"receipt","Er enthält Zeiten und Verbindungen.":"It contains times and connections.",
  "Du kaufst zwei Artikel zu je 4 €. Wie hoch ist der Gesamtpreis?":"You buy two items at €4 each. What is the total price?","8 €":"€8","6 €":"€6","4 €":"€4","10 €":"€10","Addiere beide Einzelpreise.":"Add the two individual prices.",

  "Runden":"Rounds","Erfolge":"Achievements","Zusätzliche Gehirnfit-Bereiche":"Additional BrainFit areas","Gemischte Runde":"Mixed round","Dein heutiger Gehirnfit-Mix":"Your BrainFit mix for today","Abgeschlossen":"Complete","Richtig ✓":"Correct ✓","Auswertung":"Results","Nächste Aufgabe":"Next task","Runde abgeschlossen.":"Round complete.","Neue Variante":"New variant","Tagesmix öffnen":"Open daily mix","Meilensteine":"Milestones","Fortschritt sichtbar machen.":"Make progress visible.","Die Erfolge sind Motivation, keine Bewertung. Sie werden ausschließlich lokal in diesem Browser gespeichert.":"Achievements are for motivation, not evaluation. They are stored only locally in this browser.","Heute bereits eine Completion-Runde abgeschlossen ✓":"A completion round has already been finished today ✓",
  "Erste Runde":"First round","5 Gehirnfit-Runden":"5 BrainFit rounds","10 Gehirnfit-Runden":"10 BrainFit rounds","25 Gehirnfit-Runden":"25 BrainFit rounds","50 Gehirnfit-Runden":"50 BrainFit rounds","70 % Durchschnitt":"70% average","85 % Durchschnitt":"85% average","80 % oder mehr":"80% or more","90 % oder mehr":"90% or more","Perfekte Runde":"Perfect round","Starker Abschluss":"Strong finish","Heute aktiv":"Active today"
};

export function localizeBrainFitCompletionText(value:string|undefined,language:PlatformLanguage):string{
  if(!value||language==="de") return value??"";
  return exact[value]??value;
}
