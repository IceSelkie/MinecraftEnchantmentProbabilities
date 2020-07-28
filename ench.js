
/**
 * Primes lib
 * @author Stanley S
 * @version 1.3
 * @date 2020-07-27
**/
bprimes = [2n,3n];

/**
 * Extends the list of primes by a few.
**/
function extendPrimes()
{
  // The list starts with 2 and 3, and all other primes are odd.
  // The first candidate will be two more than the largest prime found.
  var candidate = bprimes[bprimes.length-1]+2n;
  var new_primes_found = 0;

  while (new_primes_found<5)
  {
    // If the candidate has any factors, they will be less than its square root.
    var cap = bSqrt(candidate);

    // Assume prime until a factor is found
    var candidate_has_factor=false;

    // For each prime up to the cap, check if it is a factor of the candidate.
    for (var i=0; bprimes[i]<=cap; i++)
      if (candidate%bprimes[i]==0n)
      {
        // Factor found: this candidate is not prime, and we can end the loop.
        candidate_has_factor=true;
        break;
      }

    // If no factors, then it is prime and can be added to the list of primes.
    if (!candidate_has_factor)
    {
      bprimes.push(BigInt(candidate));
      new_primes_found++;
    }

    // Move to the next candidate
    candidate+=2n;
  }

  // The list of primes has been extended by a few. We are done (for now).
  return;
}
/**
 * Factorizes a BigInt and returns an array with its factors as the elements.
 * bProduct of the returned array gives the original value.
**/
function bPrimeFactors(value)
{
  if (typeof value !== 'bigint')
    throw "bigint required for bfunctions"

  var ret = [];

  // Base Case: -1, 0: Its factor is just itself.
  if (value===0n||value===-1n)
    return [value];

  // 1 is ommitted from the factors list, thus factors is empty.
  if (value===1n)
    return [];

  // -1 can be a factor
  if (value<0)
  {
    ret.push(-1n);
    value*=-1n;
  }

  // Unless the value is prime, a factor will be found below its square root.
  var cap = bSqrt(value);

  // Check each prime number up to the cap:
  // If it is a factor, add it to the list and divide value by it.
  // We then have a smaller value to work with and know all primes
  // be low the one we just tested are not factors.
  for (var i=0; bprimes[i]<=cap; i++)
  {
    // Get more prime numbers if we need them
    if (bprimes.length<i+2) // +1 is current, +2 covers next, which is checked in the loop against cap.
      extendPrimes();

    // Check if this multiple of its factors.
    while (value%bprimes[i]===0n)
    {
      ret.push(bprimes[i]);
      value/=bprimes[i];
    }

    // Recalculate the cap, since our value has been (hopefully greatly) reduced.
    cap = bSqrt(value);
  }

  // If there are no factors below its sqrt, then the final value must itself be prime.
  if (value!==1n)
    ret.push(value);

  // Return the array of factors.
  return ret;
}
/**
 * two lists of factors, and find what factors they share. (Effectively gcd)
**/
function bFactorsIntersect(fact,other)
{
  var i=0;
  var j=0;
  var ret = [];
  // While they both still have factors
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
/**
 * two bigints, and find what factors they share. (Effectively gcd)
**/
function bCofactors(val1, val2)
{
  // if we are just dealing with lists, bFactorsIntersect already solves this problem.
  if (typeof val1 !== 'bigint' && typeof val2 !== 'bigint')
    bFactorsIntersect(val1,val2);
  // make sure the list is first
  if (typeof val2 !== 'bigint')
    return bCofactors(val2,val1);
  // if there is no list, make the first one into a list.
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
/**
 * two bigints/factor lists, and find the factors that at least one of them has. (Effectively lcm)
**/
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
/**
 * Multiplies a list of numbers together. Thats it. Really.
**/
function bProduct(facts)
{
  var ret = 1n;

  // Multiply the return value by each value in the list
  for (var i=0; i<facts.length; i++)
    ret*=facts[i];

  return ret;
}
function bReduce(vals)
{
  if (vals.length==0) return vals;
  if (vals.length==1) {vals[0]=1n; return vals;}
  var gcd = bPrimeFactors(vals[0]);
  for (var i=1;i<vals.length;i++)
    gcd=bCofactors(gcd,vals[i])
  gcd=bProduct(gcd);
  for (var i=0;i<vals.length;i++)
  {
    if (vals[i]%gcd!=0n) throw 'simplify error: '+vals[i]+' ('+gcd+')';
    vals[i]/=gcd;
  }
  return vals;
}
function qReduce(vals)
{
  if (vals.length==0) return [];
  if (vals.length==1) if (vals[0].n==0n) return [0n]; else return [1n];

  var lcm = bPrimeFactors(vals[0].d);
  for (var i=1;i<vals.length;i++)
    lcm=bAllFactors(lcm,vals[i].d);
  lcm=bProduct(lcm);
  ret=[];
  for (var i=0;i<vals.length;i++)
  {
    if (lcm%vals[i].d!=0n) throw 'simplify error: '+lcm+' ('+vals[i].d+')';
    ret[i]=vals[i].n*(lcm/vals[i].d);
  }
  return bReduce(ret);
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
        var common = bProduct(bCofactors(this.n, this.d));
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
 * @version 0.13
 * @date 2020-07-27
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

    // To myself later: 'l' is the ench-level/'value', and 'x' is the integral value for that region, thus its 'weight'
    var ret = {"l":[],"x":[]};
    for (var i = 0; i<this.weights.length; i++)
    {
      var val = new Q(this.weights[i].value);
      var probs = {"l":[],"x":[]};

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
        {
          probs.l.push(Number(l.n))
          probs.x.push(x);
        }
        //console.log("v:"+val.toDecimal(3)+" | l<"+l.toDecimal(1)+"> -> "+x.toString()+";");
      }
      // console.log('probs');
      // console.log(probs);
      probs.x=qReduce(probs.x);
      console.log('probs');
      console.log(probs);

      // multiply by its weight and add to ret.
      var prob_tot=0n;
      for (var j=0;j<probs.x.length;j++)
      {
        prob_tot+=probs.x[j];
        probs.x[j]*=this.weights[i].weight;
      }
      for (var j=0;j<probs.x.length;j++)
      {
        var index = ret.l.indexOf(Number(probs.l[j]));
        // console.log('index:'+index)
        if (index==-1)
        {
          ret.l.push(Number(probs.l[j]));
          ret.x.push(q(probs.x[j],prob_tot));
        }
        else
          ret.x[index]=ret.x[index].a(q(probs.x[j],prob_tot));
      }
      // console.log('ret');
      // console.log(ret);
    }
    ret.x=qReduce(ret.x);
    console.log('ret');
    console.log(ret);

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



  bind(low, high)
  {
    // for each val,
    //   if less than low, set to low;
    //   else if higher than high, set to high.
    var rett = 0n;
    var retwts = [];
    if (low==null && high==null) return this;
    for (var i = 0; i<this.wts.length; i++)
    {
      var val = low!=null?high!=null?Math.min(Math.max(low,this.wts[i].v),high):Math.max(low,this.wts[i].v):Math.min(this.wts[i].v,high);
      var changed = false;
      for (var j = 0; j<retwts.length; j++)
        if (retwts[j].v==val)
        {
          retwts[j].w+=this.wts[i].w;
          changed=true;
          break;
        }
      if (!changed)
        retwts.push(new Pair(val,this.wts[i].w));
      rett+=this.wts[i].w;
    }

    var ret = new ProbDist(0,-1);
    ret.t=rett;
    ret.wts=retwts;
    if (ret.t!=this.t)
      throw "Total and sum don't match! (was "+this.t+", and is now "+ret.t+")";
    return ret;
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
 * @version 0.16
 * @date 2020-07-27
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
    var final_level = level.bind(1,null);

    console.log(final_level);              // Raw Ratios
    console.log(final_level.toString());   // Percents Table
    console.log(final_level.toString(50)); // Star Graph


    var ret = {items:[], wts:[]};
    /*var addEnchantmentsFromList=function;*/
    for (var i = 0; i < final_level.wts.length; i++)
    {
      //BAD
      enchPossFromLvl = getEnchs(enchantments, final_level.wts[i].value);
      var set = addEnchantmentsFromList(new ItemEnchantment(), enchPossFromLvl, final_level.wts[i].value);
      var set_t = 0n;
      for (var j=0;j<set.wt.length;j++)
        set_t+=set.wt[j];
      var found;
      for (var j=0;j<set.val.length;j++)
      {
        found = false;
        for (var k=0;k<ret.items.length;k++)
        if (set.val[j].equals(ret.items[k]))
        {
          ret.wts[k].a(q(final_level.wts[i].weight*set.wt[j],set_t));
          found = true;
        }
        if (!found)
        {
          ret.items.push(set.val[j]);
          ret.wts.push(q(final_level.wts[i].weight*set.wt[j],set_t));
        }
      }
    }
    for (var i=0;i<ret.items.length;i++)
      ret.items[i]=ret.items[i].toString(); // pretty print is this line
    // console.log(ret);
    ret.wts=qReduce(ret.wts);
    console.log(ret);
    var ret_t=0n, ret_h=0n;
    for (var i=0;i<ret.wts.length;i++)
    {
      ret_t+=ret.wts[i];
      if (ret.wts[i]>ret_h)ret_h=ret.wts[i];
    }
    for (var i=0;i<ret.items.length;i++)
      console.log("  "+ret.items[i]+"  ->  "+q(ret.wts[i]*100n,ret_t).toDecimal(5)+"%");
    // for (var i=0;i<ret.items.length;i++)
    // console.log("  "+ret.items[i]+" - "
    //   +q(ret.wts[i]*100n,ret_t).toDecimal(25).substring(0,20)+"% |"+("*".repeat(Number(q(ret.wts[i]).di(ret_h).mu(BigInt(200)).roundout().n))));

  }
}
function addEnchantmentsFromList(item, enchs, level)
{
  // console.log('Called on: '+item.toString());
  /*let item := [type enchantment]*/
  var ret={val:[],wt:[]};
  var newitem, owt, next, i, j, prev, k;
  var multi=1n;
  for (i=0; i<enchs.length; i++)
  {
    // console.log(item.applyable(enchs[i].ench)+' - '+item.toString()+':'+enchs[i].ench.shorthand)
    if (item.applyable(enchs[i].ench))
    {
      newitem = item.add(enchs[i]);
      // console.log('Considering new item: '+newitem.toString());
      prev=false;
      for (j=0;j<ret.val.length&&!prev;j++) 
        if (newitem.equals(ret.val[j]))
          { ret.wt[k]+=multi*BigInt(enchs[i].ench.relativeweight*(Math.max(0,50-(level+1)))); prev=true; }
      if (!prev)
      {
        ret.val.push(newitem);
        ret.wt.push(multi*BigInt(enchs[i].ench.relativeweight*(Math.max(0,50-(level+1)))));
      }

      // console.log(newitem.toString()+' has weight of '+ret.wt[ret.wt.length-1]+' for level:'+level);

      // call it recursively
      owt = multi*BigInt(enchs[i].ench.relativeweight*(Math.min(50,level+1)));
      // console.log('More enchs'+' should have weight of '+owt);
      next=addEnchantmentsFromList(newitem, enchs, Math.trunc(level/2));
      // console.log('Returning to: '+item.toString());
      for (j=0;j<ret.val.length;j++)
        ret.wt[j]*=next.total;
      multi*=next.total;
      for (j=0;j<next.val.length;j++)
      {
        prev=false;
        for (k=0;k<ret.val.length&&!prev;k++)
          if (ret.val[k].equals(next.val[j]))
          {
            // console.log('Found match ('+ret.val[k].toString()+') for '+next.val[j].toString());
            ret.wt[k]+=owt*next.wt[j];
            prev=true;
          }
        if (!prev)
        {
          // console.log('No match for '+next.val[j].toString()+'; adding as new entry to ret.');
          ret.val.push(next.val[j]);
          ret.wt.push(owt*next.wt[j]);
        }
      }
      // console.log('Done adding from call. Now:');
      // ret.str=[]; ret.original=item.toString(); ret.lvl=level;ret.total=0n;
      // for (var k=0;k<ret.wt.length;k++){ret.total+=ret.wt[k];ret.str[k]=ret.val[k].toString();}
      // console.log(ret);
      // delete ret.str;delete ret.original;delete ret.lvl;
    }
  }
  if (ret.val.length==0)
  {
    ret.val.push(item);
    ret.wt.push(1n);
  }
  else
  {
    // Simplify this mess.
  }

  // console.log('Finishing method. Returning:');
  // ret.str=[]; ret.original=item.toString(); ret.lvl=level;ret.total=0n;
  // for (var i=0;i<ret.wt.length;i++){ret.total+=ret.wt[i];ret.str[i]=ret.val[i].toString();}
  // console.log(ret);
  // delete ret.str;delete ret.original;delete ret.lvl;
  ret.total=0n;
  for (i=0;i<ret.wt.length;i++) ret.total+=ret.wt[i];
  return ret;
}
function getEnchs(enchantments, lvl)
{
  var ret = [];
  for (var i=0;i<enchantments.length;i++)
    if (enchantments[i].powerFromLevel(lvl)>=1)
      ret.push(new SingleEnchantment(enchantments[i],enchantments[i].powerFromLevel(lvl)));
  return ret;
}

class SingleEnchantment
{
  constructor(ench, lvl)
  {
    this.ench=ench;
    this.lvl=/*ench.powerFromLevel*/(lvl);
  }
  equals(other)
  {
    return this.ench==other.ench&&this.lvl==other.lvl;
  }
}
class ItemEnchantment
{
  constructor()
  {
    /*this.enchs[i] typeof SingleEnchatment*/
    this.enchs=[];
  }

  applyable(enchantment, conflicts=CONFLICTS)
  {
    /*enchantment typeof Enchantment*/
    for (var i=0; i<this.enchs.length; i++)
      if (this.enchs[i].ench == enchantment)
        return false;
    // For each set of conflicts
      // check each listed conflict for this proposed enchantment. ...
        // ... If it is there, then we need to make sure it wont conflict.
    for (var i=0; i<conflicts.length; i++)
      for (var j=0; j<conflicts[i].length; j++)
        if (conflicts[i][j] == enchantment)
          // now check to see if any of the conflicts in this set
            // are in this items enchants
              // if there is
                // its a conflict.
          for (var k=0; k<conflicts[i].length; k++)
            if (k!=j)
              for (var l=0; l<this.enchs.length; l++)
                if (conflicts[i][k] == this.enchs[l].ench)
                  return false;
      return true;
  }

  equals(other)
  {
    if (!(other instanceof ItemEnchantment))
      throw "Expected ItemEnchantment as other."
    // console.log('Comparing two Items: '+this.toString()+' and '+other.toString());
    if (this.enchs.length!=other.enchs.length)
    {
      // console.log('Diff length, returning false;')
      return false;
    }
    for (var i=0;i<this.enchs.length;i++)
    {
      // console.log('Searching for enchantment '+i+":"+this.enchs[i].ench.shorthand+' in other...');
      var found=false;
      for (var j=0;j<this.enchs.length&&!found;j++)
        if (this.enchs[i].equals(other.enchs[j]))
        {
          // console.log(' Found at '+j+':'+other.enchs[j].ench.shorthand+'.');
          found = true;
        }
        // else
          // console.log(' No match yet... ('+j+':'+other.enchs[j].ench.shorthand+')')
      if (!found)
      {
        // console.log('Unable to find '+i+":"+this.enchs[i].ench.shorthand+', returning false;')
        return false;
      }
    }
    // console.log('Appears to match.')
    return true;
  }
  eq(o)
  {
    var ret = this.toString().equals(o.toString());
    var ret2 = this.equals(o);
    if (ret!=ret2)
      throw 'Equals failed ('+ret+','+ret2+'); ['+this.toString()+'] ['+o.toString()+']'
    return ret;
  }
  add(singleench)
  {
    if (!(singleench instanceof SingleEnchantment))
      throw "Expected SingleEnchantment";
    var o = new ItemEnchantment();
    for (var i=0;i<this.enchs.length;i++)
    {
      o.enchs.push(this.enchs[i]);
    }
    o.enchs.push(singleench);
    return o;
  }
  toString(expanded=false)
  {
    var ret = '';
    var str = null;
    var index = -1;
    var roman=function(n){if(n<1)return n.toString();if(n<4)return 'I'.repeat(n);if(n<9) return 'I'.repeat(Math.max(0,5-n))+'V'+'I'.repeat(Math.max(0,n-5)); return n;}
    for (var i=0;i<this.enchs.length;i++)
    {
      /** / index=i; / **/
      for (var j=0;j<this.enchs.length;j++)
        if((str==null||this.enchs[j].ench.name>str)&&
              (index==-1||this.enchs[j].ench.name<this.enchs[index].ench.name))
          index=j;
      if (index==-1) throw "Cannot find next enchantment. (len="+this.enchs.length+",index="+index+")";
      str=this.enchs[index];
      ret+=expanded?str.ench.name+' '+roman(str.lvl)+(i!=this.enchs.length-1?', ':''):str.ench.shorthand+str.lvl;
      str=str.ench.name;
      index=-1;
    }
    //console.log(this)
    return ret;
  }
}
class Enchantment
{
  constructor(shorthand, name, maxlevel, relativeweight, k, m, m2=null, k2=null, max=50)
  {
    this.shorthand=shorthand;
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
    UNB: new Enchantment('UNB', 'Unbreaking', 3, 5, 8, 5, 61, 10),
    MEND: new Enchantment('MEND', 'Mending', 1, 2, null, 25, 75),
    VAN: new Enchantment('VAN', 'Vanishing', 1, 1, null, 25),

    PROT: new Enchantment('PROT', 'Protection',4, 10, 11, 1, 12),
    FP: new Enchantment('FP', 'Fire Protection',4, 5, 8, 10, 18),
    FF: new Enchantment('FF', 'Feather Falling',4, 5, 6, 5, 11),
    BP: new Enchantment('BP', 'Blast Protection', 4, 2, 8, 5, 13),
    PP: new Enchantment('PP', 'Projectile Protection', 4, 5, 6, 3, 9),
    RESP: new Enchantment('RESP', 'Respiration', 3, 2, 10, 10, 40),
    AA: new Enchantment('AA', 'Aqua Affinity', 1, 2, null, 1, 41),
    THRN: new Enchantment('THRN', 'Thorns', 3, 1, 20, 10, 61, 10),
    DS: new Enchantment('DS', 'Depth Strider', 3, 2, 10, 10, 25),
    FW: new Enchantment('FW', 'Frost Walker', 2, 1, 10, 10, 25),
    BIND: new Enchantment('BIND', 'Curse of Binding', 1, 1, null, 25),

    SRP: new Enchantment('SRP', 'Sharpness', 5, 10, 11, 1, 21),
    SMITE: new Enchantment('SMITE', 'Smite', 5, 5, 8, 5, 25),
    BANE: new Enchantment('BANE', 'Bane of Arthropods', 5, 5, 8, 5, 25),
    KB: new Enchantment('KB', 'Knockback', 2, 5, 20, 5, 61, 10),
    FA: new Enchantment('FA', 'Fire Aspect', 2, 2, 20, 10, 61, 10),
    LT: new Enchantment('LT', 'Looting', 3, 2, 9, 15, 61, 10),
    SE: new Enchantment('SE', 'Sweeping Edge', 3, 2, 9, 5, 20),

    PWR: new Enchantment('PWR', 'Power', 5, 10, 10, 1, 16),
    PUNCH: new Enchantment('PUNCH', 'Punch', 2, 2, 20, 12, 37),
    FLA: new Enchantment('FLA', 'Flame', 1, 2, null, 20),
    INF: new Enchantment('INF', 'Infinity', 1, 1, null, 20),

    EFF: new Enchantment('EFF', 'Efficiency', 5, 10, 10, 1, 61),
    SILK: new Enchantment('SILK', 'Silk Touch', 1, 1, null, 15, 61),
    FORT: new Enchantment('FORT', 'Fortune', 3, 2, 9, 15, 61, 10),

    SEA: new Enchantment('SEA', 'Luck of the Sea', 3, 2, 9, 15, 61, 10),
    LURE: new Enchantment('LURE', 'Lure', 3, 2, 9, 15, 61, 10),



    CHANNEL: new Enchantment('CHANNEL', 'Channeling', 1, 1, null, 25),
    IMP: new Enchantment('IMP', 'Impaling', 5, 2, 8, 1, 21),
    LOY: new Enchantment('LOY', 'Loyalty', 3, 5, 7, 12),
    RIP: new Enchantment('RIP', 'Riptide', 3, 2, 7, 17),

    MS: new Enchantment('MS', 'Multishot', 1, 2, null, 20),
    PIERCE: new Enchantment('PIERCE', 'Piercing', 4, 10, 10, 1),
    QC: new Enchantment('QC', 'Quick Charge', 3, 5, 20, 12),

    // Upcoming
    SS: new Enchantment('SS', 'Soul Speed', 3, 1, undefined, undefined), // 1.16; non enchantable
    CP: new Enchantment('CP', 'Chopping', 3, undefined, undefined, undefined), // combat
};
const CONFLICTS = [
                    [ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP],
                    [ENCHANTMENTS.DS, ENCHANTMENTS.FW],
                    [ENCHANTMENTS.SRP, ENCHANTMENTS.SMITE, ENCHANTMENTS.BANE, ENCHANTMENTS.CP],
                    [ENCHANTMENTS.INF, ENCHANTMENTS.MEND],
                    [ENCHANTMENTS.SILK, ENCHANTMENTS.FORT],
                    [ENCHANTMENTS.CHANNEL, ENCHANTMENTS.RIP],
                    [ENCHANTMENTS.RIP, ENCHANTMENTS.LOY],
                    [ENCHANTMENTS.MS, ENCHANTMENTS.PIERCE]
                  ];
const ENCHANTMENT_SETS = {
    helm: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.RESP, ENCHANTMENTS.AA],
    helmall: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.RESP, ENCHANTMENTS.AA,
      ENCHANTMENTS.BIND,ENCHANTMENTS.MEND,ENCHANTMENTS.VAN],
    chest: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.THRN],
    chestall: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.THRN,
      ENCHANTMENTS.BIND,ENCHANTMENTS.MEND,ENCHANTMENTS.VAN],
    pants: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP],
    pantsall: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.BP, ENCHANTMENTS.PP,
      ENCHANTMENTS.BIND,ENCHANTMENTS.MEND,ENCHANTMENTS.VAN],
    boots: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.FF, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.DS],
    bootsall: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.FF, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.DS,
      ENCHANTMENTS.FW,ENCHANTMENTS.BIND,ENCHANTMENTS.MEND,ENCHANTMENTS.VAN], //SS(treasure,special)

    sword: [ENCHANTMENTS.UNB, ENCHANTMENTS.SRP, ENCHANTMENTS.SMITE, ENCHANTMENTS.BANE, ENCHANTMENTS.KB, ENCHANTMENTS.FA, ENCHANTMENTS.LT, ENCHANTMENTS.SE],
    swordall: [ENCHANTMENTS.UNB, ENCHANTMENTS.SRP, ENCHANTMENTS.SMITE, ENCHANTMENTS.BANE, ENCHANTMENTS.KB, ENCHANTMENTS.FA, ENCHANTMENTS.LT, ENCHANTMENTS.SE,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VAN],
    bow: [ENCHANTMENTS.UNB, ENCHANTMENTS.PWR, ENCHANTMENTS.PUNCH, ENCHANTMENTS.FLA, ENCHANTMENTS.INF],
    bowall: [ENCHANTMENTS.UNB, ENCHANTMENTS.PWR, ENCHANTMENTS.PUNCH, ENCHANTMENTS.FLA, ENCHANTMENTS.INF,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VAN],
    tool: [ENCHANTMENTS.UNB, ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT],
    toolall: [ENCHANTMENTS.UNB, ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VAN],
    axe: [ENCHANTMENTS.UNB, ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT], //CP chopping (upcoming)
    axeall: [ENCHANTMENTS.UNB, ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VAN], //CP chopping (upcoming)
    rod: [ENCHANTMENTS.UNB, ENCHANTMENTS.SEA, ENCHANTMENTS.LURE],
    rodall: [ENCHANTMENTS.UNB, ENCHANTMENTS.SEA, ENCHANTMENTS.LURE,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VAN],

    trident: [ENCHANTMENTS.UNB, ENCHANTMENTS.CHANNEL, ENCHANTMENTS.IMP, ENCHANTMENTS.LOY, ENCHANTMENTS.RIP],
    tridentall: [ENCHANTMENTS.UNB, ENCHANTMENTS.CHANNEL, ENCHANTMENTS.IMP, ENCHANTMENTS.LOY, ENCHANTMENTS.RIP,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VAN],
    crossbow: [ENCHANTMENTS.UNB, ENCHANTMENTS.MS, ENCHANTMENTS.PIERCE, ENCHANTMENTS.QC],
    crossbowall: [ENCHANTMENTS.UNB, ENCHANTMENTS.MS, ENCHANTMENTS.PIERCE, ENCHANTMENTS.QC,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VAN],

    // Note: Soul Speed not possible on book even with treasure enchatments enabled.
    //       Must be bastion loot/piglin bartering to get a Soul Speed book.
    book: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.FF, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.RESP, 
           ENCHANTMENTS.AA, ENCHANTMENTS.THRN, ENCHANTMENTS.DS, ENCHANTMENTS.SRP, ENCHANTMENTS.SMITE, ENCHANTMENTS.BANE, ENCHANTMENTS.KB,
           ENCHANTMENTS.FA, ENCHANTMENTS.LT, ENCHANTMENTS.SE, ENCHANTMENTS.PWR, ENCHANTMENTS.PUNCH, ENCHANTMENTS.FLA, ENCHANTMENTS.INF, 
           ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT, ENCHANTMENTS.SEA, ENCHANTMENTS.LURE, ENCHANTMENTS.CHANNEL, ENCHANTMENTS.IMP, 
           ENCHANTMENTS.LOY, ENCHANTMENTS.RIP, ENCHANTMENTS.MS, ENCHANTMENTS.PIERCE, ENCHANTMENTS.QC],
    bookall: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.FF, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.RESP, 
           ENCHANTMENTS.AA, ENCHANTMENTS.THRN, ENCHANTMENTS.DS, ENCHANTMENTS.SRP, ENCHANTMENTS.SMITE, ENCHANTMENTS.BANE, ENCHANTMENTS.KB,
           ENCHANTMENTS.FA, ENCHANTMENTS.LT, ENCHANTMENTS.SE, ENCHANTMENTS.PWR, ENCHANTMENTS.PUNCH, ENCHANTMENTS.FLA, ENCHANTMENTS.INF, 
           ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT, ENCHANTMENTS.SEA, ENCHANTMENTS.LURE, ENCHANTMENTS.CHANNEL, ENCHANTMENTS.IMP, 
           ENCHANTMENTS.LOY, ENCHANTMENTS.RIP, ENCHANTMENTS.MS, ENCHANTMENTS.PIERCE, ENCHANTMENTS.QC,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VAN,ENCHANTMENTS.FW,ENCHANTMENTS.BIND], //CP chopping (upcoming)

    all: [ENCHANTMENTS.UNB, ENCHANTMENTS.PROT, ENCHANTMENTS.FP, ENCHANTMENTS.FF, ENCHANTMENTS.BP, ENCHANTMENTS.PP, ENCHANTMENTS.RESP, 
           ENCHANTMENTS.AA, ENCHANTMENTS.THRN, ENCHANTMENTS.DS, ENCHANTMENTS.SRP, ENCHANTMENTS.SMITE, ENCHANTMENTS.BANE, ENCHANTMENTS.KB,
           ENCHANTMENTS.FA, ENCHANTMENTS.LT, ENCHANTMENTS.SE, ENCHANTMENTS.PWR, ENCHANTMENTS.PUNCH, ENCHANTMENTS.FLA, ENCHANTMENTS.INF, 
           ENCHANTMENTS.EFF, ENCHANTMENTS.SILK, ENCHANTMENTS.FORT, ENCHANTMENTS.SEA, ENCHANTMENTS.LURE, ENCHANTMENTS.CHANNEL, ENCHANTMENTS.IMP, 
           ENCHANTMENTS.LOY, ENCHANTMENTS.RIP, ENCHANTMENTS.MS, ENCHANTMENTS.PIERCE, ENCHANTMENTS.QC,
      ENCHANTMENTS.MEND,ENCHANTMENTS.VAN,ENCHANTMENTS.FW,ENCHANTMENTS.BIND,ENCHANTMENTS.SS/*,ENCHANTMENTS.CP*/] //CP chopping (upcoming)
}




