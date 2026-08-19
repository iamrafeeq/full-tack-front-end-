// Shared validator functions — each returns an error string or undefined (no error)

export const required = (value, label = "This field") => {
  if (!value || !String(value).trim()) return `${label} is required.`;
};

// Only English letters and spaces — no numbers, symbols, or accented chars
export const validName = (value) => {
  if (!value) return;
  if (!/^[a-zA-Z ]+$/.test(value.trim()))
    return "Name can only contain English letters.";
  if (value.trim().length < 2)
    return "Name must be at least 2 characters.";
};

// Standard email — local part can have letters, digits, dots, hyphens, underscores
export const validEmail = (value) => {
  if (!value) return;
  if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value))
    return "Enter a valid email address (e.g. john@example.com).";
};

// Password rules: 8+ chars, at least one letter, one digit, one special char
// Special chars allowed: ! @ # $ % ^ & * _ - .
export const strongPassword = (value) => {
  if (!value) return;
  if (value.length < 6)
    return "Password must be at least 6 characters.";
  if (!/[a-zA-Z]/.test(value))
    return "Password must include at least one letter.";
  if (!/[0-9]/.test(value))
    return "Password must include at least one number.";
  if (!/[!@#$%^&*_\-.]/.test(value))
    return "Password must include at least one special character (e.g. !@#$_-).";
};

// Date of birth must be before 2015 — anyone born in 2015 or later cannot register
export const validDateOfBirth = (value) => {
  if (!value) return "Date of birth is required.";
  const born = new Date(value);
  const cutoff = new Date("2015-01-01");
  if (born >= cutoff)
    return "You must be born before 2015 to register.";
};

export const matchPassword = (password, confirm) => {
  if (confirm && confirm !== password) return "Passwords do not match.";
};

// Phone: optional leading +, digits, spaces, hyphens, parentheses — 7 to 15 digits total
export const validPhone = (value) => {
  if (!value) return;
  if (!/^\+?[\d\s\-()+]{7,11}$/.test(value))
    return "Enter a valid phone number ).";
};

// Nationality — only English letters and spaces
export const validNationality = (value) => {
  if (!value) return;
  if (!/^[a-zA-Z ]+$/.test(value.trim()))
    return "Nationality can only contain English letters.";
};

// CNIC / Passport — digits, letters, and hyphens
export const validCNIC = (value) => {
  if (!value) return;
  if (!/^[a-zA-Z0-9\-]{5,20}$/.test(value.trim()))
    return "Enter a valid CNIC or Passport number e.g. 42201-1234567-1.";
};

// Run an array of validators against a value and return the first error found
export const runValidators = (value, validators) => {
  for (const fn of validators) {
    const error = fn(value);
    if (error) return error;
  }
  return undefined;
};
