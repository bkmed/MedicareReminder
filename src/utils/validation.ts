export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Allows optional +, digits, spaces, dashes. Min length 8.
  const phoneRegex = /^[+]?[\d\s-]{8,}$/;
  return phoneRegex.test(phone);
};
