
/**
 * Primes lib
 * @author Stanley S
 * @version 1.1
 * @date 2020-06-16
**/
bprimes = [2n,3n];
function extendPrimes()
{
  var val = bprimes[bprimes.length-1];
  var ct = 0;
  while (ct<5)
  {
    // we start with 2 and 3, and all other primes are odd.
    val+=2n;

    var sq = bSqrt(val);
    var p=true;
    for (var i=0; bprimes[i]<=sq; i++)
      if (val%bprimes[i]==0n)
      {
        p=false;
        break;
      }
    if (p)
    {
      bprimes.push(BigInt(val));
      ct++;
    }
  }
}
function bPrimeFactors(val)
{
  if (typeof val !== 'bigint')
    throw "bigint required for bfunctions"
  if (val==0n||val==-1n)
    return [val];
  if (val==1n)
    return [];

  var ret = [];
  if (val<0)
  {
    ret.push[-1n];
    val*=-1n;
  }
  var sq = bSqrt(val);
  for (var i = 0; bprimes[i]<=sq; i++)
  {
    if (bprimes.length<i+5)
      extendPrimes();
    while (val%bprimes[i]==0n)
    {
      ret.push(bprimes[i]);
      val/=bprimes[i];
      sq = bSqrt(val);
    }
  }
  if (val!=1n)
    ret.push(val);
  return ret;
}
function bFactorsIntersect(fact,other)
{
  var i=0;
  var j=0;
  var ret = [];
  while (i<fact.length && j<other.length)
  {
  if (fact[i]==other[j])
  {
    ret.push(fact[i]);
    i++; j++;
  }
  else
      if (fact[i]<other[j])
      i++
    else
      j++;
  }
  return ret;
}
function bCofactors(val1, val2)
{
  if (typeof val1 !== 'bigint' && typeof val2 !== 'bigint')
    bFactorsIntersect(val1,val2);
  if (typeof val2 !== 'bigint')
    return bCofactors(val2,val1);
  if (typeof val1 === 'bigint')
    val1 = bPrimeFactors(val1);
  var ret=[];
  for (var i=0; i<val1.length; i++)
  {
    if (val2%val1[i]==0)
    {
      val2/=val1[i];
      ret.push(val1[i]);
    }
  }
  return ret;
}
function bAllFactors(val1,val2)
{
  if (val1 instanceof Q) val1=val1.d;
  if (val2 instanceof Q) val2=val2.d;
  if (typeof val1 == 'bigint') val1=bPrimeFactors(val1);
  if (typeof val2 == 'bigint') val2=bPrimeFactors(val2);
  var ret=[];
  var i=0;var j=0;
  while (i<val1.length&&j<val2.length)
  {
    if (val1[i]==val2[j])
      {ret.push(val1[i]);i++;j++;}
    else if (val1[i]<val2[j])
      ret.push(val1[i++]);
    else
      ret.push(val2[j++]);
  }
  while (i<val1.length) ret.push(val1[i++]);
  while (j<val2.length) ret.push(val2[j++]);
  return ret;
}
function bProduct(facts)
{
  var ret = 1n;
  for (var i=0; i<facts.length; i++)
    ret*=facts[i];
  return ret;
}





/**
 * Q lib
 * @author Stanley S
 * @version b1.3
 * @date 2020-06-19
**/
class Q
{
  constructor(num,denom=null)
  {
    if (num instanceof Q)
    {
      this.n=num.n;
      this.d=num.d;
      return;
    }
    if (typeof num === 'bigint')
      this.n=num;
    else if (typeof num === 'number')
      this.n=BigInt(num);
    if (denom===null||denom==undefined)
      this.d=1n;
    else if (typeof denom === 'bigint')
      this.d=denom;
    else if (typeof denom === 'number')
      this.d=BigInt(denom);
    else
      throw 'Expected denominator';

    if (this.d<0n)
      {this.n*=-1; this.d*=-1;}

    this.clean=this.d==1n;
  }

  get numerator(){return this.n;}
  get denominator(){return this.d;}

  toString()
  {return this.n+"/"+this.d;}

