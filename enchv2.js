
// function numberOfEnchantments(finalLevel, maxNum) {
//   let modifiedLevel = finalLevel;
//   let running = 1;
//   let ret = [1];
//   let sum = 0;
//   for (let step=2; step<=maxNum; step++) {
//     let addProb = modifiedLevel+1;
//     ret.push(addProb*running);
//     running *= addProb;
//     modifiedLevel = Math.floor(modifiedLevel/2);
//   }
//   running = 1;
//   for (let i=ret.length-2; i>=0; i--)
//     ret[i] *= running*=50;
//   ret.forEach(a=>sum+=a);
//   // return ret.map(a=>[a,sum]);
//   return ret.map((a,i)=>[i+1,a/sum]);
// }
function numEnchs(finalLevel, maxNum) {
  let ret = [[1,1]];
  for (let i = 1; i<maxNum; i++) {
    let noom = finalLevel+1;
    let denom = 50;
    if (noom >= denom)
      noom = denom = 1;
    ret.push([ret[i-1][0]*noom, ret[i-1][1]*denom]);
    ret[i-1][0] = ret[i-1][0]*(denom-noom);
    ret[i-1][1] = ret[i-1][1]*denom;
    finalLevel = Math.floor(finalLevel / 2);
  }
  return ret.map(a=>a[0]/a[1]);
  return ret.map(simp);
}

simp=q=>{let f=gcd(...q);return q.map(a=>a/f)}


dispPs=(distrib)=>console.log(sum(distrib,a=>Number(a[1])),distrib.map(([v,p])=>[v+"",Number(p)]).filter(a=>a[1]));



// normalized integral of .15-|x| so that int_-.15^.15 = 1
// int_0^x (3/20-|t|)dt * 400/9
const integralFunction = (x) => (60 - 200*Math.abs(x)) * x / 9;


// Takes an enchantability (eg 1-49) and outputs the final_level
// round(e * triange(.85,1.15))
const probabilities = function(lvl) {
  if (lvl <= 0) {
    throw new Error('Input must be a positive number');
  }
  const SCALE_DOWN_FACTOR = 17 / 20;
  const SCALE_UP_FACTOR = 23 / 20;

  let min = Math.round(lvl * SCALE_DOWN_FACTOR);
  let max = Math.round(lvl * SCALE_UP_FACTOR);

  let ret = [];
  for (let i = min; i <= max; i++) {
    let low = i - 0.5;
    let high = i + 0.5;

    low = Math.max(-0.15, low / lvl - 1);
    high = Math.min(0.15, high / lvl - 1);

    low = integralFunction(low);
    high = integralFunction(high);

    ret.push([i, high - low]);
  }
  return ret;
};
eltk=(e,l)=>{let ret=[];let t=Math.floor(e/4);for(let i=0;i<=2*t;i++)ret.push([l+1+i,1+(i<t?i:2*t-i)]);t=sum(ret.map(a=>a[1]));return ret.map(a=>[a[0],a[1]/t])}


// dispPs(probabilities(29))


// Emperically verify
emp1=(lvl)=>Math.round(lvl+lvl*((Math.random()+Math.random())*.15-.15))
emp=(lvl,qty=1e5)=>{let o=new Array(50).fill(0);for(let i=0;i<qty;i++)o[emp1(lvl)]++;return o;}
chisqGof=(exp,obs)=>{
  if (!exp)
    return "chisqGof(exp,gof);\nhttps://www.itl.nist.gov/div898/handbook/eda/section3/eda3674.htm";
  let se = sum(exp);
  let so = sum(obs);
  if (se!=so)
    exp = exp.map(a=>a*so/se)
  return sum(obs.map((o,i)=>(o-exp[i])*(o-exp[i])/exp[i]))
}

// 13 dof -> 18.55 is cutoff for p=0.10 with any number of samples.
// 1e7 = 10 000 000 samples.
chisqGof(probabilities(41).map(a=>a[1]*1e7),emp(41,1e7).slice(35,48))
// This passes a billion samples just fine.

chisqHomo=(obs)=>{
  let b=[obs.map(a=>sum(a)),transpose(obs).map(a=>sum(a))];
  let t=sum(b[0]);
  let exp=b[0].map(x=>b[1].map(y=>x*y/t));
  return chisqGof(exp.flat(),obs.flat());
}

