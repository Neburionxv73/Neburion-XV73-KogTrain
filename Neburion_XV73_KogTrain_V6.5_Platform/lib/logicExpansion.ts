import { randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";
import type { LogicMode, LogicTask } from "@/lib/logic";

function makeTask(id:string,mode:LogicMode,prompt:string,detail:string,correct:string,distractors:string[],explanation:string):LogicTask{
  const options=shuffled([correct,...distractors.filter(item=>item!==correct)]).slice(0,4);
  return {id,mode,prompt,detail,options,answer:options.indexOf(correct),explanation};
}

function advancedSequence(seed:number,d:Difficulty):LogicTask{
  const variant=seed%4;
  if(variant===0){
    const base=randomInt(2,5),values=[1,2,3,4,5].map(n=>base*n*n),correct=base*36;
    return makeTask(`v6-seq-square-${base}`,"sequence","Welche Zahl folgt?",`${values.join(" · ")} · ?`,String(correct),[String(base*25),String(correct+base),String(correct-base)],`Regel: ${base}×n².`);
  }
  if(variant===1){
    const start=randomInt(2,8),mult=d===1?2:randomInt(2,3),values=[start];
    for(let i=1;i<5;i++) values.push(values[i-1]*mult);
    const correct=values[4]*mult;
    return makeTask(`v6-seq-geo-${start}-${mult}`,"sequence","Welche Zahl folgt?",`${values.join(" · ")} · ?`,String(correct),[String(correct/mult),String(correct+mult),String(correct-mult)],`Regel: ×${mult}.`);
  }
  if(variant===2){
    const start=randomInt(10,24),plus=randomInt(3,7),minus=randomInt(1,3),values=[start];
    for(let i=1;i<5;i++) values.push(values[i-1]+(i%2===1?plus:-minus));
    const correct=values[4]+plus;
    return makeTask(`v6-seq-altgap-${start}-${plus}-${minus}`,"sequence","Welche Zahl folgt beim Wechselmuster?",`${values.join(" · ")} · ?`,String(correct),[String(values[4]-minus),String(correct+1),String(correct-1)],`Regel: +${plus}, −${minus}, +${plus}, −${minus}.`);
  }
  const start=randomInt(2,8),step=randomInt(2,5),values=[start,start+step,start+step*3,start+step*6,start+step*10],missing=2+(seed%2),correct=values[missing],shown=values.map((v,i)=>i===missing?"?":String(v));
  return makeTask(`v6-seq-tri-gap-${start}-${step}-${missing}`,"sequence","Welche Zahl fehlt innerhalb der Folge?",shown.join(" · "),String(correct),[String(correct-step),String(correct+step),String(correct+1)],`Abstände: +${step}, +${step*2}, +${step*3}, +${step*4}.`);
}

function advancedRule(seed:number,d:Difficulty):LogicTask{
  const x=randomInt(3,9),variant=seed%4,offset=randomInt(2,d===3?7:5);
  if(variant===0){
    const correct=x*x+offset;
    return makeTask(`v6-rule-square-plus-${x}-${offset}`,"rule","Welche Ausgabe passt zum Muster?",`2 → ${4+offset} · 3 → ${9+offset} · ${x} → ?`,String(correct),[String(x*x),String(correct+offset),String(correct-1)],`Regel: x² + ${offset}.`);
  }
  if(variant===1){
    const correct=x*(x-1);
    return makeTask(`v6-rule-prev-product-${x}`,"rule","Welche Ausgabe folgt?",`3 → 6 · 5 → 20 · ${x} → ?`,String(correct),[String(x*x),String(x*(x+1)),String(correct+1)],"Regel: x(x−1)." );
  }
  if(variant===2){
    const mult=randomInt(2,4),correct=(x+offset)*mult-offset;
    return makeTask(`v6-rule-composed-${x}-${mult}-${offset}`,"rule","Welche Ausgabe folgt aus der zusammengesetzten Regel?",`2 → ${(2+offset)*mult-offset} · 4 → ${(4+offset)*mult-offset} · ${x} → ?`,String(correct),[String(x*mult),String(correct+offset),String(correct-mult)],`Regel: (x+${offset})×${mult}−${offset}.`);
  }
  const correct=2*x*x-x;
  return makeTask(`v6-rule-double-square-${x}`,"rule","Erkenne die Regel.",`2 → 6 · 3 → 15 · ${x} → ?`,String(correct),[String(x*x),String(2*x*x),String(correct+1)],"Regel: 2x²−x.");
}

function advancedMatrix(seed:number):LogicTask{
  const symbols=["●","▲","■","◆","✦","⬟","⬢","◇","○","□","△","◈"];
  const [a,b,c,d]=shuffled(symbols).slice(0,4);
  const variant=seed%3;
  if(variant===0) return makeTask(`v6-mat-reverse-${a}${b}${c}`,"matrix","Welches Symbol ergänzt die Matrix?",`${a} ${b} ${c} | ${c} ${b} ${a} | ${a} ${b} ?`,c,symbols.filter(x=>x!==c).slice(0,3),"Die Paare tauschen ihre Positionen.");
  if(variant===1) return makeTask(`v6-mat-cycle4-${a}${b}${c}${d}`,"matrix","Welche Form schließt die Doppelrotation?",`${a} ${b} ${c} ${d} | ${d} ${a} ${b} ${c} | ${c} ${d} ${a} ?`,b,symbols.filter(x=>x!==b).slice(0,3),"Vier Symbole rotieren zyklisch nach links.");
  return makeTask(`v6-mat-repeat-${a}${b}${c}`,"matrix","Welche Form fehlt?",`${a} ${b} ${a} | ${b} ${c} ${b} | ${c} ${a} ?`,c,symbols.filter(x=>x!==c).slice(0,3),"Das Endsymbol einer Gruppe startet die nächste Gruppe doppelt.");
}

function advancedOperator(seed:number,d:Difficulty):LogicTask{
  const a=randomInt(2,7),b=randomInt(2,6),variant=seed%(d===1?2:4);
  const formulas=[
    {value:a*a+b,expr:"a² + b",rule:"a² + b"},
    {value:a+b*b,expr:"a + b²",rule:"a + b²"},
    {value:2*a*b-a,expr:"2ab − a",rule:"2ab − a"},
    {value:(a+b)*2+b,expr:"2(a+b) + b",rule:"2(a+b) + b"},
  ];
  const f=formulas[variant];
  return makeTask(`v6-op-${variant}-${a}-${b}`,"operator","Berechne mit der neuen Operatorregel.",`Wenn a ★ b = ${f.expr}, was ist ${a} ★ ${b}?`,String(f.value),[String(f.value+1),String(f.value-1),String(a*b)],`Regel: ${f.rule}.`);
}

function advancedDeduction(seed:number):LogicTask{
  const variants=[
    ["Alle A sind B. Alle B sind C. Y ist A.","Y ist C",["Y ist nicht C","Alle C sind A","Kein A ist B"],"Dreistufige Kette A→B→C; C schließt D aus."],
    ["Kein D ist E. Alle F sind D. Z ist F.","Z ist nicht E",["Z ist E","Alle E sind D","Kein F ist D"],"Direkte Mengeninklusion."],
    ["Alle G sind H. Kein H ist J. X ist G.","X ist nicht J",["X ist J","Alle J sind G","Kein G ist H"],"P→Q und Q schließt R aus."],
    ["Einige K sind L. Alle L sind M.","Einige K sind M",["Alle K sind M","Kein K ist M","Alle M sind L"],"Existenz plus Inklusion."],
  ] as const;
  const v=variants[seed%variants.length];
  return makeTask(`v6-ded-${v[0]}`,"deduction","Welche Aussage folgt sicher?",v[0],v[1],[...v[2]],v[3]);
}

export function createLogicExpansionTasks(seed:number,difficulty:Difficulty):LogicTask[]{
  return [
    advancedSequence(seed+1,difficulty),
    advancedRule(seed+11,difficulty),
    advancedMatrix(seed+23),
    advancedOperator(seed+37,difficulty),
    advancedDeduction(seed+51),
  ];
}
