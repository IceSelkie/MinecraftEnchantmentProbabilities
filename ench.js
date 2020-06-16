
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
 * @version b1.1
 * @date 2020-06-16
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
  toDecimal(width=10)
  {
    // the E+pow
    var pow=this.n.toString().length-this.d.toString().length;
    var p = 1n;
    for (var i=0; i<width-pow; i++)
      p*=10n;
    var str = (this.n*p/this.d).toString()
    while (str.length<width-pow+1)
      str = "0"+str;
    if (str.length>pow)
      str = str.substring(0,str.length-(width-pow))+"."+str.substring(str.length-(width-pow));
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

  rt(){return this.truncate();}       //RoundTruncate
  r(){return this.round();}           //Round
  ro(){return this.roundout();}       //RoundOut

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
    {if (this.n%this.d==0) return this;
    return this.truncate().add(1n);}
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
      if (this.n==0n||other.n==0n)
        return ZERO;
      if (this.n==other.d&&this.d==other.n)
        return ONE;
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
          probs.push({"l":l.n,"x":x});
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
        var index = ret.l.indexOf(this.weights[i].value);
        if (index==-1)
        {
          ret.l.push(probs[j].l);
          ret.x.push(q(probs[j].x,fact));
        }
        else
          ret.x[index].a(q(probs[j],fact));
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



  toString(fancy=false, sorted=true)
  {
    if (sorted)
      this.wts.sort(function(a,b){return -a.val+b.val;})
    var ret="{\n";
    for (var i=0;i<this.weights.length;i++)
      ret+="  "+this.weights[i].value+"  ->  "+q(this.weights[i].weight*100n,this.total).toDecimal(5)+"%\n"
    return ret+"}";
  }
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

  var dist = new ProbDist(0,1).add(new ProbDist(0,1)).add(15);
  // var dist = new ProbDist(15);
  // var dist = new ProbDist(16);
  // var dist = new ProbDist(17);
  console.log(dist);
  console.log(dist.toString());
  dist = dist.triangleFloatModifier(1,q(3,20));
  // dist = dist.triangleFloatModifier(q(47,10),q(187,296),q(73,53));
  console.log(dist);
  console.log(dist.toString());

  // enchant(10, 17, null, [], 0);
}
main();





/**
 * Enchantment Code
 * @author Stanley S
 * @version 0.01
 * @date 2020-06-14
**/
function enchant(enchantability, level, enchantments, conflicts, remove)
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
    // level = level.triangleFloatModifier(1, q(3,20));
    // console.log(level);
  }

}





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



