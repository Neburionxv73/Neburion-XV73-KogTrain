import type { Difficulty } from "@/lib/dynamicTraining";
import type { FocusArea } from "@/lib/learningExpansion";
import { TOPICS, type FocusTopic } from "@/lib/personalTraining";

export type AdaptiveSkillStat = { attempts:number; correct:number };
export type AdaptiveReactionStat = { attempts:number; totalMs:number };
export type AdaptivePlan = {
  areas:FocusArea[];
  topics:FocusTopic[];
  difficulty:Difficulty;
  primaryArea:FocusArea;
  primaryTopic?:FocusTopic;
  reason:string;
  confidence:"low"|"medium"|"high";
  score:number;
};

type AdaptiveInput = {
  selectedAreas:FocusArea[];
  selectedTopics:FocusTopic[];
  skillStats:Record<FocusArea,AdaptiveSkillStat>;
  topicStats:Record<string,AdaptiveSkillStat>;
  reactionStats?:Record<string,AdaptiveReactionStat>;
  lastAccuracy?:number;
  baseDifficulty:Difficulty;
};

const MAX_PRIORITY = 145;

function accuracy(stat?:AdaptiveSkillStat){return stat?.attempts?Math.round((stat.correct/stat.attempts)*100):null;}
function topicKey(area:FocusArea,label:string){return `${area}:${label}`;}
function clampDifficulty(value:number):Difficulty{return Math.max(1,Math.min(3,value)) as Difficulty;}
function clampPriority(value:number){return Math.max(0,Math.min(MAX_PRIORITY,Math.round(value)));}
function coverageBonus(attempts:number, unseenBonus:number, sparseBonus:number){
  if(attempts===0)return unseenBonus;
  if(attempts<4)return sparseBonus;
  if(attempts<8)return Math.round(sparseBonus/2);
  return 0;
}

export function buildAdaptivePlan(input:AdaptiveInput):AdaptivePlan{
  const requestedPool=input.selectedAreas.length?input.selectedAreas:(Object.keys(TOPICS) as FocusArea[]);
  const topicFilter=new Set(input.selectedTopics);

  const scoreArea=(area:FocusArea)=>{
    const stat=input.skillStats[area]??{attempts:0,correct:0};
    const acc=accuracy(stat);
    const weakness=acc===null?64:Math.max(0,100-acc);
    const areaCoverage=coverageBonus(stat.attempts,18,10);
    const candidates=TOPICS[area]
      .filter(topic=>topicFilter.size===0||topicFilter.has(topic.id))
      .map(topic=>{
        const statKey=topicKey(area,topic.label);
        const topicStat=input.topicStats[statKey];
        const topicAcc=accuracy(topicStat);
        const attempts=topicStat?.attempts??0;
        const topicWeakness=topicAcc===null?60:Math.max(0,100-topicAcc);
        let score=topicWeakness+coverageBonus(attempts,14,8);
        const reaction=input.reactionStats?.[statKey];
        if(area==="reaction"&&reaction?.attempts){
          const avgMs=reaction.totalMs/reaction.attempts;
          if(avgMs>1400)score+=18;
          else if(avgMs>1000)score+=10;
          else if(avgMs<650)score-=6;
        }
        return {topic,score:Math.max(0,score),attempts,accuracy:topicAcc};
      })
      .sort((a,b)=>b.score-a.score||a.attempts-b.attempts||a.topic.label.localeCompare(b.topic.label,"de"));
    const primary=candidates[0];
    const combined=weakness*.68+(primary?.score??0)*.32+areaCoverage;
    return {area,score:clampPriority(combined),primary,candidates,attempts:stat.attempts,accuracy:acc};
  };

  let ranked=requestedPool.map(scoreArea).filter(item=>item.candidates.length>0);
  if(!ranked.length)ranked=(Object.keys(TOPICS) as FocusArea[]).map(scoreArea).filter(item=>item.candidates.length>0);
  ranked.sort((a,b)=>b.score-a.score||a.attempts-b.attempts||a.area.localeCompare(b.area));

  const primary=ranked[0];
  const secondary=ranked.find((item,index)=>index>0&&(item.attempts===0||item.score>=Math.max(58,primary.score*.72)));
  const areas=[primary.area,...(secondary?[secondary.area]:[])];
  const topics=[
    ...primary.candidates.slice(0,2).map(item=>item.topic.id),
    ...(secondary?.candidates.slice(0,1).map(item=>item.topic.id)??[]),
  ];
  const uniqueTopics=[...new Set(topics)];

  const observedAttempts=ranked.reduce((sum,item)=>sum+item.attempts,0);
  const observedAreas=ranked.filter(item=>item.attempts>0).length;
  const confidence:AdaptivePlan["confidence"]=observedAttempts>=60&&observedAreas>=4?"high":observedAttempts>=16&&observedAreas>=2?"medium":"low";
  const primaryAcc=primary.primary?.accuracy??primary.accuracy;
  const primaryEvidence=primary.primary?.attempts??primary.attempts;
  let difficulty=input.baseDifficulty;
  if(typeof input.lastAccuracy==="number"&&primaryAcc!==null&&primaryEvidence>=4){
    if(input.lastAccuracy>=88&&primaryAcc>=82)difficulty=clampDifficulty(input.baseDifficulty+1);
    else if(input.lastAccuracy<55&&primaryAcc<60)difficulty=clampDifficulty(input.baseDifficulty-1);
  }

  const reason=primary.primary
    ? primary.primary.attempts===0
      ? `${primary.primary.topic.label} ist in deinem gewählten Lernpfad noch untrainiert. Die Engine reserviert bewusst Platz für neue Bereiche, bevor sie sie als Stärke oder Schwäche bewertet.`
      : primary.primary.attempts<4
        ? `${primary.primary.topic.label} hat noch wenig Evidenz. KogTrain sammelt gezielt weitere Aufgaben, bevor die Priorität stärker aus Trefferquote und Niveau abgeleitet wird.`
        : `${primary.primary.topic.label} hat aktuell den höchsten Wiederholungsbedarf. Themenabdeckung, Trefferquote${primary.area==="reaction"?" und Reaktionszeit":""} bestimmen gemeinsam die Priorität.`
    : `${primary.area} wird als nächster sinnvoller Schwerpunkt priorisiert.`;

  return {
    areas,
    topics:uniqueTopics,
    difficulty,
    primaryArea:primary.area,
    primaryTopic:primary.primary?.topic.id,
    reason,
    confidence,
    score:clampPriority(primary.score),
  };
}