  // Width is approximately how many sigfigs to show.
  // Should be within 2 of this value, but won't be exact.
  // Exponential/scientific form not implemented.
  toDecimal(quality=10,width=false)
  {
    var ns=this.n.toString();
    var ds=this.d.toString();

    // the E+pow; offbyone due to 1/2 vs 5/10
    var pow=ns.length-ds.length+(Number(ns.substring(0,1))/Number(ds.substring(0,1))>1?1:0);
    var p = 1n;
    for (var i=0; i<quality-pow; i++)
      p*=10n;
    var str = (this.mu(p).r().n).toString();
    str = "0".repeat(str.length<quality-pow+1?quality-pow+1-str.length:0)+str;
    if (str.length>pow)
      str = str.substring(0,str.length-(quality-pow))+"."+str.substring(str.length-(quality-pow));
    return str;
  }
  simplify()
  {
    if (!this.clean)
      if (this.n==0n)
        this.d=1n;
      else if (this.n==this.d)
        this.n=this.d=1n;
      else
      {
        var fact = bCofactors(this.n, this.d)
        var common = 1n;
        for (var i=0;i<fact.length;i++)
          common*=fact[i];
        if(this.n%common!=0||this.d%common!=0)
          throw "simplify error: "+this+" ("+common+")";
        this.n/=common;
        this.d/=common;
      }
    this.clean = true;
    return this;
  }
  
  reci(){return this.reciprocal();}   //RECIprocal
  neg(){return this.negate();}        //NEGate

  t(){return this.truncate();}        //Truncate
  r(){return this.round();}           //Round
  ro(){return this.roundout();}       //RoundOut
  rn(o){return this.roundtonearest(o);}       //RoundtoNearest...

  isp(){return this.isposative();}    //ISPosative
  isz(){return this.iszero()}         //ISZero
  isn(){return this.isnegative();}    //ISNegative
  lt(o){return this.lessthan(o);}     //LessThan
  le(o){return this.lessequal(o);}    //LessthanorEqualto
  gt(o){return this.greaterthan(o);}  //GreaterThan
  ge(o){return this.greaterequal(o);} //GreaterthanorEqualto
  e(o){return this.eq(o);}            //Equals
  eq(o){return this.equals(o);}       //EQuals

  mu(o){return this.multiply(o);}     //MUltiply
  di(o){return this.divide(o);}       //DIvide
  a(o){return this.add(o);}           //Add
  s(o){return this.sub(o);}           //Subtract
  sub(o){return this.subtract(o);}    //SUBtract
  
  reciprocal(){return new Q(this.d,this.n);}
  negate(){return new Q(-this.n,this.d);}

  truncate(){return new Q(this.n/this.d);}
  round(){return this.multiply(2n).truncate().add(1n).divide(2n).truncate();}
  roundout()
    {if (this.n%this.d==0) return this.truncate();
    return this.truncate().add(1n);}
  roundtonearest(other)
    {if (!(other instanceof Q)) other = new Q(other);
    return this.divide(other).round().multiply(other);}
  floor() {return this.isposative()?this.truncate():this.roundout();}
  ceiling() {return this.isnegative()?this.truncate():this.roundout();}

  isposative(){return this.n*this.d>0;}
  iszero(){return this.n==0n;}
  isnegative(){return this.n*this.d<0;}

  lessthan(other)
    {if (other instanceof Q) return this.n*other.d<other.n*this.d;
    else throw 'Expected other instanceof Q';}
  lessequal(other)
    {if (other instanceof Q) return this.n*other.d<=other.n*this.d;
    else throw 'Expected other instanceof Q';}
  greaterthan(other)
    {if (other instanceof Q) return this.n*other.d>other.n*this.d;
    else throw 'Expected other instanceof Q';}
  greaterequal(other)
    {if (other instanceof Q) return this.n*other.d>=other.n*this.d;
    else throw 'Expected other instanceof Q';}

  equals(other)
  {
    if (other instanceof Q)
      if (this.n*other.d==other.n*this.d)
        if (this.n<other.n)
          { other.n=this.n; other.d=this.d; return true; }
        else if (this.n>other.n)
          { this.n=other.n; this.d=other.d; return true; }
        else return true;
      else return false;
    else throw 'Expected other instanceof Q';
  }