emp1final=(ench,lvl)=>Math.round((lvl+1+Math.floor((1+Math.floor(ench/4))*Math.random())+Math.floor((1+Math.floor(ench/4))*Math.random()))*(1+.15*(Math.random()+Math.random()-1)))
emp1final=(ench,lvl) => {
  // fn eltk |-> distrib(k)
  let rand_enchantability = 1
        +Math.floor((1+Math.floor(ench/4))*Math.random())
        +Math.floor((1+Math.floor(ench/4))*Math.random());
  let k = lvl+rand_enchantability;

  // fn probabilities(k) |-> distrib(final_level)
  let bonus = 1 + .15*(Math.random()+Math.random()-1);
  let final_level = Math.round(k*bonus);

  return final_level;
}


pickEs=final=>{
  let r=[];
  let ps=[10,3,5,2,1]; // 21
  let t=sum(ps);
  let ns=[..."EFUMV"]; // MV = treasure
  // console.log(r,t,ps,ns);
  while (ps.length>0) {
    let v=Math.floor(t*Math.random());
    // console.log(v,t);
    let i=0;
    while (v>=ps[i]) {
      v-=ps[i++];
      // console.log(i,v);
    }
    // Combine Fort and Silk so that they are mutally exclusive
    if (ns[i]=="F" && v==0)
      ns[i]="S";
    // console.log(i,ps[i],ns[i]);
    r.push(ns[i]);
    t-=ps[i];
    ns.splice(i,1);
    ps.splice(i,1);
    // console.log(t,ps,ns,r);

    if (Math.random() > (final+1)/50)
      return r.sort().join("");
    final = Math.floor(final/2);
    // console.log("final:",final);
  }
  return r.sort().join("");
}


// items = [{weight:10,name:eff},...]
// function combinations(items, qty) {
//   let ret = [];
//   let inds = range(qty);

//   while (true){
//     let out = inds.map(i=>items[i]);
//     ret.push([out.map(a=>a.name).join(),prod(out.map(a=>a.weight))]);

//     // Find the rightmost index that hasn't reached its maximum value
//     let pos = qty-1;
//     while (pos>=0 && inds[pos]==items.length-qty+pos)
//       pos--;
//     if (pos<0)
//       break;
//     // increment that pos and update all after it
//     inds[pos]++;
//     for (let i=pos+1;i<qty;i++) {
//       inds[i]=inds[i-1]+1;
//     }
//   }
//   let total = sum(ret,a=>a[1]);
//   return ret.map(a=>[a[0], a[1]/total]);
//   // return ret.map(a=>[a[0],simp([a[1],total])]);
// }

// return all subsequences of range(size) with length qty
// eg (4,2) -> [[0,1], [0,2], [0,3], [1,2], [1,3], [2,3]]
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


time(()=>distrib(range(794660).map(a=>pickEs(emp1final(10,30)))))
gcd=(a,b)=>b==0?a:b>a?gcd(b,a):gcd(b,a%b)
gcd=(a,b)=>{while(b){if(b>a)[a,b]=[b,a];else[a,b]=[b,a%b]}return a};



recomb=(arr,keyIsNum=true)=>{let ret={};arr.forEach(a=>ret[a[0]]=(ret[a[0]]??0)+a[1]);return Object.entries(ret).map(a=>[keyIsNum?Number(a[0]):a[0],a[1]])}

toFinalLevel=(e,l)=>recomb(eltk(e,l).map(a=>probabilities(a[0]).map(b=>[b[0],b[1]*a[1]])).flat())



dispPs(toFinalLevel(10,27));
dispPs(numEnchs(33,9).map((a,i)=>[i+1,a]));

