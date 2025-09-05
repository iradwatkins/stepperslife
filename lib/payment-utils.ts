/**
 * Payment System Utilities
 * Centralized functions for fee calculations and payment model comparisons
 */

// Fee structures for each payment model
export const PAYMENT_MODEL_FEES = {
  CREDITS: {
    fixedFeePerTicket: 0.79,
    percentageFee: 0,
    processingFee: 0,
  },
  PREMIUM: {
    fixedFeePerTicket: 0.99,
    serviceFeePercent: 3.7,
    processingFeePercent: 2.9,
    totalPercentage: 6.6, // service + processing
  },
  SPLIT: {
    platformSplitPercent: 10,
    organizerSplitPercent: 90,
  },
} as const;

/**
 * Calculate total fees for credits model
 */
export function calculateCreditsFees(
  ticketCount: number,
  ticketPrice: number
): {
  totalRevenue: number;
  platformFee: number;
  processingFee: number;
  totalFees: number;
  netRevenue: number;
  feePercentage: number;
  perTicketCost: number;
} {
  const totalRevenue = ticketCount * ticketPrice;
  const platformFee = ticketCount * PAYMENT_MODEL_FEES.CREDITS.fixedFeePerTicket;
  const processingFee = 0; // Organizer handles their own
  const totalFees = platformFee;
  const netRevenue = totalRevenue - totalFees;
  const feePercentage = totalRevenue > 0 ? (totalFees / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    platformFee,
    processingFee,
    totalFees,
    netRevenue,
    feePercentage,
    perTicketCost: PAYMENT_MODEL_FEES.CREDITS.fixedFeePerTicket,
  };
}

/**
 * Calculate total fees for premium processing model
 */
export function calculatePremiumFees(
  ticketCount: number,
  ticketPrice: number
): {
  totalRevenue: number;
  serviceFee: number;
  fixedFee: number;
  processingFee: number;
  totalFees: number;
  netRevenue: number;
  feePercentage: number;
  perTicketCost: number;
} {
  const totalRevenue = ticketCount * ticketPrice;
  const serviceFee = (totalRevenue * PAYMENT_MODEL_FEES.PREMIUM.serviceFeePercent) / 100;
  const fixedFee = ticketCount * PAYMENT_MODEL_FEES.PREMIUM.fixedFeePerTicket;
  const processingFee = (totalRevenue * PAYMENT_MODEL_FEES.PREMIUM.processingFeePercent) / 100;
  const totalFees = serviceFee + fixedFee + processingFee;
  const netRevenue = totalRevenue - totalFees;
  const feePercentage = totalRevenue > 0 ? (totalFees / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    serviceFee,
    fixedFee,
    processingFee,
    totalFees,
    netRevenue,
    feePercentage,
    perTicketCost: ticketCount > 0 ? totalFees / ticketCount : 0,
  };
}

/**
 * Calculate fees for split payment model
 */
export function calculateSplitFees(
  ticketCount: number,
  ticketPrice: number,
  splitPercent: number = PAYMENT_MODEL_FEES.SPLIT.platformSplitPercent
): {
  totalRevenue: number;
  platformAmount: number;
  organizerAmount: number;
  feePercentage: number;
} {
  const totalRevenue = ticketCount * ticketPrice;
  const platformAmount = (totalRevenue * splitPercent) / 100;
  const organizerAmount = totalRevenue - platformAmount;

  return {
    totalRevenue,
    platformAmount,
    organizerAmount,
    feePercentage: splitPercent,
  };
}

/**
 * Compare all payment models and return savings analysis
 */
export function comparePaymentModels(
  ticketCount: number,
  ticketPrice: number
): {
  credits: ReturnType<typeof calculateCreditsFees>;
  premium: ReturnType<typeof calculatePremiumFees>;
  split: ReturnType<typeof calculateSplitFees>;
  recommendation: 'credits' | 'premium' | 'split';
  savingsVsPremium: number;
  savingsPercentage: number;
} {
  const credits = calculateCreditsFees(ticketCount, ticketPrice);
  const premium = calculatePremiumFees(ticketCount, ticketPrice);
  const split = calculateSplitFees(ticketCount, ticketPrice);

  // Determine best model based on net revenue
  let recommendation: 'credits' | 'premium' | 'split' = 'credits';
  
  if (credits.netRevenue >= premium.netRevenue && credits.netRevenue >= split.organizerAmount) {
    recommendation = 'credits';
  } else if (premium.netRevenue >= split.organizerAmount) {
    recommendation = 'premium';
  } else {
    recommendation = 'split';
  }

  const savingsVsPremium = premium.totalFees - credits.totalFees;
  const savingsPercentage = premium.totalFees > 0 
    ? (savingsVsPremium / premium.totalFees) * 100 
    : 0;

  return {
    credits,
    premium,
    split,
    recommendation,
    savingsVsPremium,
    savingsPercentage,
  };
}

