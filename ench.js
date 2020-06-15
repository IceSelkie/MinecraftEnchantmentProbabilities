
/**
 * Primes lib
 * @author Stanley S
 * @version 1.00
 * @date 2020-06-15
**/
primes = [2,3];
bprimes = [2n,3n];
function extendPrimes()
{
  val = primes[primes.length-1];
  ct = 0;
  while (ct<5)
  {
    val+=2;

    sq = Math.sqrt(val);
    p=true;
    for (i=0; primes[i]<=sq; i++)
      if (val%primes[i]==0)
      {
        p=false;
        break;
      }
    if (p)
    {
      console.log("Adding "+val+" as prime.")
      primes.push(val);
      bprimes.push(BigInt(val));
      ct++;
      console.log("ct now "+ct)
    }
  }
}
function primeFactors(val)
{
  sq = Math.sqrt(val);
  ret = [];
  for (i = 0; bprimes[i]<=sq; i++)
  {
    console.log("if ("+primes.length+"<"+(i+5)+")");
    if (primes.length<i+5)
      extendPrimes();
    while (val%primes[i]==0)
    {
      ret.push(primes[i]);
      val=val/primes[i];
      sq = Math.sqrt(val);
    }
  }
  if (val!=1)
    ret.push(val);
  return ret;
}
function bPrimeFactors(val)
{
  if (typeof val !== 'bigint')
    throw "bigint required for bfunctions"
  if (val==0n||val==-1n)
    return [val];
  if (val==1n)
    return [];

  ret = [];
  if (val<0)
  {
    ret.push[-1n];
    val*=-1n;
  }
  sq = bSqrt(val);
  for (i = 0; bprimes[i]<=sq; i++)
  {
    if (primes.length<i+5)
      extendPrimes();
    while (val%bprimes[i]==0n)
    {
      ret.push(bprimes[i]);
      val=val/bprimes[i];
      sq = bSqrt(val);
    }
  }
  if (val!=1n)
    ret.push(val);
  return ret;
}
function factorsIntersect(fact,other)
{
  i=0;
  j=0;
  ret = [];
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
function bFactorsIntersect(fact,other){return factorsIntersect(fact,other);}
function cofactors(fact, val)
{
  if (typeof fact === 'bigint')
    fact = bPrimeFactors(fact);
  ret=[]
  for (i=0; i<fact.length; i++)
  {
    if (val%fact[i]==0)
    {
      val%=fact[i];
      ret.push(fact[i]);
    }
  }
  return ret;
}





/**
 * Q lib
 * @author Stanley S
 * @version b0.9
 * @date 2020-06-15
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
  }

  get numerator(){return this.n;}
  set numerator(num){this.n=num;}
  get denominator(){return this.d;}
  set denominator(denom){this.d=denom;}
  toString(){return this.n+"/"+this.d;}
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
    str = str.substring(0,str.length-(width-pow))+"."+str.substring(str.length-(width-pow));
    return str;
  }
  mu(o){return this.multiply(o);}
  di(o){return this.divide(o);}
  sub(o){return this.subtract(o);}
  neg(){return this.negate();}
  reci(){return this.reciprocal();}
  multiply(other)
  {
    if (typeof other == 'bigint')
      return this.multiply(new Q(other));
    if (other instanceof Q)
    {
      if (other.n==0n)
        return Q.ZERO;
      if (this.n==other.d&&this.d==other.n)
        return Q.ONE;
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
  negate(){return new Q(-this.n,this.d);}
}
class QP
{
  constructor(a,b,c=null,d=null)
  {

  }
}
const ZERO = new Q(0n,1n);
const ONE = new Q(1n,1n);
const TWO = new Q(2n,1n);
const TEN = new Q(10n,1n);





/**
 * Probabilities lib
 * @author Stanley S
 * @version 0.15
 * @date 2020-06-15
**/
const maxStars=60

class pair
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
class probdistrib
{
  // An even distribution from a to b (inclusive).
  constructor(a,b)
  {
    if (typeof a !== 'number' || typeof b !== 'number')
      throw 'Expected Number type for both ends.'
    if (b<a && !(a==0&&b==-1))
      throw 'b should be larger than a.'
    this.wts=[];
    this.t=0n;
    if (a!=0||b!=-1)
      for (var i = a; i<=b; i++)
      {
        this.wts.push(new pair(i,1n));
        this.t++;
      }
  }

  get total(){return this.t;}
  get weights(){return this.wts;}

  // value *(scale±radius)+offset
  // triangleFloatDistMultRounded(scale, radius, offset)
  // {
  //   var ret = new probdistrib(0,-1);
  //   for (var i = 0; i<this.weights.length; i++)
  //   {
  //     var val = this.weights[i].value;
  //     var b_a = val*(scale-radius)+offset;
  //     var b_b = val*(scale+radius)+offset;
  //     var denom = 1n;
  //     for (l in ba:bb)
  //     {
  //       var lm=l-.5;
  //       var lp=l+.5;
  //       var x_aa=min();
  //       var x_ab=;
  //       var x_ba=;
  //       var x_bb=;

  //       integral from newval-.5 to newval+.5 of triangle as Q.
  //       // a:
  //       //   ((l+.5)^2-(v-sr)^2)/2r+(1-sv/r)((l+.5)-(v-sr))
  //       // b:
  //       //   (l-vs)/r+1;
  //       // c:
  //       //   (8svl-4(vs)^2-4l^2-1)/4r+1
  //       // d:
  //       //   (vs-l)/r+1;
  //       // e:
  //       //   ((l-.5)^2-(v+sr)^2)/2r+(1+sv/r)((v+sr)-(l-.5))
  //       // ac:
  //       //   nah
  //       // ce:
  //       //   nah
  //     }
  //   }

  //   for()
  //     ret=ret.union(each(val));
  //   return ret;
  // }

  simplify()
  {
    if (this.weights.length==0)
      return;
    if (this.weights.length==1)
    {
      this.weights[0].weight=1n;
      return
    }

    for (var i=this.weights.length-1;i>=0;i--)
      if (this.weights[i].weight==0n)
        this.weights.removetheitematindexi(i);
    var minwt = minWtAbove(this,0n);
    console.log(minwt);
    var common = bPrimeFactors(minWtAbove(this,0n));
    console.log("common: "+common);
    for (var i = 1; i<this.weights.length; i++)
    {
      common = cofactors(common,this.weights[i].weight);
      console.log("common: "+common);
      if (common.length==0)
        return;
    }
    var prod = common[0];
    for (var i=1;i<common.length;i++)
      prod*=common[i];
    for (var i=0;i<this.weights.length;i++)
      this.weights[i]/=prod;
  }
  add(val)
  {
    if (typeof val === 'number')
    {
      for (i=0; i<this.weights.length; i++)
        this.weights[i].value+=val;
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
            ret.push(new pair(v,w));
          }
          else
            ret[idx].weight+=w;
        }
      var ret2=new probdistrib(0,-1);
      ret2.wts=ret;
      ret2.t=tot;
      return ret2;
    }
  }
}
// class bpair{val:number, wt:BigInt; constructor (val, wt) {this.val=val;this.wt=wt}};
// class probability
// {