//
dist = {} ; (zlib.unzipSync(fs.readFileSync("pick_diam_30.nbt"))+"").split("\x0a").map(a=>a.split("\x09")).flat().filter((v,i,a)=>i>0&&a[i-1].includes("Enchantments")).map(a=>a.split(/\x00[\x02\x00]\x00/).filter(a=>a&&!a.includes("Slot")&&!a.includes("DataVersion")).map(a=>[a,a.indexOf("\x03lvl"),a.indexOf("\x02id")]).map(a=>[a[0].substring(a[2]+15),a[0].charCodeAt(a[1]+5)])).map(a=>JSON.stringify(Object.fromEntries(a.sort()))).forEach(a=>dist[a]?dist[a]++:dist[a]=1) ; dist=Object.entries(dist).sort((a,b)=>b[1]-a[1]) ; dist=Object.fromEntries([[['"total"',dist.map(a=>a[1]).reduce((c,n)=>c+n,0)]],dist].flat())
dist2 = {}; Object.entries(dist).map(a=>[Object.entries(JSON.parse(a[0])).map(a=>a[0][0]).sort().join("").toUpperCase(),a[1]]).sort().forEach(a=>dist2[a[0]]=(dist2[a[0]]??0) + a[1]) ; dist2=Object.entries(dist2).filter(a=>a[0] && !a[0].startsWith("0")).sort()
dist3 = {}; Object.entries(dist).map(a=>[Object.entries(JSON.parse(a[0])).map(a=>a[0][0]+a[1]).sort().join("").toUpperCase(),a[1]]).sort().forEach(a=>dist3[a[0]]=(dist3[a[0]]??0) + a[1]) ; dist3=Object.entries(dist3).filter(a=>a[0] && !a[0].startsWith("0") && a[0].length%2==0).sort()

distt = {} ; (zlib.unzipSync(fs.readFileSync("pick_diam_30t.nbt"))+"").split("\x0a").map(a=>a.split("\x09")).flat().filter((v,i,a)=>i>0&&a[i-1].includes("Enchantments")).map(a=>a.split(/\x00[\x02\x00]\x00/).filter(a=>a&&!a.includes("Slot")&&!a.includes("DataVersion")).map(a=>[a,a.indexOf("\x03lvl"),a.indexOf("\x02id")]).map(a=>[a[0].substring(a[2]+15),a[0].charCodeAt(a[1]+5)])).map(a=>JSON.stringify(Object.fromEntries(a.sort()))).forEach(a=>distt[a]?distt[a]++:distt[a]=1) ; distt=Object.entries(distt).sort((a,b)=>b[1]-a[1]) ; distt=Object.fromEntries([[['"total"',distt.map(a=>a[1]).reduce((c,n)=>c+n,0)]],distt].flat())
dist2t = {}; Object.entries(distt).map(a=>[Object.entries(JSON.parse(a[0])).map(a=>a[0][0]).sort().join("").toUpperCase(),a[1]]).sort().forEach(a=>dist2t[a[0]]=(dist2t[a[0]]??0) + a[1]) ; dist2t=Object.entries(dist2t).filter(a=>a[0] && !a[0].startsWith("0")).sort()
dist3t = {}; Object.entries(distt).map(a=>[Object.entries(JSON.parse(a[0])).map(a=>a[0][0]+a[1]).sort().join("").toUpperCase(),a[1]]).sort().forEach(a=>dist3t[a[0]]=(dist3t[a[0]]??0) + a[1]) ; dist3t=Object.entries(dist3t).filter(a=>a[0] && !a[0].startsWith("0")).sort()


// Ensure number of enchantments is correct
obs = recomb(dist2.map(a=>[a[0].length,a[1]])).map(a=>a[1])
exp = recomb(toFinalLevel(10,30).map(a=>numEnchs(a[0],3).map((b,i)=>[i+1,b*a[1]])).flat()).map(a=>a[1]*sum(obs))
assert(chisqGof(exp,obs)<5.991,undefined,"Number of enchants wrong");










// Sw and Ss not obtainable even with treasure
enchs = JSON.parse(fs.readFileSync("enchs.json")).slice(1)
names = Object.fromEntries(enchs.map(a=>[a[4],a[0]]));
namesR = Object.fromEntries(enchs.map(a=>[a[0],a[4]]));

