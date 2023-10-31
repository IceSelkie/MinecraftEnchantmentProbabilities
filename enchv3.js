const crypto=require("crypto");
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

// dispPs(enchantabilityToFinalLevel(29n))





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

// dispPs(toFinalLevel(10,30));





function numEnchs(finalLevel, maxNum) {
  let ret = [q(1)];
  finalLevel = BigInt(finalLevel);
  for (let i = 1; i<maxNum; i++) {
    let noom = finalLevel+1n;
    let denom = 50n;
    if (noom >= denom)
      noom = denom = 1n;
    ret.push([ret[i-1][0]*noom, ret[i-1][1]*denom]);
    ret[i-1][0] = ret[i-1][0]*(denom-noom);
    ret[i-1][1] = ret[i-1][1]*denom;
    finalLevel = finalLevel / 2n;
  }
  if (TESTING) {
    let total = simp(ret.reduce(add));
    assert(eq(q(1n),total),true,"numEnchs should sum to one, but instead gave "+total[0]+"/"+total[1]);
    for (let i=0; i<ret.length; i++) {
      let a=ret[i];
      assert(a[0]*a[1] >= 0n,true,`numEnchs probability for qty=${i+1} should be nonnegative, but instead gave ${a[0]}/${a[1]}`);
      assert(a[0] <= a[1],true,`numEnchs probability for qty=${i+1} should be <=1, but instead gave ${a[0]}/${a[1]}`);
    }
  }
  return ret.map((a,i)=>[i+1,simp(a)]);
}

// dispPs(numEnchs(33,9))




// Generates all combinations of `qty` indecies `size` items. Will return an array with $size c qty$ entries.
choose=(size,qty,off=0,ret=[])=>ret.length==qty?[ret]:off==size?[]:[...choose(size,qty,off+1,ret.concat(off)),...choose(size,qty,off+1,ret)];

// final=(ws,x)=>prod(ws)/(x+sum(ws))*harmonic(ws,x)
// harmonic=(ws,x)=>sum(permutationsOf(ws).map(permutation=>1/helper(permutation,x)));
// helper=(ws,x)=>{let ret=1,run=x;for(let i=0;i<ws.length-1;i++)ret*=(run+=ws[i]);return ret};
// So=(ws,x)=>{let key=JSON.stringify([x,ws]);if(sco[key])return sco[key];ps.push(key);let ret=ws.length==1?1/(x+ws[0]):sum(ws.map((wi,i)=>So(ws.filter((w,j)=>i!=j),x+wi)/(x+wi)));return sco[key]=ret;}
sc={};S=(ws,x)=>{if(ws.length==1)return [ws[0],x+ws[0]];let key=x+"|"+ws.join();return sc[key]??(sc[key]=simp((ws.map((wi,i)=>p([wi,x+wi],S(ws.filter((w,j)=>i!=j),x+wi)))).reduce(add)))}
SH=(ws,x)=>x==0?q(1n):ws.length==0||sum(ws)==0?q(0n):S(ws.sort(),x);
takeQty=(weights,quantity)=>choose(weights.length,quantity).map(c=>SH(weights.filter((_,i)=>c.includes(i)),sum(weights.filter((_,i)=>!c.includes(i)))))

// console.log(crypto.Hash("sha256").update(takeQty(range(1,9).map(BigInt),3).flat().join()).digest("hex"));
// console.log("432d6f13c29894ccec1d5a190933a59539477f602ec5b7b5100f8adb4be08480");
// console.log(simp(takeQty([1n,2n,3n,5n,10n],3).reduce(add)),takeQty([1n,2n,3n,5n,10n],3).map(float));





// Take buckets with multiple enchantes (eg silk and fortune are mutually exclusive)
// and split these properties by the chance of each occuring.
bifurcateBuckets=(buckets)=>{
  let ret=[[[],[1n,1n]]];
  buckets.forEach(bucket=>
    ret=bucket.map(
      ([ench,enchWt],i)=>
      ret.map(
        ([runningEnchs,runningProb])=>{
          let enchs = [...runningEnchs,ench];
          let prob = p(runningProb,[enchWt??1n,sum(bucket,([ench,enchWt])=>enchWt)])
          return [enchs,prob];
        }
      )
    )
    .flat()
  );
  return ret
};

