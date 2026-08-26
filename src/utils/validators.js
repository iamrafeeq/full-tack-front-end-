
export const required = (value, label = "this field") => {
  if (!value || !String(value).trim())
    return label === "this field"
      ? "Please fill in this field."
      : `Please enter your ${label}.`;
};

export const validName = (value) => {
  if (!value) return;
  const trimmed = value.trim();

  if (trimmed.length < 3 || trimmed.length > 50)
    return "Name must be between 3 and 50 characters.";

  // allows letters (including accented characters), single spaces between words,
  // apostrophes (O'Brien), and hyphens (Anne-Marie)
  if (!/^[a-zA-Z\u00C0-\u017F]+(?:[\s'-][a-zA-Z\u00C0-\u017F]+)*$/.test(trimmed))
    return "Name can only contain letters, single spaces, hyphens, and apostrophes.";

  // reject multiple consecutive spaces, hyphens, or apostrophes
  if (/[\s'-]{2,}/.test(trimmed))
    return "Name can't contain consecutive spaces, hyphens, or apostrophes.";

  return; // valid — no error
};

export const validEmail = (value) => {
  if (!value) return;
  const trimmed = value.trim();
  if (trimmed.length > 100) return "Email is too long.";
  if (/\.\./.test(trimmed)) return "Email can't contain consecutive periods.";
  const [local] = trimmed.split("@");
  if (local && local.length > 64) return "Email is too long.";
  if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,}$/.test(trimmed))
    return "Enter a valid email address (e.g. john@example.com).";
};

export const strongPassword = (value) => {
  if (!value) return;
  if (/\s/.test(value)) return "Password must not contain spaces.";
  if (value.includes(".")) return "Password must not contain a dot.";
  if (value.length < 6 || value.length > 64)
    return "Password must be between 6 and 64 characters.";
  if (!/[a-zA-Z]/.test(value))
    return "Password must include at least one letter.";
  if (!/[0-9]/.test(value))
    return "Password must include at least one number.";
  if (!/[!@#$%^&*_-]/.test(value))
    return "Password must include at least one special character (e.g. !@#$_-).";
};

export const matchPassword = (password, confirm) => {
  if (!confirm) return;
  if (confirm !== password) return "Passwords do not match.";
};

export const validDateOfBirth = (value) => {
  if (!value) return "Date of birth is required.";
  const born = new Date(value);
  if (isNaN(born.getTime())) return "Enter a valid date.";
  const today = new Date();
  const minDate = new Date("1900-01-01");
  const cutoff = new Date("2015-01-01");
  if (born > today) return "Date of birth can't be in the future.";
  if (born < minDate) return "Enter a valid date of birth.";
  if (born >= cutoff) return "You must be born before 2015 to register.";
};

export const validPhone = (value) => {
  if (!value) return;
  const trimmed = value.trim();
  if (!/^\+?[\d\s\-()]+$/.test(trimmed))
    return "Phone number can only contain digits, spaces, +, -, and parentheses.";
  if ((trimmed.match(/\+/g) || []).length > 1)
    return "Enter a valid phone number.";
  if (trimmed.indexOf("+") > 0) return "Enter a valid phone number.";
  const digitCount = trimmed.replace(/\D/g, "").length;
  if (digitCount < 7 || digitCount > 11)
    return "Phone number must be 7 to 11 digits.";
};

export const validNationality = (value) => {
  if (!value) return;
  const trimmed = value.trim();

  if (trimmed.length < 3 || trimmed.length > 56)
    return "Nationality must be between 3 and 56 characters.";

  // letters, single spaces, and single hyphens (for compound nationalities)
  if (!/^[a-zA-Z]+(?:[ ][a-zA-Z]+)*$/.test(trimmed))
    return "Nationality can only contain letters, single spaces, and hyphens.";

  return; // valid
};

export const validCNIC = (value) => {
  if (!value) return;
  const trimmed = value.trim();

  // accepts either format: with hyphens (12345-1234567-1) or without (1234512345671)
  const digitsOnly = trimmed.replace(/-/g, "");

  if (!/^\d{14}$/.test(digitsOnly))
    return "CNIC must contain exactly 14 digits.";

  // if hyphens are present, they must be in the correct positions
  if (trimmed.includes("-")) {
    if (!/^\d{5}-\d{7}-\d{1}$/.test(trimmed))
      return "CNIC format should be 12345-1234567-1.";
  }

  return; // valid
};

export const validPassport = (value) => {
  if (!value) return;
  const trimmed = value.trim().toUpperCase();
  if (!/^[A-Z]{1,2}\d{6,8}$/.test(trimmed))
    return "Enter a valid passport number (e.g. AB1234567).";
};

export const runValidators = (value, validators) => {
  for (const fn of validators) {
    const error = fn(value);
    if (error) return error;
  }
  return undefined;
};