const TESTING = true;
gcd=(a,b)=>{[a,b]=[abs(a),abs(b)];while(b){if(b>a)[a,b]=[b,a];else[a,b]=[b,a%b]}return a};
dispPs=(distrib)=>console.log(simp(distrib.map(a=>a[1]).reduce(add)),distrib.map(([v,p])=>[v+"",float(p),p[0]+"/"+p[1]]));

q=(n)=>ia(n)?n:[BigInt(n),1n];
float=(n)=>{n=simp(q(n));return Number(n[0])/Number(n[1])};
simp=q=>{let f=gcd(...q);return q.map(a=>a/f)};
abs=(n)=>n>=0?n:-n;
round=([p,q])=>p/q+p%q*2n/q

add=([a1,b1],[a2,b2])=>{let f=gcd(b1,b2);return[a1*b2/f+a2*b1/f,b1*b2/f]};
sub=([a1,b1],[a2,b2])=>{let f=gcd(b1,b2);return[a1*b2/f-a2*b1/f,b1*b2/f]};
p=([p,q],[n,d])=>simp([p*n,q*d]);
d=([p,q],[n,d])=>simp([p*d,q*n]);
gt=([a1,b1],[a2,b2])=>a1*b2>a2*b1;
ge=([a1,b1],[a2,b2])=>a1*b2>=a2*b1;
eq=([a1,b1],[a2,b2])=>a1*b2==a2*b1;

enchs = JSON.parse(fs.readFileSync("enchs.json")).slice(1)
names = Object.fromEntries(enchs.map(a=>[a[4],a[0]]));
namesR = Object.fromEntries(enchs.map(a=>[a[0],a[4]]));
(conflicts=[["P","Pp","Fp","Bp"],["Ds","Fw"],["Sh","Sm","Boa"],["Fo","St"],["In","M"],["Pi","Ms"],["Ch","Rip"],["Ly","Rip"],["Aa"],["Cob"],["Cov"],["E"],["Ff"],["Fa"],["Fl"],["Im"],["Kb"],["Lo"],["Lots"],["Lu"],["Po"],["Pu"],["Qc"],["Re"],["Se"],["Th"],["U"]]).map(a=>a.map(b=>namesR[b]))
items="all: M U Cov, sword: Boa Fa Kb Lo Sh Sm Se, tool: E Fo St, bow: Fl In Po Pu, frod: Lots Lu, trident: Ch Im Ly Rip, xbow: Ms Pi Qc, hat: Aa P Re Cob, chest: P Th Cob, leg: P Cob, boot: P Ds Ff Fw Cob".split(", ").map(a=>a.split(": ").map((a,i)=>i==0?a:a.split(" ")))
items.push(["book","Aa Boa Bp Ch Cob Ds E Ff Fa Fp Fl Fo Fw Im In Kb Lo Ly Lots Lu Ms Pi Po Pp P Pu Qc Re Rip Sh St Sm Se Th".split(" ")])
items.slice(1).forEach(a=>items[0][1].forEach(b=>a[1].push(b))); items.forEach(a=>a[1].sort()); items
convertItem=a=>{let ret=[];let set=new Set(a);while(set.size>0){let t=[...set][0];ret.push(conflicts.find(a=>a.includes(t)));set.delete(t)}return uniq(ret).map(b=>b.filter(c=>a.includes(c)))};
items=Object.fromEntries(items.map(a=>[a[0],convertItem(a[1])]))


intF=([p,q])=>simp([(60n*q-200n*abs(p))*p,9n*q*q]);
recomb=(arr,keyIsNum=false)=>{let ret={};arr.forEach(a=>ret[a[0]]=add((ret[a[0]]??q(0)),a[1]));return Object.entries(ret).map(a=>[keyIsNum?BigInt(a[0]):a[0],simp(a[1])])};

// Takes an enchantability (eg 1-49) and outputs the final_level
// round(e * triange(.85,1.15))
enchantabilityToFinalLevel = probabilities =function(lvl) {
  lvl=q(lvl);
  let l = round(p(lvl,[17n,20n]));
  let h = round(p(lvl,[23n,20n]));
  let ret = [];
  for (let i = l; i <= h; i+=1n) {
    let low = d([(2n*i-1n),2n],lvl);
    let high = d([(2n*i+1n),2n],lvl);
    low = [low[0]-low[1],low[1]];
    high = [high[0]-high[1],high[1]];

    low = gt([-3n,20n],low)?[-3n,20n]:low;
    high = gt(high,[3n,20n])?[3n,20n]:high;

    low = intF(low);
    high = intF(high);

    let out = simp(sub(high,low));
    if (out[0]!=0)
      ret.push([i, out]);
  }

  if (TESTING) {
    let total = simp(ret.map(a=>a[1]).reduce(add));
    assert(eq(q(1n),total),true,"enchantabilityToFinalLevel should sum to one, but instead gave "+total[0]+"/"+total[1]);
  }
  return ret;
};

dispPs(enchantabilityToFinalLevel(29n))





eltk=(e,l)=>{
  let ret=[];
  let t = Math.floor(e/4);
  let t2 = 2*t;
  for(let i=0;i<=t2;i++)
    ret.push([l+1+i,1+(i<t?i:t2-i)]);
  let total = sum(ret.map(a=>a[1]));
  return ret.map(a=>[a[0],[BigInt(a[1]),BigInt(total)]]);
}
toFinalLevel=(e,l)=>recomb(eltk(e,l).map(a=>probabilities(a[0]).map(b=>[b[0],p(b[1],a[1])])).flat(),true)

