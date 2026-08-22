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

function accuracy(stat?:AdaptiveSkillStat){return stat?.attempts?Math.round((stat.correct/stat.attempts)*100):null;}
function topicKey(area:FocusArea,label:string){return `${area}:${label}`;}
function clampDifficulty(value:number):Difficulty{return Math.max(1,Math.min(3,value)) as Difficulty;}

export function buildAdaptivePlan(input:AdaptiveInput):AdaptivePlan{
  const pool=input.selectedAreas.length?input.selectedAreas:(Object.keys(TOPICS) as FocusArea[]);
  const topicFilter=new Set(input.selectedTopics);
  const ranked=pool.map(area=>{
    const stat=input.skillStats[area];
    const acc=accuracy(stat);
    const unseen=stat.attempts===0;
    const areaScore=unseen?78:Math.max(0,100-(acc??0));
    const candidates=TOPICS[area]
      .filter(topic=>topicFilter.size===0||topicFilter.has(topic.id))
      .map(topic=>{
        const statKey=topicKey(area,topic.label);
        const topicStat=input.topicStats[statKey];
        const topicAcc=accuracy(topicStat);
        const topicUnseen=!topicStat?.attempts;
        let score=topicUnseen?72:Math.max(0,100-(topicAcc??0));
        if(topicStat?.attempts&&topicStat.attempts<4)score+=8;
        const reaction=input.reactionStats?.[statKey];
        if(area==="reaction"&&reaction?.attempts){
          const avgMs=reaction.totalMs/reaction.attempts;
          if(avgMs>1400)score+=18;else if(avgMs>1000)score+=10;else if(avgMs<650)score-=6;
        }
        return {topic,score,attempts:topicStat?.attempts??0,accuracy:topicAcc};
      })
      .sort((a,b)=>b.score-a.score);
    const primary=candidates[0];
    return {area,score:areaScore+(primary?.score??0)*.45,primary,candidates,attempts:stat.attempts,accuracy:acc};
  }).sort((a,b)=>b.score-a.score);

  const primary=ranked[0];
  const secondary=ranked[1];
  const areas=[primary.area,...(secondary&&secondary.score>65?[secondary.area]:[])];
  const topics=[...(primary.candidates.slice(0,2).map(item=>item.topic.id)),...(secondary?.candidates.slice(0,1).map(item=>item.topic.id)??[])];
  const uniqueTopics=[...new Set(topics)];

  const observedAttempts=ranked.reduce((sum,item)=>sum+item.attempts,0);
  const confidence:AdaptivePlan["confidence"]=observedAttempts>=40?"high":observedAttempts>=12?"medium":"low";
  const primaryAcc=primary.primary?.accuracy??primary.accuracy;
  let difficulty=input.baseDifficulty;
  if(typeof input.lastAccuracy==="number"){
    if(input.lastAccuracy>=88&&primaryAcc!==null&&primaryAcc>=80)difficulty=clampDifficulty(input.baseDifficulty+1);
    else if(input.lastAccuracy<58||primaryAcc!==null&&primaryAcc<55)difficulty=clampDifficulty(input.baseDifficulty-1);
  }

  const reason=primary.primary
    ? primary.primary.attempts===0
      ? `${primary.primary.topic.label} ist in deinem gewählten Lernpfad noch kaum trainiert und bekommt deshalb gezielt Platz.`
      : `${primary.primary.topic.label} hat aktuell den höchsten Wiederholungsbedarf. Schwierigkeit und Themenmix werden aus deinen bisherigen Ergebnissen abgeleitet.`
    : `${primary.area} wird als nächster sinnvoller Schwerpunkt priorisiert.`;

  return {
    areas,
    topics:uniqueTopics,
    difficulty,
    primaryArea:primary.area,
    primaryTopic:primary.primary?.topic.id,
    reason,
    confidence,
    score:Math.round(primary.score),
  };
}