  multiply(other)
  {
    if (typeof other == 'bigint')
      return this.multiply(new Q(other));
    if (other instanceof Q)
    {
      if (this.d==0n) throw 'This denominator cannot be 0.'
      if (other.d==0n) throw 'Other denominator cannot be 0.'
      if (this.n==0n||other.n==0n) return ZERO;
      if (this.n==other.d&&this.d==other.n) return ONE;
      if ((this.n%other.d==0&&other.d!=1n)||(other.n%this.d==0&&this.d!=1n)||(this.d%other.n==0&&other.n!=1n)||(other.d%this.n==0&&this.n!=1n))
      {
        if (this.n%other.d==0&&other.d!=1n)
          return new Q(this.n/other.d,this.d).multiply(new Q(other.n));
        if (this.d%other.n==0&&other.n!=1n)
          return new Q(this.n,this.d/other.n).multiply(new Q(1,other.d));
        return other.multiply(this);
      }
      return new Q(this.n*other.n,this.d*other.d);
    }
    throw 'Expected other instanceof Q'
  }
  divide(other)
  {
    if (typeof other == 'bigint')
      return new Q(this.n,this.d*other);
    if (other instanceof Q)
      return new Q(this.n*other.d,this.d*other.n);
    throw 'Expected other instanceof Q'
  }
  add(other)
  {
    if (typeof other == 'bigint')
      return new Q(this.n+other*this.d,this.d);
    if (other instanceof Q)
      return new Q(this.n*other.d+other.n*this.d,this.d*other.d);
    throw 'Expected other instanceof Q'
  }
  subtract(other)
  {
    if (typeof other == 'bigint')
      return new Q(this.n+other*this.d,this.d);
    if (other instanceof Q)
      return new Q(this.n*other.d-other.n*this.d,this.d*other.d);
    throw 'Expected other instanceof Q'
  }
}
function q(a,b=null){return new Q(a,b);}
const ZERO = new Q(0n,1n);
const ONE = new Q(1n,1n);
const TWO = new Q(2n,1n);
const TEN = new Q(10n,1n);
const CENT = new Q(100n,1n);
function min(a,b){if (a.gt(b))return b;return a;}
function max(a,b){if (a.gt(b))return a;return b;}




/**
 * Probabilities lib
 * @author Stanley S
 * @version 0.9
 * @date 2020-06-16
**/
const maxStars=60

class Pair
{
  constructor(val, bwt)
  {
    if (typeof val !== 'number')
      throw 'expected Number type for value';
    if (typeof bwt !== 'bigint')
      throw 'expected BigInt type for weight';
    this.v=val;
    this.w=bwt;
  }
  get value(){return this.v;}
  get weight(){return this.w;}
  set value(value){this.v=value;}
  set weight(weight){this.w=weight;}

  set aw(addweight){this.w+=addweight;}
  set mw(multweight){this.w*=multweight;}

  toString()
  {return "v:"+this.value+",w:"+this.weight;}
};
class ProbDist
{
  // An even distribution from [a to b] [inclusive, inclusive).
  constructor(a,b=a)
  {
    if (typeof a === 'bigint') a=Number(a);
    if (typeof b === 'bigint') b=Number(b);
    if (typeof a !== 'number' || typeof b !== 'number')
      throw 'Expected Number type for both ends.'
    if (b<a && !(a==0&&b==-1))
      throw 'b should be larger than a.'
    this.wts=[];
    this.t=0n;
    if (a!=0||b!=-1)
      for (var i = a; i<=b; i++)
      {
        this.wts.push(new Pair(i,1n));
        this.t++;
      }
  }

  get total(){return this.t;}
  get weights(){return this.wts;}