/**
 * Format currency value consistently
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate credit package value
 */
export function calculatePackageValue(
  packagePrice: number,
  credits: number
): {
  pricePerCredit: number;
  standardCost: number;
  savings: number;
  savingsPercent: number;
} {
  const pricePerCredit = packagePrice / credits;
  const standardCost = credits * PAYMENT_MODEL_FEES.CREDITS.fixedFeePerTicket;
  const savings = standardCost - packagePrice;
  const savingsPercent = standardCost > 0 ? (savings / standardCost) * 100 : 0;

  return {
    pricePerCredit,
    standardCost,
    savings,
    savingsPercent,
  };
}

/**
 * Determine if an organizer should use credits based on their profile
 */
export function shouldRecommendCredits(
  ticketCount: number,
  ticketPrice: number,
  eventsCompleted: number = 0,
  hasExistingCredits: boolean = false
): {
  recommend: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let recommend = false;

  // Factor 1: Volume - high volume benefits from credits
  if (ticketCount >= 100) {
    recommend = true;
    reasons.push(`High volume event (${ticketCount} tickets) benefits from bulk credit pricing`);
  }

  // Factor 2: Experience - experienced organizers can handle credits model
  if (eventsCompleted >= 3) {
    recommend = true;
    reasons.push(`Experienced organizer (${eventsCompleted} events) can maximize credit benefits`);
  }

  // Factor 3: Existing credits
  if (hasExistingCredits) {
    recommend = true;
    reasons.unshift('You already have credits available');
  }

  // Factor 4: Cost savings
  const comparison = comparePaymentModels(ticketCount, ticketPrice);
  if (comparison.savingsVsPremium > 0) {
    reasons.push(`Save ${formatCurrency(comparison.savingsVsPremium)} vs premium processing`);
  }

  // Factor 5: New organizers might need support
  if (eventsCompleted === 0 && !recommend) {
    reasons.push('As a new organizer, premium processing provides full support');
  }

  return {
    recommend,
    reasons,
  };
}

/**
 * Calculate break-even point between payment models
 */
export function calculateBreakEvenPoint(): {
  ticketsNeeded: number;
  priceThreshold: number;
  explanation: string;
} {
  // Credits: $0.79 per ticket (flat)
  // Premium: 6.6% + $0.99 per ticket
  
  // For a given ticket price P:
  // Credits cost per ticket: $0.79
  // Premium cost per ticket: 0.066 * P + 0.99
  
  // Break even when: 0.79 = 0.066 * P + 0.99
  // Solving: P = (0.79 - 0.99) / 0.066 = -3.03
  
  // Since this is negative, premium is ALWAYS more expensive
  // The question is: at what volume do the savings justify the upfront credit purchase?
  
  // Minimum credit package is 100 credits for $79
  // To break even on the package, you need to use all 100 credits
  
  return {
    ticketsNeeded: 100,
    priceThreshold: 0, // Premium is always more expensive
    explanation: 'Credits are always cheaper per ticket. Break-even occurs at 100 tickets (minimum package size).',
  };
}

/**
 * Validate payment configuration completeness
 */
export function validatePaymentConfig(config: {
  paymentModel: 'credits' | 'premium' | 'split';
  hasCredits?: boolean;
  hasProcessor?: boolean;
  hasBankAccount?: boolean;
}): {
  isValid: boolean;
  missingRequirements: string[];
} {
  const missingRequirements: string[] = [];
  
  switch (config.paymentModel) {
    case 'credits':
      if (!config.hasCredits) {
        missingRequirements.push('Purchase credits');
      }
      if (!config.hasProcessor) {
        missingRequirements.push('Connect payment processor (Stripe/Square/PayPal)');
      }
      break;
      
    case 'premium':
      if (!config.hasBankAccount) {
        missingRequirements.push('Add bank account for payouts');
      }
      break;
      
    case 'split':
      if (!config.hasProcessor) {
        missingRequirements.push('Connect payment processor');
      }
      break;
  }
  
  return {
    isValid: missingRequirements.length === 0,
    missingRequirements,
  };
}