(conflicts=[["P","Pp","Fp","Bp"],["Ds","Fw"],["Sh","Sm","Boa"],["Fo","St"],["In","M"],["Pi","Ms"],["Ch","Rip"],["Ly","Rip"],["Aa"],["Cob"],["Cov"],["E"],["Ff"],["Fa"],["Fl"],["Im"],["Kb"],["Lo"],["Lots"],["Lu"],["Po"],["Pu"],["Qc"],["Re"],["Se"],["Th"],["U"]]).map(a=>a.map(b=>namesR[b]))
items="all: M U Cov, sword: Boa Fa Kb Lo Sh Sm Se, tool: E Fo St, bow: Fl In Po Pu, frod: Lots Lu, trident: Ch Im Ly Rip, xbow: Ms Pi Qc, hat: Aa P Re Cob, chest: P Th Cob, leg: P Cob, boot: P Ds Ff Fw Cob".split(", ").map(a=>a.split(": ").map((a,i)=>i==0?a:a.split(" ")))
items.push(["book","Aa Boa Bp Ch Cob Ds E Ff Fa Fp Fl Fo Fw Im In Kb Lo Ly Lots Lu Ms Pi Po Pp P Pu Qc Re Rip Sh St Sm Se Th".split(" ")])
items.slice(1).forEach(a=>items[0][1].forEach(b=>a[1].push(b))); items.forEach(a=>a[1].sort()); items
convertItem=a=>{let ret=[];let set=new Set(a);while(set.size>0){let t=[...set][0];ret.push(conflicts.find(a=>a.includes(t)));set.delete(t)}return uniq(ret).map(b=>b.filter(c=>a.includes(c)))}
items=Object.fromEntries(items.map(a=>[a[0],convertItem(a[1])]))

// ("tool", 33, true) |-> [bucket...], bucket=[weight, ["E 4 10"...]]
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
  // // get level and weight
  // enchObs = enchObs.map(a=>a.map(a=>{return{wt:a[2],nm:a[4],lvl:(0+sum(a.slice(6),a=>a<=lvl))}}));
  // // get bucket weight
  // enchObs = enchObs.map(a=>{return{wt:sum(a,a=>a.wt),vals:a}});
  // return enchObs.sort((a,b)=>b.wt-a.wt);

  // Name Lvl Weight
  return enchObs.map(a=>a.map(b=>b[4]+","+(0+sum(b.slice(6),a=>a<=lvl))+","+b[2]).sort().join("|")).sort().join(" ")
}




// numEnchs + buckets
enchPick = recomb(toFinalLevel(10,30).map(a=>[a[0],a[1],getBuckets("tool",a[0],true)]).map(a=>numEnchs(a[0],a[2].split(" ").length).map((b,i)=>[(i+1)+";"+a[2],a[1]*b])).flat(),false)



toClasses=(type,e,l,treasure) => recomb(toFinalLevel(e,l).map(a=>[a[0],a[1],getBuckets(type,a[0],treasure)]).map(a=>numEnchs(a[0],a[2].split(" ").length).map((b,i)=>[(i+1)+";"+a[2],a[1]*b])).flat(),false).sort();
toClasses("tool", 10, 30, true)

comphelp=(buckets,qty)=>buckets.length<qty?[]:buckets.length==0?[]:qty==1?buckets.flat():range(buckets.length-qty+1).map(i=>comphelp(buckets.slice(i+1),qty-1).map(r=>buckets[i].map(b=>[b[0]+" "+r[0],r[1]*b[1]]))).flat(2)
comp=(str)=>comphelp(...str.split(";").reverse().map((str,i)=>i==1?Number(str):str.split(" ").map(opt=>opt.split("|").map(val=>val.split(",")).map(a=>[a[0]+","+a[1],Number(a[2])]))))

comphelp("E,3,10 Fo,2,2|St,1,1 U,3,5".split(" ").map(opt=>opt.split("|").map(val=>val.split(",")).map(a=>[a[0]+","+a[1],Number(a[2])])),2)
comp("2;E,3,10 Fo,2,2|St,1,1 U,3,5");






