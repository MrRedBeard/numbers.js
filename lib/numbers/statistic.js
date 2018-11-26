/**
 * numbers.statistic.js
 * http://github.com/sjkaliski/numbers.js
 *
 * Copyright 2012 Stephen Kaliski
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

numbers.statistic = {
    mean: null,
    median: null,
    mode: null,
    quantile: null,
    report: null,
    standardDev: null,
    correlation: null,
    rSquared: null,
    exponentialRegression: null,
    linearRegression: null,
    covariance: null
};

/**
 * Calculate the mean value of a set of numbers in array.
 *
 * @param {Array} set of values.
 * @return {Number} mean value.
 */
numbers.statistic.mean = function (arr) {
  var count = arr.length;
  var sum = numbers.basic.sum(arr);
  return sum / count;
};

/**
 * Calculate the median value of a set of numbers in array.
 *
 * @param {Array} set of values.
 * @return {Number} median value.
 */
numbers.statistic.median = function (arr) {
  return numbers.statistic.quantile(arr, 1, 2);
};

/**
 * Calculate the mode value of a set of numbers in array.
 *
 * @param {Array} set of values.
 * @return {Number} mode value.
 */
numbers.statistic.mode = function (arr) {
  var counts = {};
  for (var i = 0, n = arr.length; i < n; i++) {
    if (counts[arr[i]] === undefined) {
      counts[arr[i]] = 0;
    } else {
      counts[arr[i]]++;
    }
  }

  var highest;

  for (var number in counts) {
    if (counts.hasOwnProperty(number)) {
      if (highest === undefined || counts[number] > counts[highest]) {
        highest = number;
      }
    }
  }

  return Number(highest);
};

/**
 * Calculate the kth q-quantile of a set of numbers in an array.
 * As per http://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population
 * Ex: Median is 1st 2-quantile
 * Ex: Upper quartile is 3rd 4-quantile
 *
 * @param {Array} set of values.
 * @param {Number} index of quantile.
 * @param {Number} number of quantiles.
 * @return {Number} kth q-quantile of values.
 */
numbers.statistic.quantile = function (arr, k, q) {
  var sorted, count, index;

  if (k === 0) return Math.min.apply(null, arr);

  if (k === q) return Math.max.apply(null, arr);

  sorted = arr.slice(0);
  sorted.sort(function (a, b) {
    return a - b;
  });
  count = sorted.length;
  index = count * k / q;

  if (index % 1 === 0) return 0.5 * sorted[index - 1] + 0.5 * sorted[index];

  return sorted[Math.floor(index)];
};


/**
 * Return a set of summary statistics provided an array.
 *
 * @return {Object} summary statistics.
 */
numbers.statistic.report = function (array) {
  return {
    mean: numbers.statistic.mean(array),
    firstQuartile: numbers.statistic.quantile(array, 1, 4),
    median: numbers.statistic.median(array),
    thirdQuartile: numbers.statistic.quantile(array, 3, 4),
    standardDev: numbers.statistic.standardDev(array)
  };
};

/**
 * Evaluate the standard deviation for a set of values.
 *
 * @param {Array} set of values.
 * @return {Number} standard deviation.
 */
numbers.statistic.standardDev = function (arr) {
  var count = arr.length;
  var mean = numbers.statistic.mean(arr);
  var squaredArr = [];

  for (var i = 0; i < arr.length; i++) {
    squaredArr[i] = Math.pow((arr[i] - mean), 2);
  }

  return Math.sqrt((1 / count) * numbers.basic.sum(squaredArr));
};

/**
 * Evaluate the correlation amongst a set of values.
 *
 * @param {Array} set of values.
 * @return {Number} correlation.
 */
numbers.statistic.correlation = function (arrX, arrY) {
  if (arrX.length === arrY.length) {
    var covarXY = numbers.statistic.covariance(arrX, arrY);
    var stdDevX = numbers.statistic.standardDev(arrX);
    var stdDevY = numbers.statistic.standardDev(arrY);

    return covarXY / (stdDevX * stdDevY);
  } else {
    throw new Error('Array mismatch');
  }
};

