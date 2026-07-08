// Exporting strict regex strings for HTML pattern attributes if needed
export const USERNAME_REGEX = /^[a-z0-9_]{4,20}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Common weak dictionary passwords to reject
const COMMON_PASSWORDS = [
  "password", "password123", "admin", "admin123", "qwerty", "qwerty123",
  "123456789", "12345678", "1234567890", "letmein", "welcome"
];

export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (username.length < 4 || username.length > 20) return { valid: false, error: "Username must be 4-20 characters." };
  if (!USERNAME_REGEX.test(username)) return { valid: false, error: "Username can only contain lowercase letters, numbers, and underscores." };
  return { valid: true };
};

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalized)) return { valid: false, error: "Please enter a valid email address." };
  return { valid: true };
};

export interface PasswordStrength {
  score: number; // 0 to 4
  label: "Weak" | "Fair" | "Good" | "Strong" | "Excellent";
  color: string;
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
    notCommon: boolean;
  };
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    notCommon: !COMMON_PASSWORDS.some(cp => password.toLowerCase().includes(cp)) && !/(.)\1{4,}/.test(password) // also checks for 5 repeated chars
  };

  const trueChecks = Object.values(checks).filter(Boolean).length;
  let score = 0;
  if (trueChecks <= 2) score = 0;
  else if (trueChecks === 3) score = 1;
  else if (trueChecks === 4) score = 2;
  else if (trueChecks === 5) score = 3;
  else if (trueChecks === 6) score = 4;

  const labels: Array<{label: PasswordStrength["label"], color: string}> = [
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-orange-500" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-blue-400" },
    { label: "Excellent", color: "bg-green-500" }
  ];

  return {
    score,
    label: labels[score].label,
    color: labels[score].color,
    checks
  };
};