function continuedFractionApproximations(val) {let x=val;let a=Math.floor(x);let approximations=[];let h=[1,a];let k=[0,1];for (let i=2;i<=8;i++) {x=1/(x-a);a=Math.floor(x);h.push(a*h[i-1]+h[i-2]);k.push(a*k[i-1]+k[i-2]);approximations.push([h[i],k[i],Math.abs(1-h[i]/k[i]/val)]);if(x-a==0)break;}return approximations;};
// scale=1e5
// psEmp2=(a,b,c)=>time(()=>distrib(range(Math.round(a*b*c*scale)).map(z=>psEmp(30,[c,b,a],2))).sort())
rs=(a,b,c)=>[a/b,a/c,b/c]
rsp1=(x,a,b)=>a*b/(x+a+b)*(1/(x+a)+1/(x+b))
rsp=(a,b,c)=>[rsp1(a,b,c),rsp1(b,a,c),rsp1(c,a,b)]
ratios=(a,b,c)=>rsp(a,b,c).map(a=>continuedFractionApproximations(a).findLast(a=>a[1]<1e9).slice(0,2)).map((a,i,arr)=>a[0]/a[1]*lcm3(...arr.map(a=>a[1])))
lcm=(a,b)=>a*b/gcd(a,b);lcm3=(a,b,c)=>lcm(a,lcm(b,c))
g=5;range(1,g+1).map(a=>range(a,g+1).map(b=>range(b,g+1).map(c=>gcd(a,gcd(b,c))==1?[[a,b,c],ratios(a,b,c).map(z=>Math.round(z))]:null))).flat(2).filter(a=>a).map(a=>[a[0].join(),a[1].join(":"),sum(a[1])]).map(a=>a[0]+" -> "+a[1]+" / "+a[2])






permutationsCalc=n=>n<=1?[[0]]:range(n).map(i=>permutations(n-1).map(p=>[...p.splice(0,i),n-1,...p])).flat().sort()
permutationsCache = {};
permutations=n=>n<=1?[[0]]:JSON.parse(permutationsCache[n]??(permutationsCache[n]=JSON.stringify(permutationsCalc(n))));
permute=(arr,perm)=>arr.map((a,i)=>arr[perm[i]])
permutationsOf=(arr)=>permutations(arr.length).map(p=>permute(arr,p))
isSym=arr=>transpose(arr.map(permutationsOf)).map(a=>JSON.stringify(a.sort())).reduce((c,n)=>[c[0]||n,c[1]&&(!c[0]||n==c[0])],[null,true])[1]

temp=transpose("a^3 b + a^3 c + 2 a^3 x + 2 a^2 b^2 + 4 a^2 b c + 8 a^2 b x + 2 a^2 c^2 + 8 a^2 c x + 8 a^2 x^2 + a b^3 + 4 a b^2 c + 8 a b^2 x + 4 a b c^2 + 18 a b c x + 18 a b x^2 + a c^3 + 8 a c^2 x + 18 a c x^2 + 12 a x^3 + b^3 c + 2 b^3 x + 2 b^2 c^2 + 8 b^2 c x + 8 b^2 x^2 + b c^3 + 8 b c^2 x + 18 b c x^2 + 12 b x^3 + 2 c^3 x + 8 c^2 x^2 + 12 c x^3 + 6 x^4".split(" + ").map(a=>transpose(a.split(" ").sort().map(a=>[Number(a)||1,...[..."abcx"].map(c=>a.includes(c)?Number(a.slice(a.indexOf("^")+1))||1:0)])).map(a=>a.find(a=>a)??0)).sort((a,b)=>a[4]-b[4]).map(a=>{let ret=new Array(5).fill(null);ret[a[4]]=a.slice(0,4);return ret})).map(a=>a.filter(a=>a))
temp.map(a=>isSym(a.map(b=>b.slice(1))))

pTakeOne=(ws,x)=>{let ret=1,run=x;for(let i=0;i<ws.length-1;i++)ret*=(run+=ws[i]);return 1/ret};
pTakeAll=(ws,x)=>prod(ws)/(sum(ws)+x)*sum(permutationsOf(ws).map(wsp=>pTakeOne(wsp,x)));

[1,2,3,5,10].map((a,i,arr)=>pTakeAll([...arr.slice(0,i),...arr.slice(i+1)],a))

split=(arr,leftInds)=>{let r1=[],r2=[];arr.forEach((a,i)=>{if(leftInds.includes(i))r1.push(a);else r2.push(a);});return [r1,r2]}
pTake=(ws,qty)=>choose(ws.length,qty).map(c=>{[y,n]=split(ws,c);return pTakeAll(y,sum(n))})


obs = recomb(dist2t.filter(a=>a[0].length==3).map(a=>[[...a[0].replaceAll("S","F")].sort().join(""),a[1]]).sort(),false).map(a=>a[1]);
exp = pTake([10,3,2,5,1],3);
assert(chisqGof(exp,obs)<16.919,undefined,"Ratios between ench wrong for 3 enchs");
console.log(sum(pTake([1,2,3,5,10],3)),pTake([1,2,3,5,10],3));