// dispPs(bifurcateBuckets([[["a",1n]],[["b",3n],["c",2n]],[["d",7n]]]))





// Take a string describing an item and qty of enchants
// to output items and probabilities.
processLine=str=>{
  [qty,s]=str.split(";");
  s=s.split(" ").map(a=>a.split("|"));
  return transpose(
    [
      choose(s.length,qty).map(c=>s.filter((_,i)=>c.includes(i))),
      takeQty(s.map(b=>sum(b.map(a=>{let[name,lvl,wt]=a.split(",");return BigInt(wt)}))),Number(qty))
    ]
  ).map(
    ([bs,p1])=>
    bifurcateBuckets(bs.map(b=>b.map(e=>{
      [name,lvl,wt]=e.split(",");
      return[name+lvl,BigInt(wt)]
    })))
    .map(([o,p2])=>[o,p(p1,p2)])
  ).flat().map(([ns,prob])=>[ns.join(","),prob])
}

// dispPs(processLine("2;E,4,10 Fo,3,2|St,1,1 U,3,5"))





getBuckets=(item,lvl,treasure)=>{
  if (!item) return Object.keys(items);
  if (!ia(item))
    item = items[item];
  if (!item) return;
  let enchObs = item.map(a=>a.map(b=>enchs.find(c=>c[4]==b)));
  // enforce treasure
  enchObs = enchObs.map(a=>a.filter(a=>treasure||!a[3])).filter(a=>a.length);
  // enforce level
  enchObs = enchObs.map(a=>a.filter(a=>lvl<=a[5] && lvl>=a[6])).filter(a=>a.length);
  // Name Lvl Weight
  return enchObs.map(a=>a.map(b=>b[4]+","+(0+sum(b.slice(6),a=>a<=lvl))+","+b[2]).sort().join("|")).sort().join(" ")
}
fullProbabilities=(level=30,treasure=false,enchantability=10,itemType="tool")=>{
  let finalLevels = toFinalLevel(enchantability,level);
  if (TESTING) console.log(finalLevels);
  let withBuckets = finalLevels.map(([finalLevel,prob])=>[finalLevel,prob,getBuckets(itemType,finalLevel,treasure)]);
  if (TESTING) console.log(withBuckets);
  let bucketsWithEnchQtys = withBuckets.map(([finalLevel,bucketProb,bucket])=>
      numEnchs(finalLevel, bucket.split(" ").length)
      .map(([enchQty,qtyProb],i)=>[enchQty+";"+bucket,p(bucketProb,qtyProb)])
    )
  bucketsWithEnchQtys = recomb(bucketsWithEnchQtys.flat());
  if (TESTING) console.log(bucketsWithEnchQtys);
  // Should be ["2;E,4,10 Fo,3,2|St,1,1 U,3,5", 123/456]
  // Meaning: pick 2 from: EffIV, (FortIII or Silk), and UnbIII.

  let toItems = recomb(
    bucketsWithEnchQtys
    .map(([str,bucketProb])=>
      processLine(str)
      .map(([item,itemProb])=>[item,p(bucketProb,itemProb)]))
    .flat(),false
  );
  return toItems;
}

// time(()=>fullProbabilities(50,true,10)).forEach(a=>console.log(a.join("  ")));
dispPs(fullProbabilities(30,false,10,"sword"))
// fullProbabilities(30,false,10,"sword")

// // Generate Input for SVG Graph:
// groupBy=d=>{let ret=Object.fromEntries([...new Set(d.map(a=>a[0]))].map(a=>[a,[]]));d.forEach(a=>ret[a[0]].push(a.slice(1)));return Object.entries(ret);}
// console.log(JSON.stringify([0,10,20,30].map(t=>[t,groupBy(recomb(fullProbabilities(t,false,10).map(a=>a[0].split(",").map(b=>[b,a[1]])).flat()).map(a=>[a[0].slice(0,-1),Number(a[0].slice(-1)),float(a[1])]))])));

console.log("Final Cache size:",Object.entries(sc).length);












