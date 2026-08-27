type ValidateInput = {
  formula: string;
  rate_kg_per_rai: number;
};

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  is_urea: boolean;
};

const RATE_MIN = 0;
const RATE_MAX = 100;
const UREA_FORMULA = "46-0-0";

export function validateFertilizer(input: ValidateInput): ValidationResult {
  const errors: string[] = [];

  if (!input.formula || input.formula.trim().length === 0) {
    errors.push("formula");
  }

  if (input.rate_kg_per_rai < RATE_MIN || input.rate_kg_per_rai > RATE_MAX) {
    errors.push("rate");
  }

  const isUrea = input.formula === UREA_FORMULA;

  return {
    isValid: errors.length === 0,
    errors,
    is_urea: isUrea,
  };
}
