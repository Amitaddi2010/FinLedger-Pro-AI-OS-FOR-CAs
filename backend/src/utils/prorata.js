/**
 * Calculate expected values based on time elapsed in the year.
 * This is the core prorata engine.
 * 
 * @param {number} annualTarget - The total target for the year
 * @param {Date} currentDate - Optional. Current date to calculate prorata. Defaults to now.
 * @returns {number} expected prorata value
 */
export const calculateProrata = (annualTarget, currentDate = new Date()) => {
  const currentYear = currentDate.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);
  
  const totalDaysInYear = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24) + 1;
  const daysElapsed = (currentDate - startOfYear) / (1000 * 60 * 60 * 24) + 1;
  
  const progressRatio = Math.min(daysElapsed / totalDaysInYear, 1);
  
  return annualTarget * progressRatio;
};

/**
 * Compare actual vs prorated expectation and calculate gap
 * @param {number} actual - Current achieved value
 * @param {number} prorataExpected - Expected prorated value
 * @returns {Object} { status (AHEAD|BEHIND), gap, percentage }
 */
export const compareWithProrata = (actual, prorataExpected) => {
  if (prorataExpected === 0) return { status: 'ON_TRACK', gap: 0, percentage: 0 };
  
  const gap = actual - prorataExpected;
  
  let percentage;
  if (actual < 0 && prorataExpected > 0) {
    // If profit is negative but target is positive, you are 100%+ behind.
    // Displaying 209000% is not helpful. We will cap it at -100% to represent "completely missed" 
    // or calculate it as a proportion of revenue if we had it, but here we just bound it to 100%.
    percentage = 100; // Representing 100% off track (or more, but capped for UI)
  } else {
    percentage = (Math.abs(gap) / Math.abs(prorataExpected)) * 100;
  }
  
  return {
    status: gap >= 0 ? 'AHEAD' : 'BEHIND',
    gap: gap,
    percentage: parseFloat(percentage.toFixed(2))
  };
};