//   wts: pair[],
//   total: number;
// }
// class bprobability
// {
//   wts: bpair[],
//   total: BigInt;
// }

function minWtAbove(prob, val)
{
  if (typeof val !== 'bigint')
    throw "bigint required for working with weights"
  min=-1n;
  for (i=0;i<prob.weights.length; i++)
  {
    t=prob.weights[i];
    if (min==-1n||(min>t.weight && t.weight>val))
      min = t.weight;
  }
  return min;
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


  // p = new pair(5,5n);
  // console.log(typeof p);
  // console.log(p);
  // console.log(p.toString());
  // pd = new probdistrib(1,4);
  // console.log(typeof pd);
  // console.log(pd);
  // pd2 = pd.add(5);
  // console.log(pd);
  // pd2 = pd.add(pd);
  // console.log(pd2);
  // pd2.simplify();
  // console.log(pd2);

  console.log(5n instanceof BigInt)
  var val = new Q(1,1);
  console.log(val);
  console.log(val.mu(15n));
  val2 = val.mu(5n);
  console.log(val2);
  val = val.mu(17n);
  console.log(val);
  val3 = val.di(val2);
  console.log(val3);
  console.log(val.toDecimal());
  console.log(val2.toDecimal());
  console.log(val3.toDecimal());
}
main();





/**
 * Enchantment Code
 * @author Stanley S
 * @version 0.01
 * @date 2020-06-14
**/
function enchant(enchantability, enchantments, conflicts, remove)
{
  ;
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