/**
 * Main
 * (because this language is actually C)
**/
function main()
{
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


  // for (var i=0; i<ENCHANTMENT_SETS.all.length; i++)
  // {
  //   var out = ENCHANTMENT_SETS.all[i].name;
  //   out+=" ".repeat(21-out.length);
  //   for (var j=1; j<=ENCHANTMENT_SETS.all[i].maxlevel; j++)
  //     out+="\t"+ENCHANTMENT_SETS.all[i].levelLowFromPower(j);
  //   console.log(out);
  // }
  // var out1 = " ".repeat(21), out2 = " ".repeat(21);
  // for (var i=1; i<80-21; i++)
  //   {out1+=Math.floor(i/10);out2+=i%10;}
  // console.log(out1);console.log(out2);
  // for (var i=0; i<ENCHANTMENT_SETS.all.length; i++)
  // {
  //   var out = ENCHANTMENT_SETS.all[i].name;
  //   out+=" ".repeat(21-out.length);
  // for (var j=1; j<80-21; j++)
  //     out+=ENCHANTMENT_SETS.all[i].powerFromLevel(j);
  //   console.log(out);
  // }

  // for (var i=0; i<ENCHANTMENT_SETS.all.length; i++)
  //   console.log(ENCHANTMENT_SETS.all[i].toString());

 //enchant(10, new ProbDist(5,17), null, [], 0);
 enchant(1, new ProbDist(5), ENCHANTMENT_SETS.bow, CONFLICTS);
 // Max level:
 // (25) 49 gold armor (thorns 3 not possible (50))
 // (22) 47 Gold tool
 // (1)  36 bow/rod/etc (power 5 not possible (41))
 // 


  // var item = new ItemEnchantment();
  // //console.log(item.toString(true));
  // var en = new SingleEnchantment(ENCHANTMENTS.UNB, 3);
  // // console.log(item.applyable(en.ench)); item=item.add(en); console.log(item.toString(true));
  // //en = new SingleEnchantment(ENCHANTMENTS.SILK, 1)
  // //console.log(item.applyable(en.ench)); 
  // //item=item.add(en); 
  // //console.log(item.toString(true));
  // // en = new SingleEnchantment(ENCHANTMENTS.FORT, 3)
  // // console.log(item.applyable(en.ench)); item=item.add(en); console.log(item.toString(true));


  // var e=ENCHANTMENT_SETS.tool;
  // var se=[];
  // for (var i=0;i<e.length;i++)
  //   se.push(new SingleEnchantment(e[i],e[i].powerFromLevel(30)));
  // // for (var i=0;i<e.length;i++)
  // //   console.log(new ItemEnchantment().add(se[i]).toString(true));
  // var o = addEnchantmentsFromList(item, se, 30);
  // //console.log(o);
  // // for (var i=0;i<o.val.length;i++)
  // //   o.val[i]=o.val[i].toString();
  // console.log(o);
}


