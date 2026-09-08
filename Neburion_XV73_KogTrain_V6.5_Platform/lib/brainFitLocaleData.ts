import {
  BRAIN_FIT_AREAS,
  CATEGORY_TASKS,
  CROSSWORD_POOL,
  EVERYDAY_MATH_TASKS,
  TIME_ORDER_TASKS,
  WORD_SETS,
  type BrainFitChoiceTask,
} from "@/lib/brainFit";
import type { PlatformLanguage } from "@/components/PlatformLanguageProvider";

const original = {
  areas: BRAIN_FIT_AREAS.map(item=>({...item})),
  words: WORD_SETS.map(set=>[...set]),
  crossword: CROSSWORD_POOL.map(item=>({...item})),
  categories: CATEGORY_TASKS.map(task=>({...task,options:[...task.options]})),
  math: EVERYDAY_MATH_TASKS.map(task=>({...task,options:[...task.options]})),
  time: TIME_ORDER_TASKS.map(task=>({...task,options:[...task.options]})),
};

const EN_WORD_SETS = [
 ["APPLE","FOREST","MOON","ROSE","BIRD","HILL"],
 ["CAT","TREE","MEADOW","SUN","FLOWER","RIVER"],
 ["BREAD","MILK","CUP","TABLE","LAMP","BOOK"],
 ["GARDEN","BENCH","PATH","POND","BEE","LEAF"],
 ["TRAIN","TRIP","BAG","HOTEL","MAP","STATION"],
 ["CHURCH","MARKET","PARK","BRIDGE","SQUARE","STREET"],
 ["SOUP","PASTA","SALAD","COFFEE","CAKE","CHEESE"],
 ["WINTER","SNOW","SUMMER","RAIN","WIND","CLOUD"],
 ["ROCK","TRAIL","CABIN","SUMMIT","ROPE","HIKE"],
 ["PEAR","GRAPE","BERRY","MELON","PLUM","CHERRY"],
 ["SCHOOL","NOTE","PENCIL","BREAK","BOARD","CLASS"],
 ["RADIO","MUSIC","TONE","SONG","SOUND","VOICE"],
 ["MOVIE","FILM","TICKET","SEAT","SCREEN","BREAK"],
 ["DOCTOR","CLINIC","VISIT","RECIPE","PHARMACY","CARE"],
 ["BUS","SCHEDULE","TICKET","LINE","RIDE","TRACK"],
 ["KITCHEN","POT","PAN","KNIFE","PLATE","SPOON"],
 ["COMPASS","ROUTE","NORTH","MAP","PATH","GOAL"],
 ["STAGE","LIGHT","MUSIC","BEAT","VOICE","APPLAUSE"],
 ["FOLDER","PRINTER","FILE","TABLE","SCREEN","OFFICE"],
 ["CLOUD","FOG","STORM","WIND","RAIN","HAIL"],
 ["PLANET","COMET","STAR","ORBIT","MOON","SUN"],
 ["HARBOR","SAIL","ANCHOR","WAVE","BOAT","ISLAND"],
 ["MUSEUM","IMAGE","ART","FRAME","HALL","STATUE"],
 ["WORKSHOP","HAMMER","PLIERS","SCREW","DRILL","SAW"],
];

const EN_CROSSWORD = [
 {clue:"Round fruit, often red or green.",answer:"APPLE"},{clue:"Large area with many trees.",answer:"FOREST"},{clue:"Shines in the night sky.",answer:"MOON"},{clue:"Flower that may have thorns.",answer:"ROSE"},{clue:"Animal with feathers and wings.",answer:"BIRD"},{clue:"High natural landform.",answer:"MOUNTAIN"},
 {clue:"Drink produced by cows.",answer:"MILK"},{clue:"Furniture used for sitting.",answer:"CHAIR"},{clue:"Shows hours and minutes.",answer:"CLOCK"},{clue:"Structure that crosses a river.",answer:"BRIDGE"},{clue:"You read stories in it.",answer:"BOOK"},{clue:"Main source of daylight.",answer:"SUN"},
 {clue:"Opens a locked door.",answer:"KEY"},{clue:"Stores clothes.",answer:"CLOSET"},{clue:"Travels on rails.",answer:"TRAIN"},{clue:"Warm liquid meal.",answer:"SOUP"},{clue:"Place where flowers grow.",answer:"GARDEN"},{clue:"White weather that falls in winter.",answer:"SNOW"},
 {clue:"Place where you wait for a train.",answer:"STATION"},{clue:"Vehicle powered by pedals.",answer:"BICYCLE"},{clue:"You sleep on it at night.",answer:"BED"},{clue:"Used for drinking coffee.",answer:"CUP"},{clue:"Used for writing on paper.",answer:"PENCIL"},{clue:"Shows roads and places.",answer:"MAP"},
 {clue:"Place where medicines are sold.",answer:"PHARMACY"},{clue:"Protects you from rain.",answer:"UMBRELLA"},{clue:"Room used for cooking.",answer:"KITCHEN"},{clue:"Place where movies are shown.",answer:"CINEMA"},{clue:"Tool used to cut vegetables.",answer:"KNIFE"},{clue:"Drink made from fruit.",answer:"JUICE"},
 {clue:"Tool that points north.",answer:"COMPASS"},{clue:"Keeps a ship in place.",answer:"ANCHOR"},{clue:"Bright object with a tail in space.",answer:"COMET"},{clue:"Path of an object around another in space.",answer:"ORBIT"},{clue:"Organizes dates and appointments.",answer:"CALENDAR"},{clue:"Device used to print documents.",answer:"PRINTER"},
];