/**
 * Calculate the Coefficient of Determination of a dataset and regression line.
 *
 * @param {Array} Source data.
 * @param {Array} Regression data.
 * @return {Number} A number between 0 and 1.0 that represents how well the regression line fits the data.
 */
numbers.statistic.rSquared = function (source, regression) {
  var residualSumOfSquares = numbers.basic.sum(source.map(function (d, i) {
    return numbers.basic.square(d - regression[i]);
  }));

  var totalSumOfSquares = numbers.basic.sum(source.map(function (d) {
    return numbers.basic.square(d - numbers.statistic.mean(source));
  }));

  return 1 - (residualSumOfSquares / totalSumOfSquares);
};

/**
 * Create a function to calculate the exponential regression of a dataset.
 *
 * @param {Array} set of values.
 * @return {Function} function to accept X values and return corresponding regression Y values.
 */
numbers.statistic.exponentialRegression = function (arrY) {
  var n = arrY.length;
  var arrX = numbers.basic.range(1, n);

  var xSum = numbers.basic.sum(arrX);
  var yLog = arrY.map(function (d) {
    return Math.log(d);
  });
  var xSquared = arrX.map(function (d) {
    return d * d;
  });
  var xSquaredSum = numbers.basic.sum(xSquared);
  var yLogSum = numbers.basic.sum(yLog);
  var xyLog = arrX.map(function (d, i) {
    return d * yLog[i];
  });
  var xyLogSum = numbers.basic.sum(xyLog);

  var a = (yLogSum * xSquaredSum - xSum * xyLogSum) / (n * xSquaredSum - (xSum * xSum));
  var b = (n * xyLogSum - xSum * yLogSum) / (n * xSquaredSum - (xSum * xSum));

  var fn = function (x) {
    if (typeof x === 'number') {
      return Math.exp(a) * Math.exp(b * x);
    } else {
      return x.map(function (d) {
        return Math.exp(a) * Math.exp(b * d);
      });
    }
  };

  fn.rSquared = numbers.statistic.rSquared(arrY, arrX.map(fn));

  return fn;
};

/**
 * Create a function to calculate the linear regression of a dataset.
 *
 * @param {Array} X array.
 * @param {Array} Y array.
 * @return {Function} A function which given X or array of X values will return Y.
 */
numbers.statistic.linearRegression = function (arrX, arrY) {
  var n = arrX.length;
  var xSum = numbers.basic.sum(arrX);
  var ySum = numbers.basic.sum(arrY);
  var xySum = numbers.basic.sum(arrX.map(function (d, i) {
    return d * arrY[i];
  }));
  var xSquaredSum = numbers.basic.sum(arrX.map(function (d) {
    return d * d;
  }));
  var xMean = numbers.statistic.mean(arrX);
  var yMean = numbers.statistic.mean(arrY);
  var b = (xySum - 1 / n * xSum * ySum) / (xSquaredSum - 1 / n * (xSum * xSum));
  var a = yMean - b * xMean;

  return function (x) {
    if (typeof x === 'number') {
      return a + b * x;
    } else {
      return x.map(function (d) {
        return a + b * d;
      });
    }
  };
};

/**
 * Evaluate the covariance amongst 2 sets.
 *
 * @param {Array} set 1 of values.
 * @param {Array} set 2 of values.
 * @return {Number} covariance.
 */
numbers.statistic.covariance = function (set1, set2) {
  if (set1.length === set2.length) {
    var n = set1.length;
    var total = 0;
    var sum1 = numbers.basic.sum(set1);
    var sum2 = numbers.basic.sum(set2);

    for (var i = 0; i < n; i++) {
      total += set1[i] * set2[i];
    }

    return (total - sum1 * sum2 / n) / n;
  } else {
    throw new Error('Array mismatch');
  }
};
