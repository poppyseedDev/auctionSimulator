export interface Slope {
  rate: number;
  duration: number;
}

export const calculateLinearPrice = (
  initialPrice: number,
  minPrice: number,
  elapsedIntervals: number,
  totalIntervals: number
): number => {
  const price = initialPrice - (elapsedIntervals * (initialPrice - minPrice)) / totalIntervals;
  return Math.max(price, minPrice);
};

export const calculateExponentialPrice = (
  initialPrice: number,
  minPrice: number,
  elapsedIntervals: number,
  totalIntervals: number
): number => {
  const decay = Math.exp(-5 * (elapsedIntervals / totalIntervals));
  const price = minPrice + (initialPrice - minPrice) * decay;
  return Math.max(price, minPrice);
};

export const calculateCustomPrice = (
  initialPrice: number,
  minPrice: number,
  elapsedIntervals: number,
  slopes: Array<Slope>
): number => {
  let currentInterval = 0;
  let currentPrice = initialPrice;

  for (const slope of slopes) {
    if (elapsedIntervals > currentInterval + slope.duration) {
      currentPrice -= slope.rate * slope.duration;
      currentInterval += slope.duration;
    } else {
      currentPrice -= slope.rate * (elapsedIntervals - currentInterval);
      break;
    }
  }

  return Math.max(currentPrice, minPrice);
};