const q=(prompt:string,options:string[],answer:string,level?:"relaxed"|"normal"|"challenge"):BrainFitChoiceTask=>({prompt,options,answer,...(level?{level}:{})});
const EN_CATEGORIES:BrainFitChoiceTask[]=[
 q("Which does not belong with fruit?",["Apple","Pear","Carrot","Plum"],"Carrot"),q("Which does not belong with tools?",["Hammer","Pliers","Saw","Pillow"],"Pillow"),q("Which does not belong with animals?",["Dog","Cat","Cabinet","Bird"],"Cabinet"),q("Which does not belong with clothing?",["Jacket","Trousers","Hat","Plate"],"Plate"),
 q("Which does not belong with transport?",["Bus","Train","Bicycle","Sofa"],"Sofa"),q("Which does not belong with stationery?",["Pen","Notebook","Eraser","Frying pan"],"Frying pan"),q("Which does not belong with music?",["Melody","Rhythm","Sound","Screwdriver"],"Screwdriver"),q("Which does not belong with a doctor visit?",["Appointment","Waiting room","Prescription","Bus ticket"],"Bus ticket"),
 q("Which term does not belong with weather observation?",["Air pressure","Temperature","Rainfall","Account number"],"Account number","normal"),q("Which term does not belong with navigation?",["Route","Compass","Coordinate","Wooden spoon"],"Wooden spoon","normal"),q("Which does not belong with data processing?",["File","Table","Database","Watering can"],"Watering can","normal"),q("Which term does not belong with argumentation?",["Reason","Evidence","Conclusion","Wallpaper"],"Wallpaper","normal"),
 q("Which is not a logical inference method?",["Deduction","Induction","Abduction","Decoration"],"Decoration","challenge"),q("Which is not a semantics term?",["Synonymy","Antonymy","Polysemy","Geometry"],"Geometry","challenge"),q("Which does not belong with project control?",["Milestone","Dependency","Priority","Teapot"],"Teapot","challenge"),q("Which is not a physical quantity?",["Temperature","Mass","Time","Opinion"],"Opinion","challenge"),
];
const EN_MATH:BrainFitChoiceTask[]=[
 q("A loaf costs €3. How much do two loaves cost?",["€5","€6","€7","€8"],"€6"),q("You have €20 and spend €14. How much remains?",["€4","€5","€6","€7"],"€6"),q("4 apples cost €8. What does 1 apple cost?",["€1","€2","€3","€4"],"€2"),q("3 bottles of 2 liters each make?",["4 l","5 l","6 l","8 l"],"6 l"),q("A coffee costs €4. You pay €10. Change?",["€4","€5","€6","€7"],"€6"),
 q("An item costs €24. With 25% off, what is the price?",["€16","€18","€20","€21"],"€18","normal"),q("3 packs at €4.50 each cost?",["€12.50","€13.50","€14.00","€15.50"],"€13.50","normal"),q("1.5 kg costs €6. What do 500 g cost?",["€1","€2","€2.50","€3"],"€2","normal"),q("An €80 bill is split equally between two people. Each pays?",["€35","€40","€45","€50"],"€40","normal"),q("One appointment lasts 1 h 20 min. Two appointments last?",["2 h","2 h 20 min","2 h 40 min","3 h"],"2 h 40 min","normal"),
 q("A price of €120 rises by 15%. New price?",["€132","€136","€138","€142"],"€138","challenge"),q("3/4 of 80 items is?",["50","55","60","65"],"60","challenge"),q("A product costs €50 net. With 20% VAT it costs?",["€55","€58","€60","€62"],"€60","challenge"),q("2.4 kg is split into 6 equal portions. Each portion?",["300 g","350 g","400 g","450 g"],"400 g","challenge"),q("From €250 subtract 10%, then €20. What remains?",["€200","€205","€210","€215"],"€205","challenge"),
];
const EN_TIME:BrainFitChoiceTask[]=[
 q("What usually comes first in a daily routine?",["Breakfast","Dinner","Bedtime","Lunch"],"Breakfast"),q("Which time is later?",["08:00","11:30","07:45","06:15"],"11:30"),q("What comes after Tuesday?",["Monday","Wednesday","Friday","Sunday"],"Wednesday"),q("An appointment starts at 14:00 and lasts 1 hour. End time?",["14:30","15:00","15:30","16:00"],"15:00"),q("Which month follows April?",["March","May","June","July"],"May"),
 q("An appointment starts at 09:15 and lasts 45 minutes. End time?",["09:45","10:00","10:15","11:00"],"10:00","normal"),q("A bus leaves at 17:20. Ten minutes earlier is?",["17:00","17:10","17:15","17:30"],"17:10","normal"),q("A film starts at 18:40 and lasts 1 h 50 min. End time?",["20:20","20:30","20:40","21:30"],"20:30","normal"),q("How much time passes from 13:25 to 15:05?",["1 h 20 min","1 h 30 min","1 h 40 min","1 h 50 min"],"1 h 40 min","normal"),q("An appointment at 10:45 is moved by 35 minutes. New time?",["11:10","11:20","11:25","11:30"],"11:20","normal"),
 q("Departure 22:50, travel time 2 h 25 min. Arrival?",["00:55","01:05","01:15","01:25"],"01:15","challenge"),q("How much time lies between 08:35 and 12:20?",["3 h 35 min","3 h 45 min","3 h 55 min","4 h 05 min"],"3 h 45 min","challenge"),q("A meeting starts at 16:55 and lasts 95 minutes. End time?",["18:20","18:30","18:40","18:50"],"18:30","challenge"),q("23:40 plus 50 minutes equals?",["00:20","00:30","00:40","01:30"],"00:30","challenge"),q("An appointment is at 14:10. What time was it 2 h 35 min earlier?",["11:25","11:35","11:45","12:35"],"11:35","challenge"),
];