bifurcateBuckets=(bs)=>{let ret=[[[],1]];bs.forEach(b=>ret=b.map(([e,pn],i)=>ret.map(([r,pc])=>[[...r,e],pc*(pn??1)/sum(b,a=>a[1])])).flat());return ret};JSON.stringify(bifurcateBuckets([[["a",1]],[["b",3],["c",2]],[["d",7]]]))
str="3;Cov,1,1 E,4,10 Fo,2,2|St,1,1 M,1,2 U,3,5";
[q,s]=str.split(";");s=s.split(" ").map(a=>a.split("|"));transpose([choose(s.length,q).map(c=>split(s,c)[0]),pTake(s.map(b=>sum(b.map(a=>Number(a.split(",")[2])))),Number(q))]).map(([bs,p1])=>bifurcateBuckets(bs.map(b=>b.map(e=>{[name,lvl,wt]=e.split(",");return[name+lvl,Number(wt)]}))).map(([o,p2])=>[o,p1*p2])).flat()





processLine=str=>{[q,s]=str.split(";");s=s.split(" ").map(a=>a.split("|"));return transpose([choose(s.length,q).map(c=>split(s,c)[0]),pTake(s.map(b=>sum(b.map(a=>Number(a.split(",")[2])))),Number(q))]).map(([bs,p1])=>bifurcateBuckets(bs.map(b=>b.map(e=>{[name,lvl,wt]=e.split(",");return[name+lvl,Number(wt)]}))).map(([o,p2])=>[o,p1*p2])).flat().map(([ns,p])=>[ns.join(","),p])}
recomb(enchPick.map(([str,p1])=>processLine(str).map(([ench,p2])=>[ench,p1*p2])).flat(),false)


expTL = recomb(enchPick.map(([str,p1])=>processLine(str).map(([ench,p2])=>[ench,p1*p2])).flat(),false).map(([n,p])=>[n.replaceAll(/[a-z,]/g,"").replaceAll("C","V").split(/(..)/).sort().join(""),p]).sort().map(a=>a[1])
sampTL = dist3t.map(a=>a[1])

assert(chisqGof(expTL,sampTL)<108.648,undefined,"Incorrect prediction for DiamPick30T");


enchPick2 = recomb(toFinalLevel(10,30).map(a=>[a[0],a[1],getBuckets("tool",a[0],false)]).map(a=>numEnchs(a[0],a[2].split(" ").length).map((b,i)=>[(i+1)+";"+a[2],a[1]*b])).flat(),false)
expL = recomb(enchPick2.map(([str,p1])=>processLine(str).map(([ench,p2])=>[ench,p1*p2])).flat(),false).map(([n,p])=>[n.replaceAll(/[a-z,]/g,"").replaceAll("C","V").split(/(..)/).sort().join(""),p]).sort().map(a=>a[1])
sampL = dist3.map(a=>a[1])
assert(chisqGof(expL,sampL)<31.410,undefined,"Incorrect prediction for DiamPick30");




fullProbabilities=(level=30,treasure=false,enchantability=10,itemType="tool")=>{
  let enchDat = recomb(toFinalLevel(enchantability,level).map(a=>[a[0],a[1],getBuckets(itemType,a[0],treasure)]).map(a=>numEnchs(a[0],a[2].split(" ").length).map((b,i)=>[(i+1)+";"+a[2],a[1]*b])).flat(),false);
  return recomb(enchDat.map(([str,p1])=>processLine(str).map(([ench,p2])=>[ench,p1*p2])).flat(),false)//.map(([n,p])=>[n.replaceAll(/[a-z,]/g,"").split(/(..)/).sort().join(""),p]).sort();
}


strings = "E1 E2 E3 E4 E U1 U2 U3 U Fo1 Fo2 Fo3 F S".split(" ")
time(()=>fs.writeFileSync("unb.csv","lvl,"+strings.join()+"\n"+time(()=>range(0,30.1,.1).map(l=>[l,fullProbabilities(l)])).map(([l,lp])=>[l,...strings.map(e=>sum(lp.filter(a=>a[0].includes(e)),a=>a[1]))]).map(l=>l.join(",")).join("\n")))





dispPs(fullProbabilities());

time(()=>fullProbabilities(30,true,10,"sword")).forEach(a=>console.log(a.join("  ")));











