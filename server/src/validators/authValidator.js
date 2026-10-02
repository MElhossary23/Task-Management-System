export const validateRegisterInput = ({ name, email, password }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please provide a valid email address";
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  return errors;
};

export const validateLoginInput = ({ email, password }) => {
  const errors = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please provide a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};