  // value *(scale±radius)+offset
  triangleFloatModifier(scale, radius, offset = ZERO)
  {
    if (scale instanceof Q || typeof scale == 'bigint' || (typeof scale == 'number' && scale.toString()==BigInt(scale).toString()))
      scale = new Q(scale);
    if (radius instanceof Q || typeof radius == 'bigint' || (typeof radius == 'number' && radius.toString()==BigInt(radius).toString()))
      radius = new Q(radius);
    if (offset instanceof Q || typeof offset == 'bigint' || (typeof offset == 'number' && offset.toString()==BigInt(offset).toString()))
      offset = new Q(offset);
    var ret = {"l":[],"x":[]};
    for (var i = 0; i<this.weights.length; i++)
    {
      var val = new Q(this.weights[i].value);
      var probs = [];

      var vs = val.mu(scale);
      var vr2 = val.mu(radius).mu(2n);
      var sdr = scale.di(radius);

      var be_a = val.mu(scale.s(radius));
      var b_a = be_a.a(offset);
      var b_af = b_a.floor();
      var be_b = val.mu(scale.a(radius));
      var b_b = be_b.a(offset);
      var b_bc = b_b.ceiling();
      var denom = 1n;
      for (var l=b_af;l.le(b_bc);l=l.a(1n))
      {
        var lm=l.s(q(1,2)).s(offset);
        var lp=l.a(q(1,2)).s(offset);
        var x_aa=min(max(be_a,lm),vs);
        var x_ab=min(max(be_a,lp),vs);
        var x_ba=min(max(vs,lm),be_b);
        var x_bb=min(max(vs,lp),be_b);
        var x_ga=x_ab.mu(x_ab).s(x_aa.mu(x_aa)).di(vr2).a(ONE.s(sdr).mu(x_ab.s(x_aa)));
        var x_gb=x_ba.mu(x_ba).s(x_bb.mu(x_bb)).di(vr2).a(ONE.a(sdr).mu(x_bb.s(x_ba)));
        var x=x_ga.a(x_gb);
        if (x.simplify().n!=0n)
          probs.push({"l":Number(l.n),"x":x});
        //console.log("v:"+val.toDecimal(3)+" | l<"+l.toDecimal(1)+"> -> "+x.toString()+";");
      }
      // console.log(probs);

      // Convert to same denominator
      var fact = bPrimeFactors(probs[0].x.d);
      for (var j=1;j<probs.length;j++)
        fact=bAllFactors(fact,probs[j].x.d);
      fact = bProduct(fact);
      for (var j=0;j<probs.length;j++)
        probs[j].x=fact/probs[j].x.d*probs[j].x.n;
      // console.log(probs);

      // Reduce to coprime.
      fact = bPrimeFactors(probs[0].x);
      for (var j=1;j<probs.length;j++)
        fact=bCofactors(fact,probs[j].x);
      fact=bProduct(fact);
      for (var j=0;j<probs.length;j++)
        probs[j].x/=fact;
      // console.log(probs);

      //multiply my freq and add to original.
      fact=0n;
      for (var j=0;j<probs.length;j++)
      {
        fact+=probs[j].x;
        probs[j].x*=this.weights[i].weight;
      }
      for (var j=0;j<probs.length;j++)
      {
        var SPLIT=false;
        var index = ret.l.indexOf(Number(probs[j].l));
        if (SPLIT||index==-1)
        {
          ret.l.push(Number(probs[j].l));
          ret.x.push(q(probs[j].x,fact));
        }
        else
          ret.x[index]=ret.x[index].a(q(probs[j].x,fact));
      }
      // console.log(ret);
    }
    // Convert to same denominator
    var fact = bPrimeFactors(ret.x[0].d);
    for (var j=1;j<ret.x.length;j++)
      fact=bAllFactors(fact,ret.x[j].d);
    fact = bProduct(fact);
    for (var j=0;j<ret.x.length;j++)
      ret.x[j]=fact/ret.x[j].d*ret.x[j].n;
    // console.log(ret);

    // Reduce to coprime.
    fact = bPrimeFactors(ret.x[0]);
    for (var j=1;j<ret.x.length;j++)
      fact=bCofactors(fact,ret.x[j]);
    fact=bProduct(fact);
    for (var j=0;j<ret.x.length;j++)
      ret.x[j]/=fact;
    // console.log(ret);

    var ret2 = new ProbDist(0,-1);
    for (var j=0;j<ret.x.length;j++)
    {
      ret2.t+=ret.x[j];
      ret2.wts.push(new Pair(Number(ret.l[j]),ret.x[j]));
    }
    return ret2;
  }



  add(val)
  {
    if (typeof val === 'number')
    {
      var ret = new ProbDist(0,-1);
      for (var i=0; i<this.weights.length; i++)
      {
        ret.weights.push(new Pair(this.weights[i].value+val,this.weights[i].weight));
        ret.t+=this.weights[i].weight;
      }
      return ret;
    }
    else
    {
      var vals = [];
      val.weights; val.total;
      var ret=[];
      var tot=0n;
      for (var i=0;i<this.weights.length;i++)
        for (var j=0;j<val.weights.length;j++)
        {
          var v=this.weights[i].value+val.weights[j].value;
          var w=this.weights[i].weight*val.weights[j].weight;
          var idx=vals.indexOf(v);
          //console.log("v:"+v+",w:"+w+";i:"+idx);
          tot+=w;
          if (idx==-1)
          {
            vals.push(v);
            ret.push(new Pair(v,w));
          }
          else
            ret[idx].weight+=w;
        }
      var ret2=new ProbDist(0,-1);
      ret2.wts=ret;
      ret2.t=tot;
      return ret2;
    }
  }



  toString(fancy=0)
  {
    // if (sorted)
    // this.wts.sort(function(a,b){return a.val-b.val;})

    var ret="{\n";
    if (fancy<=1)
      for (var i=0;i<this.weights.length;i++)
        ret+="  "+this.weights[i].value+"  ->  "+q(this.weights[i].weight*100n,this.total).toDecimal(5)+"%\n"
    else
    {
      var maxweight=0n;
      for (var i=0; i<this.weights.length; i++)
        if (maxweight<this.weights[i].weight) maxweight=this.weights[i].weight;
      maxweight = q(maxweight);
      for (var i=0;i<this.weights.length;i++)
      {
        var rep = Number(q(this.weights[i].weight).di(maxweight).mu(BigInt(fancy)).roundout().n);
        ret+="  "+this.weights[i].value+" - "
        +q(this.weights[i].weight*100n,this.total).toDecimal(10).substring(0,5)
        +"% |"+("*".repeat(rep))+"\n";
      }
    }
    return ret+"}";
  }
}