dispPs(toFinalLevel(10,30));





function numEnchs(finalLevel, maxNum) {
  let ret = [q(1)];
  finalLevel = BigInt(finalLevel);
  for (let i = 1; i<maxNum; i++) {
    let noom = finalLevel+1n;
    let denom = 50n;
    ret.push([ret[i-1][0]*noom, ret[i-1][1]*denom]);
    ret[i-1][0] = ret[i-1][0]*(denom-noom);
    ret[i-1][1] = ret[i-1][1]*denom;
    finalLevel = finalLevel / 2n;
  }
  return ret.map((a,i)=>[i+1,simp(a)]);
}

dispPs(numEnchs(33,9))







// Directly Taken:
permutationsCalc=n=>n<=1?[[0]]:range(n).map(i=>permutations(n-1).map(p=>[...p.splice(0,i),n-1,...p])).flat().sort();
permutationsCache = {};
permutations=n=>n<=1?[[0]]:JSON.parse(permutationsCache[n]??(permutationsCache[n]=JSON.stringify(permutationsCalc(n))));
permute=(arr,perm)=>arr.map((a,i)=>arr[perm[i]]);
permutationsOf=(arr)=>permutations(arr.length).map(p=>permute(arr,p));
split=(arr,leftInds)=>{let r1=[],r2=[];arr.forEach((a,i)=>{if(leftInds.includes(i))r1.push(a);else r2.push(a);});return [r1,r2]};
function choose(size, qty) {
  let ret = [];
  let stack = [[0, []]];
  while (stack.length) {
    let [start, current] = stack.pop();
    if (current.length == qty)
      ret.push(current);
    else
      for (let i = size - qty + current.length; i >= start; i--)
        stack.push([i + 1, current.concat(i)]);
  }
  return ret;
}





























// fullProbabilities -> toFinalLevel, getBuckets, numEnchs, processLine, recomb
// toFinalLevel -> probabilities, eltk, recomb
// getBuckets -> items
// processLine -> transpose, pTake, bifurcateBuckets
// pTake -> choose, pTakeAll -> pTakeOne, permutationsOf -> permute, permutations -> permutationsCalc, permutationsCache

// items

// processLine=str=>{[q,s]=str.split(";");s=s.split(" ").map(a=>a.split("|"));return transpose([choose(s.length,q).map(c=>split(s,c)[0]),pTake(s.map(b=>sum(b.map(a=>Number(a.split(",")[2])))),Number(q))]).map(([bs,p1])=>bifurcateBuckets(bs.map(b=>b.map(e=>{[name,lvl,wt]=e.split(",");return[name+lvl,Number(wt)]}))).map(([o,p2])=>[o,p1*p2])).flat().map(([ns,p])=>[ns.join(","),p])}
// fullProbabilities=(level=30,treasure=false,enchantability=10,itemType="tool")=>{
//   let enchDat = recomb(toFinalLevel(enchantability,level).map(a=>[a[0],a[1],getBuckets(itemType,a[0],treasure)]).map(a=>numEnchs(a[0],a[2].split(" ").length).map((b,i)=>[(i+1)+";"+a[2],a[1]*b])).flat(),false);
//   return recomb(enchDat.map(([str,p1])=>processLine(str).map(([ench,p2])=>[ench,p1*p2])).flat(),false)//.map(([n,p])=>[n.replaceAll(/[a-z,]/g,"").split(/(..)/).sort().join(""),p]).sort();
// }
// getBuckets=(item,lvl,treasure)=>{
//   if (!item) return Object.keys(items);
//   if (!ia(item))
//     item = items[item];
//   if (!item) return;
//   let enchObs = item.map(a=>a.map(b=>enchs.find(c=>c[4]==b)));
//   // enforce treasure
//   enchObs = enchObs.map(a=>a.filter(a=>treasure||!a[3])).filter(a=>a.length);
//   // enforce level
//   enchObs = enchObs.map(a=>a.filter(a=>lvl<=a[5] && lvl>=a[6])).filter(a=>a.length);
//   // Name Lvl Weight
//   return enchObs.map(a=>a.map(b=>b[4]+","+(0+sum(b.slice(6),a=>a<=lvl))+","+b[2]).sort().join("|")).sort().join(" ")
// }
// bifurcateBuckets=(bs)=>{let ret=[[[],1]];bs.forEach(b=>ret=b.map(([e,pn],i)=>ret.map(([r,pc])=>[[...r,e],pc*(pn??1)/sum(b,a=>a[1])])).flat());return ret};JSON.stringify(bifurcateBuckets([[["a",1]],[["b",3],["c",2]],[["d",7]]]))


// pTakeOne=(ws,x)=>{let ret=1,run=x;for(let i=0;i<ws.length-1;i++)ret*=(run+=ws[i]);return 1/ret};
// pTakeAll=(ws,x)=>prod(ws)/(sum(ws)+x)*sum(permutationsOf(ws).map(wsp=>pTakeOne(wsp,x)));
// pTake=(ws,qty)=>choose(ws.length,qty).map(c=>{[y,n]=split(ws,c);return pTakeAll(y,sum(n))})

