const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../config/jwt');

const buildTokenPayload = (user) => ({
  id: user._id.toString(),
  email: user.email,
  role: user.role,
  name: user.name,
});

const issueAuthTokens = async (user) => {
  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: user._id.toString() });

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = async ({ name, email, password, phone, role }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered', [
      { field: 'email', message: 'Email already registered' },
    ]);
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone: phone || undefined,
    role: role || 'CITIZEN',
  });

  const tokens = await issueAuthTokens(user);
  
  // Trigger registration welcome email notification in the background
  triggerRegistrationNotification(user).catch(err => {
    console.error('[AuthService] Welcome email background trigger failed:', err.message);
  });

  return { user, ...tokens };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const tokens = await issueAuthTokens(user);
  return { user, ...tokens };
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token required');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const accessToken = signAccessToken(buildTokenPayload(user));
  return { accessToken, user };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const triggerRegistrationNotification = async (user) => {
  const url = `${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5005'}/api/notifications/trigger`;
  const internalSecret = process.env.INTERNAL_SERVICE_SECRET || process.env.INTERNAL_SERVICE_KEY || 'your-internal-service-secret';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': internalSecret,
      },
      body: JSON.stringify({
        userId: user._id.toString(),
        type: 'USER_REGISTERED',
        title: 'Welcome to CivicConnect!',
        message: `Hello ${user.name}, your account has been registered successfully.`,
        email: user.email,
        userName: user.name,
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error('[AuthService] Welcome email trigger failed:', errText);
    } else {
      console.log(`[AuthService] Triggered registration welcome email for ${user.email}`);
    }
  } catch (error) {
    console.error('[AuthService] Failed to trigger registration welcome email:', error.message);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserById,
};