/**
 * Enchantment Code
 * @author Stanley S
 * @version 0.03
 * @date 2020-06-19
**/
function enchant(enchantability, level, enchantments, conflicts, remove = false)
{
  if (!(level instanceof ProbDist))
    level = new ProbDist(level);
  var i = enchantability;
  if (i<=0) {
    return [{"p":q(1),"e":[]}];
  } else {
    //level = level + 1 + "[0,i/4+1)" + "[0,i/4+1)";
    console.log(level);
    level=level.add(1);
    console.log(level);
    var offset = new ProbDist(0,BigInt(i)/4n);
    console.log(offset);
    level=level.add(offset);
    console.log(level);
    level=level.add(offset);
    console.log(level);

    //1.15 triangleFloatModifier
    level = level.triangleFloatModifier(1, q(3,20));
    console.log(level);
    console.log(level.toString());
    console.log(level.toString(50));

    //var final_level = level.bind(1,null);
  }
}

class Enchantment
{
  constructor(name, maxlevel, relativeweight, k, m, m2=null, k2=null, max=50)
  {
    this.name=name;
    this.maxlevel=maxlevel;
    this.relativeweight=relativeweight;
    this.k=k;
    this.m=m;
    this.m2=m2==null?max:m2;
    this.k2=m2==null?0:k2==null?k:k2;
  }
  levelLowFromPower(power)
  {
    if (this.maxlevel==1)
      return this.m;
    return (power-1)*this.k+this.m;
  }
  levelHighFromPower(power)
  {
    if (this.maxlevel==1)
      return this.m2;
    return (power-1)*this.k2+this.m2;
  }
  powerFromLevel(level)
  {
    if (!(this.m<=level&&level<=this.levelHighFromPower(this.maxlevel)))
      return 0;
    for (var power = this.maxlevel; power>0; power--)
      if (this.levelLowFromPower(power)<=level&&this.levelHighFromPower(power)>=level) return power;
    throw "In overall range, but not in any subrange.";
  }
  toString()
  {
    var ret = this.name + " ";
    if (this.maxlevel>1&&this.maxlevel<=3) ret+="I".repeat(this.maxlevel);
    else if (this.maxlevel>3) ret+=this.maxlevel==4?"IV":"V";
    ret += " ("+this.relativeweight+")";
    for (var i = 0; i < this.maxlevel; i++)
    {
      ret+= " | " + (this.k*i+this.m)+"-"+(this.k2*i+this.m2);
    }
    return ret;
  }
}
const ENCHANTMENTS = {
    UNB: new Enchantment('Unbreaking', 3, 5, 8, 5, 61, 10),
    MEND: new Enchantment('Mending', 1, 2, null, 25, 75),
    VANISH: new Enchantment('Vanishing', 1, 1, null, 25),

    PROT: new Enchantment('Protection',4, 10, 11, 1, 12),
    FP: new Enchantment('Fire Protection',4, 5, 8, 10, 18),
    FF: new Enchantment('Feather Falling',4, 5, 6, 5, 11),
    BP: new Enchantment('Blast Protection', 4, 2, 8, 5, 13),
    PP: new Enchantment('Projectile Protection', 4, 5, 6, 3, 9),
    RESP: new Enchantment('Respiration', 3, 2, 10, 10, 40),
    AA: new Enchantment('Aqua Affinity', 1, 2, null, 1, 41),
    THORN: new Enchantment('Thorns', 3, 1, 20, 10, 61, 10),
    DS: new Enchantment('Depth Strider', 3, 2, 10, 10, 25),
    FW: new Enchantment('Frost Walker', 2, 1, 10, 10, 25),
    BIND: new Enchantment('Curse of Binding', 1, 1, null, 25),

    SHARP: new Enchantment('Sharpness', 5, 10, 11, 1, 21),
    SMITE: new Enchantment('Smite', 5, 5, 8, 5, 25),
    BANE: new Enchantment('Bane of Arthropods', 5, 5, 8, 5, 25),
    KB: new Enchantment('Knockback', 2, 5, 20, 5, 61, 10),
    FA: new Enchantment('Fire Aspect', 2, 2, 20, 10, 61, 10),
    LOOT: new Enchantment('Looting', 3, 2, 9, 15, 61, 10),
    SE: new Enchantment('Sweeping Edge', 3, 2, 9, 5, 20),

    PWR: new Enchantment('Power', 5, 10, 10, 1, 16),
    PUNCH: new Enchantment('Punch', 2, 2, 20, 12, 37),
    FLA: new Enchantment('Flame', 1, 2, null, 20),
    INF: new Enchantment('Infinity', 1, 1, null, 20),

    EFF: new Enchantment('Efficiency', 5, 10, 10, 1, 61),
    SILK: new Enchantment('Silk Touch', 1, 1, null, 15, 61),
    FORT: new Enchantment('Fortune', 3, 2, 9, 15, 61, 10),

    SEA: new Enchantment('Luck of the Sea', 3, 2, 9, 15, 61, 10),
    LURE: new Enchantment('Lure', 3, 2, 9, 15, 61, 10),



    CHANNEL: new Enchantment('Channeling', 1, 1, null, 25),
    IMP: new Enchantment('Impaling', 5, 2, 8, 1, 21),
    LOY: new Enchantment('Loyalty', 3, 5, 7, 12),
    RIP: new Enchantment('Riptide', 3, 2, 7, 17),

    MS: new Enchantment('Multishot', 1, 2, null, 20),
    PIERCE: new Enchantment('Piercing', 4, 10, 10, 1),
    QC: new Enchantment('Quick Charge', 3, 5, 20, 12),

    // Upcoming
    SS: new Enchantment('Soul Speed', 3, 1, undefined, undefined), // 1.16
    CHOP: new Enchantment('Chopping', 3, undefined, undefined, undefined), // combat
};
const CONFLICTS = [
                    [ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP],
                    [ENCHANTMENTS.DS, ENCHANTMENTS.FW],
                    [ENCHANTMENTS.SHARP, ENCHANTMENTS.SMITE, ENCHANTMENTS.BANE, ENCHANTMENTS.CHOP],
                    [ENCHANTMENTS.INF, ENCHANTMENTS.MEND],
                    [ENCHANTMENTS.SILK, ENCHANTMENTS.FORT],
                    [ENCHANTMENTS.CHANNEL, ENCHANTMENTS.RIP],
                    [ENCHANTMENTS.RIP, ENCHANTMENTS.LOY],
                    [ENCHANTMENTS.MS, ENCHANTMENTS.PIERCE]
                  ];
