const authService = require('../services/auth.service');

/**
 * Controller to handle user registration.
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    
    const newUser = await authService.registerUser(fullName, email, password);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle user login.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const authResult = await authService.loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: authResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle user logout.
 * JWT auth is stateless, but this provides a clean endpoint for clients to call.
 */
const logout = async (req, res, next) => {
  try {
    // Return standard success response. The client is responsible for discarding the token.
    return res.status(200).json({
      success: true,
      message: 'Logout successful. Please discard your authentication token.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
};
