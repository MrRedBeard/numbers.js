
// random number generator.
var rGen = Math.random;


numbers.random = {
    setGenerator: null,
    sample: null,
    boxMullerTransform: null,
    irwinHall: null,
    bates: null,
    distribution:
    {
        normal: null,
        logNormal: null,
        boxMuller: null,
        irwinHall: null,
        irwinHallNormal: null,
        bates: null
    }
};

/**
 * Set the pseudo random number generator used by the random module.
 *
 * @param {Function} Random number generator
 */
numbers.random.setGenerator = function (fn) {
  if (typeof fn !== "function") {
    throw new Error("Must pass a function");
  }
  rGen = fn;
};
/**
 * Return a random sample of values over a set of bounds with
 * a specified quantity.
 *
 * @param {Number} lower bound.
 * @param {Number} upper bound.
 * @param {Number} quantity of elements in random sample.
 * @return {Array} random sample.
 */
numbers.random.sample = function (lower, upper, n) {
  var sample = [];
  sample.length = n;

  for (var i = 0; i < n; i++) {
    sample[i] = lower + (upper - lower) * rGen();
  }
  return sample;
};

/**
 * A pseudo-random number sampling method for generating pairs of independent,
 * standard, normally distributed (zero expectation, unit variance) random
 * numbers, given a source of uniformly distributed random numbers.
 * http://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
 *
 * @param {Number} mu or mean
 * @param {Number} sigma or standard deviation
 * @return {Number} a value that is part of a normal distribution.
 */
numbers.random.boxMullerTransform = function (mu, sigma) {
  if (arguments.length <= 1) sigma = 1;
  if (arguments.length === 0) mu = 0;
  var u = 0,
    v = 0,
    s;

  do {
    u = rGen() * 2 - 1;
    v = rGen() * 2 - 1;
    s = u * u + v * v;
  } while (s === 0 || s > 1);

  var c = Math.sqrt(-2 * Math.log(s) / s),
    x = u * c,
    y = v * c;
  x = mu + x * sigma;
  y = mu + y * sigma;
  return [x, y];
};

/**
 * A Random number that is along an irwin hall distribution.
 * http://en.wikipedia.org/wiki/Irwin-Hall_distribution
 *
 * @param {Number} max possible sum
 * @param {Number} number to subtract
 * @return {Number} random number along an irwin hall distribution.
 */
numbers.random.irwinHall = function (n, sub) {
  if (arguments.length === 1) sub = 0;
  var sum = 0;
  for (var i = 0; i < n; i++) sum += rGen();
  return sum - sub;
};

/**
 * Returns a random value along a bates distribution from [a, b] or [0, 1].
 * http://en.wikipedia.org/wiki/Bates_distribution
 *
 * @param {Number} number of times summing
 * @param {Number} random maximum value (default is 1)
 * @param {Number} random minimum value (default is 0)
 * @return {Number} random number along an bates distribution.
 */
numbers.random.bates = function (n, b, a) {
  if (arguments.length <= 2) a = 0;
  if (arguments.length === 1) b = 1;
  var sum = 0;
  for (var i = 0; i < n; i++) sum += (b - a) * rGen() + a;
  return sum / n;
};



/**
 * Returns an array of size n that is an approximate normal distribution
 *
 * @param {Number} n size of returned array
 * @param {Number} mu or mean
 * @param {Number} sigma or standard deviation
 * @return {Array} array of size n of a normal distribution
 */
numbers.random.distribution.normal = function (n, mu, sigma) {
  if (arguments.length <= 2) sigma = 1;
  if (arguments.length === 1) mu = 0;

  return numbers.random.distribution.boxMuller(n, mu, sigma);
};

/**
 * Returns an array of size n that is an approximate log normal distribution
 *
 * @param {Number} n size of returned array
 * @param {Number} mu or mean
 * @param {Number} sigma or standard deviation
 * @return {Array} array of size n of a log normal distribution
 */
numbers.random.distribution.logNormal = function (n, mu, sigma) {
  if (arguments.length <= 2) sigma = 1;
  if (arguments.length === 1) mu = 0;

  var exponential = function (x) {
    return Math.exp(x);
  };

  return numbers.random.distribution.boxMuller(n, mu, sigma).map(exponential);
};

/**
 * Returns an array of size n that is a normal distribution
 * leveraging the Box Muller Transform
 * http://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
 *
 * @param {Number} n size of returned array
 * @param {Number} mu or mean
 * @param {Number} sigma or standard deviation
 * @param {Number} determine if the distribution will be polar coordinates.
 * @return {Array} array of size n of a normal distribution
 */
numbers.random.distribution.boxMuller = function (n, mu, sigma, rc) {
  if (arguments.length <= 3) rc = false;
  if (arguments.length <= 2) sigma = 1;
  if (arguments.length === 1) mu = 0;
  var results = [];

  for (var i = 0; i < n; i++) {
    var randomBMT = numbers.random.boxMullerTransform(mu, sigma);
    results.push((rc) ? randomBMT : randomBMT[0]);
  }

  return results;
};

/**
 * Returns an array of n that is an irwin hall distribution.
 * http://en.wikipedia.org/wiki/Irwin-Hall_distribution
 *
 * @param {Number} length of array
 * @param {Number} irwinHall max sum value (default is n)
 * @param {Number} irwinHall subtraction value (default is 0)
 * @return {Array} irwin hall distribution from [a, b]
 */
numbers.random.distribution.irwinHall = function (n, m, sub) {
  if (arguments.length <= 2) sub = 0;
  if (arguments.length === 1) m = n;
  var results = new Array(n);
  for (var i = 0; i < n; i++) {
    results[i] = numbers.random.irwinHall(m, sub);
  }

  return results;
};

/**
 * An approach to create a normal distribution,
 * that relies on the central limit theorem,
 * resulting in an approximately standard normal distribution
 * with bounds of (-6, 6)
 *
 * @param {Number} length of array
 * @return {Array} an array of an approximate normal distribution from [-6, 6] of length n.
 */
numbers.random.distribution.irwinHallNormal = function (n) {
  return numbers.random.distribution.irwinHall(n, 12, 6);
};

/**
 * Returns an array of n that is a bates distribution from
 * http://en.wikipedia.org/wiki/Bates_distribution
 *
 * @param {Number} length of array
 * @param {Number} max bates value (default is n)
 * @param {Number} minimum bound a (default is 0)
 * @return {Array} bates distribution from [a, b]
 */
numbers.random.distribution.bates = function (n, b, a) {
  if (arguments.length <= 2) a = 0;
  if (arguments.length === 1) b = n;

  var results = new Array(n);

  for (var i = 0; i < n; i++) {
    results[i] = numbers.random.bates(n, b, a);
  }

  return results;
};