const ENCHANTMENT_SETS = {
    helm: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.RESP, ENCHANTMENTS.AA,
      ENCHANTMENTS.BIND,ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH],
    chest: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.THORN,
      ENCHANTMENTS.BIND,ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH],
    pants: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP,
      ENCHANTMENTS.BIND,ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH],
    boots: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.FF, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.DS,
      ENCHANTMENTS.FW,ENCHANTMENTS.BIND,ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH], //SS(treasure,special)

    sword: [ENCHANTMENTS.UNB, ENCHANTMENTS.SHARP, ENCHANTMENTS.SMITE, ENCHANTMENTS.BANE, ENCHANTMENTS.KB, ENCHANTMENTS.FA, ENCHANTMENTS.LOOT, ENCHANTMENTS.SE,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH],
    bow: [ENCHANTMENTS.UNB, ENCHANTMENTS.PWR, ENCHANTMENTS.PUNCH, ENCHANTMENTS.FLA, ENCHANTMENTS.INF,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH],
    tool: [ENCHANTMENTS.UNB, ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH],
    axe: [ENCHANTMENTS.UNB, ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH], //CHOP
    rod: [ENCHANTMENTS.UNB, ENCHANTMENTS.SEA, ENCHANTMENTS.LURE,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH],

    trident: [ENCHANTMENTS.UNB, ENCHANTMENTS.CHANNEL, ENCHANTMENTS.IMP, ENCHANTMENTS.LOY, ENCHANTMENTS.RIP,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH],
    crossbow: [ENCHANTMENTS.UNB, ENCHANTMENTS.MS, ENCHANTMENTS.PIERCE, ENCHANTMENTS.QC,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH],

    book: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.FF, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.RESP, 
           ENCHANTMENTS.AA, ENCHANTMENTS.THORN, ENCHANTMENTS.DS, ENCHANTMENTS.SHARP, ENCHANTMENTS.SMITE, ENCHANTMENTS.BANE, ENCHANTMENTS.KB,
           ENCHANTMENTS.FA, ENCHANTMENTS.LOOT, ENCHANTMENTS.SE, ENCHANTMENTS.PWR, ENCHANTMENTS.PUNCH, ENCHANTMENTS.FLA, ENCHANTMENTS.INF, 
           ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT, ENCHANTMENTS.SEA, ENCHANTMENTS.LURE, ENCHANTMENTS.CHANNEL, ENCHANTMENTS.IMP, 
           ENCHANTMENTS.LOY, ENCHANTMENTS.RIP, ENCHANTMENTS.MS, ENCHANTMENTS.PIERCE, ENCHANTMENTS.QC,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH,ENCHANTMENTS.FW,ENCHANTMENTS.BIND],

    all: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.FF, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.RESP, 
           ENCHANTMENTS.AA, ENCHANTMENTS.THORN, ENCHANTMENTS.DS, ENCHANTMENTS.SHARP, ENCHANTMENTS.SMITE, ENCHANTMENTS.BANE, ENCHANTMENTS.KB,
           ENCHANTMENTS.FA, ENCHANTMENTS.LOOT, ENCHANTMENTS.SE, ENCHANTMENTS.PWR, ENCHANTMENTS.PUNCH, ENCHANTMENTS.FLA, ENCHANTMENTS.INF, 
           ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT, ENCHANTMENTS.SEA, ENCHANTMENTS.LURE, ENCHANTMENTS.CHANNEL, ENCHANTMENTS.IMP, 
           ENCHANTMENTS.LOY, ENCHANTMENTS.RIP, ENCHANTMENTS.MS, ENCHANTMENTS.PIERCE, ENCHANTMENTS.QC,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VANISH,ENCHANTMENTS.FW,ENCHANTMENTS.BIND,ENCHANTMENTS.SS,ENCHANTMENTS.CHOP],
}




