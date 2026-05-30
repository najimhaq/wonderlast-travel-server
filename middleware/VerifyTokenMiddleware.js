const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

const JWKS = createRemoteJWKSet(new URL(process.env.JWKS_URI));

const verifyTokenMiddleware = async (req, res, next) => {
  const authHeader = req?.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Token missing',
    });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload; // user info পরবর্তী route-এ পাবে
    console.log(payload)
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
};

module.exports = verifyTokenMiddleware;
