const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const parseCookies = require('../utils/parseCookies');
const {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  verifyRefreshToken,
} = require('../config/jwt');

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
  });
};

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

  setRefreshCookie(res, refreshToken);

  res.status(201).json(
    new ApiResponse(201, {
      user: user.toPublicJSON(),
      accessToken,
    }, 'Registration successful')
  );
});

const registerInternal = asyncHandler(async (req, res) => {
  const { user, accessToken } = await authService.registerUser(req.body);

  res.status(201).json(
    new ApiResponse(201, {
      user: user.toPublicJSON(),
      accessToken,
    }, 'User created successfully')
  );
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

  setRefreshCookie(res, refreshToken);

  res.status(200).json(
    new ApiResponse(200, {
      user: user.toPublicJSON(),
      accessToken,
    }, 'Login successful')
  );
});

const logout = asyncHandler(async (req, res) => {
  let userId = req.user?.id;

  if (!userId) {
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        userId = decoded.id;
      } catch {
        // ignore invalid refresh token on logout
      }
    }
  }

  if (userId) {
    await authService.logoutUser(userId);
  }

  clearRefreshCookie(res);

  res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
});

const refresh = asyncHandler(async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies[REFRESH_COOKIE_NAME];

  const { accessToken, user } = await authService.refreshAccessToken(refreshToken);

  res.status(200).json(
    new ApiResponse(200, {
      user: user.toPublicJSON(),
      accessToken,
    }, 'Token refreshed successfully')
  );
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);

  res.status(200).json(
    new ApiResponse(200, { user: user.toPublicJSON() }, 'User profile fetched')
  );
});

const getUser = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.params.id);

  res.status(200).json(
    new ApiResponse(200, { user: user.toPublicJSON() }, 'User profile fetched')
  );
});

module.exports = {
  register,
  registerInternal,
  login,
  logout,
  refresh,
  getMe,
  getUser,
};