/**
 * Main
 * (because this language is actually C)
**/
function main()
{
  obj = {"wts":[{"val":5,"wt":3},{"val":6,"wt":4}],"total":7}
  // simplifyProb(obj)
  // console.log(primeFactors(1061340));
  // console.log(primeFactors(77805));
  // console.log(factorsIntersect(primeFactors(1061340),primeFactors(77805*7)));
  // console.log(bPrimeFactors(1061340n));
  // console.log(bPrimeFactors(77805n));
  // console.log(bFactorsIntersect(bPrimeFactors(1061340n),bPrimeFactors(77805n*7n)));
  
  //console.log(bSqrt(7541066681n));
  // console.log(bPrimeFactors(60727873587294018512000000n));
  // console.log(bPrimeFactors(157800210763504777600000000n));
  // console.log(bCofactors(60727873587294018512000000n,157800210763504777600000000n))


  // var p = new Pair(5,5n);
  // console.log(typeof p);
  // console.log(p);
  // console.log(p.toString());
  // var pd = new ProbDist(1, 4);
  // console.log(pd);
  // var pd2 = pd.add(5);
  // console.log(pd);
  // console.log(pd2);
  // pd2 = pd.add(pd);
  // console.log(pd);
  // console.log(pd2);

  // console.log(5n instanceof BigInt)
  // var val = new Q(1,1);
  // console.log(val);
  // console.log(val.mu(15n));
  // val2 = val.mu(5n);
  // console.log(val2);
  // val = val.mu(17n);
  // console.log(val);
  // val3 = val.di(val2);
  // console.log(val3);
  // console.log(val.toDecimal());
  // console.log(val2.toDecimal());
  // console.log(val3.toDecimal());
  // pi = new Q(262452630335382199398n,83541266890691994833n);
  // console.log(pi.toString(150));
  // console.log(pi.toDecimal(150));
  // pir = new Q(262452630335382199398n,83541266890n);
  // console.log(pir.toDecimal(17));
  // console.log(pir.toDecimal(9));
  // console.log(pir.toDecimal(10));
  // console.log(pir.toDecimal(11));
  // console.log(pir.toDecimal(12));
  // r13o83s = new Q(350629275419n,669935023473116n);
  // console.log(r13o83s.toDecimal(5));
  // r13o83s = new Q(350629275419n,669935023473116n*669935023473116n);
  // console.log(r13o83s.toDecimal(5));
  // var q1= q(40,162);
  // var q2= q(162,1152);
  // console.log(q1+" + "+q2+" = "+(q1.a(q2)));
  // var q3 = q(1261337193700n,25226743874n);
  // console.log(q3);
  // console.log(q3.t());
  // console.log(q3.r());
  // console.log(q3.ro());
  // console.log(q(1,2).toDecimal(5));
  // console.log(q(5,10).toDecimal(5));
  // console.log(q(9,18).toDecimal(5));
  // console.log(q(9,19).toDecimal(5));
  // console.log(q(0,5).toDecimal(5));
  // console.log(q(47,51).toDecimal(5));
  // console.log(q(92,181).toDecimal(5));
  // console.log(q(67*7,532).toDecimal(5));
  // console.log(q(681,937).toDecimal(5));
  // console.log(q(59,226).toDecimal(5));
  // console.log(q(68,582).toDecimal(5));
  // console.log(q(183,192).toDecimal(5));
  // console.log(q(4,13).toDecimal(5));
  // console.log(q(302,497).toDecimal(5));
  // console.log(q(497).rn(5).toDecimal(5));
  // console.log(q(498).rn(5).toDecimal(5));
  // console.log(q(492,582).rn(q(1,7)).toDecimal(5));
  // console.log(q(424,582).rn(q(1,7)).toDecimal(5));



  // var dist = new ProbDist(0,1).add(new ProbDist(0,1)).add(15);
  // // var dist = new ProbDist(15);
  // // var dist = new ProbDist(16);
  // // var dist = new ProbDist(17);
  // console.log(dist);
  // console.log(dist.toString());
  // dist = dist.triangleFloatModifier(1,q(3,20));
  // // dist = dist.triangleFloatModifier(q(47,10),q(187,296),q(73,53));
  // console.log(dist);
  // console.log(dist.toString());


  for (var i=0; i<ENCHANTMENT_SETS.all.length; i++)
  {
    var out = ENCHANTMENT_SETS.all[i].name;
    out+=" ".repeat(21-out.length);
    for (var j=1; j<=ENCHANTMENT_SETS.all[i].maxlevel; j++)
      out+="\t"+ENCHANTMENT_SETS.all[i].levelLowFromPower(j);
    console.log(out);
  }
  var out1 = " ".repeat(21), out2 = " ".repeat(21);
  for (var i=1; i<80-21; i++)
    {out1+=Math.floor(i/10);out2+=i%10;}
  console.log(out1);console.log(out2);
  for (var i=0; i<ENCHANTMENT_SETS.all.length; i++)
  {
    var out = ENCHANTMENT_SETS.all[i].name;
    out+=" ".repeat(21-out.length);
  for (var j=1; j<80-21; j++)
      out+=ENCHANTMENT_SETS.all[i].powerFromLevel(j);
    console.log(out);
  }

  for (var i=0; i<ENCHANTMENT_SETS.all.length; i++)
    console.log(ENCHANTMENT_SETS.all[i].toString());

  //enchant(10, new ProbDist(5,17), null, [], 0);
  enchant(10, new ProbDist(30), ENCHANTMENT_SETS.tool, CONFLICTS);
  // Max level:
  // (25) 49 gold armor (thorns 3 not possible (50))
  // (22) 47 Gold tool
  // (1)  36 bow/rod/etc (power 5 not possible (41))
  // 
}
main();





