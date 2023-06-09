function getBalls(balls, capacity) {
  const allBalls = balls.reduce((curSum, element) => curSum + element, 0);
  const stolenBalls = [];
  let remainingCapacity = capacity;
  const fractionRemainders = [];
  for (const ballColor of balls) {
    const ballProportion = ballColor / allBalls;
    const stolenBallCount = capacity * ballProportion;
    fractionRemainders.push(stolenBallCount % 1);
    const roundedCount = Math.floor(stolenBallCount);
    remainingCapacity -= roundedCount;
    stolenBalls.push(roundedCount);
  }

  while (remainingCapacity >= 1) {
    const i = fractionRemainders.indexOf(Math.max(...fractionRemainders));
    stolenBalls[i]++;
    remainingCapacity--;
    fractionRemainders[i] = 0;
  }

  return stolenBalls;
}

console.log(getBalls([100, 300, 200], 120)); // [20, 60, 40]
console.log(getBalls([50, 50], 10)); // должно вернуть [5, 5]
console.log(getBalls([50, 50, 11], 15)); // [7, 7, 1]