function replaceArray<T>(target:T[], source:T[]){target.splice(0,target.length,...source);}

export function applyBrainFitLanguageData(language:PlatformLanguage){
 if(language==="en"){
   replaceArray(BRAIN_FIT_AREAS,[
    {id:"sudoku",icon:"🐾",title:"Animal Sudoku",subtitle:"Logic & patterns"},
    {id:"words",icon:"🔎",title:"Word search",subtitle:"Words & attention"},
    {id:"crossword",icon:"✍️",title:"Crossword",subtitle:"Language & knowledge"},
    {id:"memory",icon:"🧠",title:"Memory",subtitle:"Memory & recognition"},
    {id:"categories",icon:"🧺",title:"Categories",subtitle:"Sorting & matching"},
    {id:"sequence",icon:"🔢",title:"Sequences & patterns",subtitle:"Logic & continuation"},
    {id:"everydayMath",icon:"🛒",title:"Everyday math",subtitle:"Shopping & quantities"},
    {id:"timeOrder",icon:"🕒",title:"Time & order",subtitle:"Everyday orientation"},
   ]);
   replaceArray(WORD_SETS,EN_WORD_SETS.map(set=>[...set]));
   replaceArray(CROSSWORD_POOL,EN_CROSSWORD.map(item=>({...item})));
   replaceArray(CATEGORY_TASKS,EN_CATEGORIES.map(task=>({...task,options:[...task.options]})));
   replaceArray(EVERYDAY_MATH_TASKS,EN_MATH.map(task=>({...task,options:[...task.options]})));
   replaceArray(TIME_ORDER_TASKS,EN_TIME.map(task=>({...task,options:[...task.options]})));
   return;
 }
 replaceArray(BRAIN_FIT_AREAS,original.areas.map(item=>({...item})));
 replaceArray(WORD_SETS,original.words.map(set=>[...set]));
 replaceArray(CROSSWORD_POOL,original.crossword.map(item=>({...item})));
 replaceArray(CATEGORY_TASKS,original.categories.map(task=>({...task,options:[...task.options]})));
 replaceArray(EVERYDAY_MATH_TASKS,original.math.map(task=>({...task,options:[...task.options]})));
 replaceArray(TIME_ORDER_TASKS,original.time.map(task=>({...task,options:[...task.options]})));
}