/**
 * Mojang Enchantment Code for Java
**/
//    /**
//     * Create a list of random EnchantmentData (enchantments) that can be added together to the ItemStack, the 3rd
//     * parameter is the total enchantability level.
//     */
//    public static List<EnchantmentData> buildEnchantmentList(Random randomIn, ItemStack itemStackIn, int level, boolean allowTreasure) {
//       List<EnchantmentData> list = Lists.newArrayList();
//       Item item = itemStackIn.getItem();
//       int i = itemStackIn.getItemEnchantability();
//       if (i <= 0) {
//          return list;
//       } else {
//          level = level + 1 + randomIn.nextInt(i / 4 + 1) + randomIn.nextInt(i / 4 + 1);
//          float f = (randomIn.nextFloat() + randomIn.nextFloat() - 1.0F) * 0.15F;
//          level = MathHelper.clamp(Math.round((float)level + (float)level * f), 1, Integer.MAX_VALUE);
//          List<EnchantmentData> list1 = getEnchantmentDatas(level, itemStackIn, allowTreasure);
//          if (!list1.isEmpty()) {
//             list.add(WeightedRandom.getRandomItem(randomIn, list1));
//
//             while(randomIn.nextInt(50) <= level) {
//                removeIncompatible(list1, Util.func_223378_a(list));
//                if (list1.isEmpty()) {
//                   break;
//                }
//
//                list.add(WeightedRandom.getRandomItem(randomIn, list1));
//                level /= 2;
//             }
//          }
//
//          return list;
//       }
//    }























/**
 * Sqrt for BigInts, courtesy of Anton
 * @author Anton
 * @link https://stackoverflow.com/a/53684036
**/
function bSqrt(value) {
    if (value < 0n) {
        throw 'square root of negative numbers is not supported'
    }
    if (value < 2n) {
        return value;
    }
    function newtonIteration(n, x0) {
        const x1 = ((n / x0) + x0) >> 1n;
        if (x0 === x1 || x0 === (x1 - 1n)) {
            return x0;
        }
        return newtonIteration(n, x1);
    }
    return newtonIteration(value, 1n);
}