/**
 * Unit Tests
 * (because its not actually a bad idea)
**/
function unitTest()
{
  // bSqrt
  runTest(testBSqrt);

  // Primes Lib
  runTest(testPrimes);
  runTest(testFactorize);
  runTest(testGCD);
  runTest(testLCM);
  runTest(testProduct);
  // runTest(testBReduce);
  // runTest(testQReduce);
  testStatistics();
}



var tests=0;
var tests_passed=0;
var tests_failed=0;
function runTest(test)
{
  tests++;
  try { test(); tests_passed++; console.log('passed: '+test.name); }
  catch (err) { tests_failed++; console.log('!FAIL!: '+test.name); /*console.trace();*/ }
}
function testStatistics()
{
  console.log(tests_passed+'/'+tests+' passed. '+tests_failed+' failed.');
}
function assert(bool, message)
{
  if (!bool)
    if (message==undefined)
      throw "Assertion failed. Run with '--trace-uncaught' to show stack trace.";
    else
      throw message;
}
function assertEq(expected, actual, message)
{
  if (!(expected===actual))
    if (message==undefined)
      throw "Assertion failed. Expected '"+expected+"' but was actually '"+actual+"'. Run with '--trace-uncaught' to show stack trace.";
    else
      throw "Assertion failed. Expected '"+expected+"' but was actually '"+actual+"'. "+message;
}





function testBSqrt()
{
  let sqrt_message = 'Square root of BigInt values.';
  assert(0n==0n);
  var exp = 0n;
  for (var val=0n;val<=100n;val++)
  {
    if (val===1n||val===5n||val===9n||val===16n||val===25n||val===36n||val===49n||val===64n||val===81n||val===100n)
      exp++;
    assertEq(exp,bSqrt(val),sqrt_message);
  }
  assertEq(77n,bSqrt(77n*77n),sqrt_message);
  assertEq(77n,bSqrt(78n*78n-1n),sqrt_message);
  assertEq(5137n,bSqrt(5137n*5137n),sqrt_message);
  assertEq(5137n,bSqrt(5138n*5138n-1n),sqrt_message);
  assertEq(86839n,bSqrt(7541066681n),sqrt_message);
  assertEq(726145059471n,bSqrt(726145059472n*726145059472n-1n),sqrt_message);
  assertEq(726145059472n,bSqrt(726145059472n*726145059472n),sqrt_message);
  assertEq(726145059472n,bSqrt(726145059473n*726145059473n-1n),sqrt_message);
  assertEq(726145059473n,bSqrt(726145059473n*726145059473n),sqrt_message);
}
function testPrimes()
{
  while (bprimes[bprimes.length-1]<6000n)
    extendPrimes();
  assertEq(5591n,bprimes[738-1],'The 738th prime number should be 5591.');
}
function testFactorize()
{
  var i;
  var factors = bPrimeFactors(2663485784064000000000n);
  assertEq(43,factors.length);
  for (i=0;i<23;i++) assertEq(2n,factors[i]);
  for (i=0;i<7;i++) assertEq(3n,factors[23+i]);
  for (i=0;i<9;i++) assertEq(5n,factors[23+7+i]);
  for (i=0;i<2;i++) assertEq(7n,factors[23+7+9+i]);
  assertEq(37n,factors[41]);
  assertEq(41n,factors[42]);

  factors = bPrimeFactors(4846551n);
  assertEq(3,factors.length);
  assertEq(3n,factors[0]);
  assertEq(389n,factors[1]);
  assertEq(4153n,factors[2]);
  
  factors = bPrimeFactors(-2445676997n);
  assertEq(4,factors.length);
  assertEq(-1n,factors[0]);
  assertEq(53n,factors[1]);
  assertEq(6793n,factors[2]);
  assertEq(6793n,factors[3]);

  factors = bPrimeFactors(0n);
  assertEq(1,factors.length);
  assertEq(0n,factors[0]);

  factors = bPrimeFactors(1n);
  assertEq(0,factors.length);

  factors = bPrimeFactors(-1n);
  assertEq(1,factors.length);
  assertEq(-1n,factors[0]);
}
function testGCD()
{
  var i;

  var factors_c = bCofactors(1061340n,77805n*7n);
  var factors_i = bFactorsIntersect(bPrimeFactors(1061340n),bPrimeFactors(77805n*7n));
  assertEq(5,factors_c.length);   assertEq(5,factors_i.length);
  assertEq(3n,factors_c[0]);      assertEq(3n,factors_i[0]);
  assertEq(5n,factors_c[1]);      assertEq(5n,factors_i[1]);
  assertEq(7n,factors_c[2]);      assertEq(7n,factors_i[2]);
  assertEq(7n,factors_c[3]);      assertEq(7n,factors_i[3]);
  assertEq(19n,factors_c[4]);     assertEq(19n,factors_i[4]);

  factors_c = bCofactors(60727873587294018512000000n,157800210763504777600000000n);
  factors_i = bFactorsIntersect(bPrimeFactors(60727873587294018512000000n),bPrimeFactors(157800210763504777600000000n));
  assertEq(23,factors_c.length);             assertEq(23,factors_i.length);
  for (i=0;i<10;i++) { assertEq(2n,factors_c[i]);           assertEq(2n,factors_i[i]);           }
  for (i=0;i<6;i++)  { assertEq(5n,factors_c[10+i]);        assertEq(5n,factors_i[10+i]);        }
  for (i=0;i<2;i++)  { assertEq(11n,factors_c[10+6+i]);     assertEq(11n,factors_i[10+6+i]);     }
  for (i=0;i<2;i++)  { assertEq(17n,factors_c[10+6+2+i]);   assertEq(17n,factors_i[10+6+2+i]);   }
  for (i=0;i<2;i++)  { assertEq(37n,factors_c[10+6+2+2+i]); assertEq(37n,factors_i[10+6+2+2+i]); }
  assertEq(53n,factors_c[10+6+2+2+2+0]);     assertEq(53n,factors_i[10+6+2+2+2+0]);

  assertEq(0,bCofactors(2n,3n).length);
  assertEq(0,bFactorsIntersect([2n],[3n]).length);
  assertEq(0,bCofactors(18655n,314721n).length);
  assertEq(0,bFactorsIntersect(bPrimeFactors(18655n),bPrimeFactors(314721n)).length);

  factors_c = bCofactors(4n*18655n,4n*314721n);
  factors_i = bFactorsIntersect(bPrimeFactors(4n*18655n),bPrimeFactors(4n*314721n));
  assertEq(2,factors_c.length); assertEq(2,factors_i.length);
  assertEq(2n,factors_c[0]);    assertEq(2n,factors_i[0]);
  assertEq(2n,factors_c[1]);    assertEq(2n,factors_i[1]);
}
function testLCM()
{
  var i;
  var factors = bAllFactors(1061340n,77805n*7n)
  assertEq(18n,bProduct(bAllFactors(6n,9n)));
  assertEq(48n,bProduct(bAllFactors(12n,16n)));
  assertEq(5321n,bProduct(bAllFactors(5321n,5321n)));
  assertEq(236054965199503773052687830400000000n,bProduct(bAllFactors(60727873587294018512000000n,157800210763504777600000000n)));
}
function testProduct()
{
  var factors = [2n,2n,3n,7n,17n,19n,23n,23n,23n];
  assertEq(2n*2n*3n*7n*17n*19n*23n*23n*23n, bProduct(factors));
  assertEq(330115044n, bProduct(factors));
}
// function testBReduce()
// {
//   //list/gcd;
// }
// function testQReduce()
// {
//   //list*lcm(d)*gcd
// }





















// technically the only code in this file that runs
// the rest is just function definitions (that get called)
unitTest();
//main();





























/**
 * Sqrt for BigInts, courtesy of Anton
 * @author Anton
 * @link https://stackoverflow.com/a/53684036
**/
function bSqrt(value)
{
  if (value < 0n)
    throw 'square root of negative numbers is not supported';
  if (value < 2n)
    return value;
  function newtonIteration(n, x0)
  {
    const x1 = ((n / x0) + x0) >> 1n;
    if (x0 === x1 || x0 === (x1 - 1n))
      return x0;
    return newtonIteration(n, x1);
  }
  return newtonIteration(value, 1n);
}



