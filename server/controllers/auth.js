const dotenv = require("dotenv");
dotenv.load();

const crypto = require("crypto-promise");

const moment = require("moment");

const passport = require("../config").passport;

const User = require("../models/user");

const userUtils = require("../utils/user-utils");

const emailUtils = require("../utils/email-utils");

const validationUtils = require("../utils/validation-utils");

const ERRORS = require("../constants").ERRORS;

const utils = require("../utils");

const _log = utils._log;

const log = require("ololog").configure({ locate: false });

const { _send_email } = emailUtils;

const { standardizeUser, generateJWT, getRole } = userUtils;

const { responseValidator } = validationUtils;

/**
 * createTokenCtx  - Creates JWT info for ctx.body
 * @param {Object} user User object to convert to generate JWT with
 */
const createTokenCtx = user => {
  const tokenData = generateJWT(user);

  return {
    token: `JWT ${tokenData.token}`,
    tokenExpiration: tokenData.expiration,
    user: standardizeUser(user)
  };
};

/**
 * jwtAuth  - Attempts to authenticate a user via a JWT in the Authorization
 *            header.
 */
exports.jwtAuth = (ctx, next) =>
  passport.authenticate("jwt", async (err, payload) => {
    const epochTimestamp = Math.round(new Date().getTime() / 1000);

    // If there is no payload, inform the user they are not authorized to see the content
    if (!payload) {
      ctx.status = 401;
      ctx.body = { errors: { error: ERRORS.JWT_FAILURE }, jwtExpired: true };
      // Check if JWT has expired, return error if so
    } else if (payload.exp <= epochTimestamp) {
      ctx.status = 401;
      ctx.body = { errors: { error: ERRORS.JWT_EXPIRED }, jwtExpired: true };
    } else {
      // Add user to state
      ctx.state.user = payload;
      await next();
    }
  })(ctx, next);

/**
 * localAuth  - Attempts to login a user with an email address and password
 *              using PassportJS (http://passportjs.org/docs)
 */
exports.login = (ctx, next) =>
  passport.authenticate("local", async (err, user) => {
    if (!user || !Object.keys(user).length) {
      ctx.status = 401;
      ctx.body = { errors: [{ error: ERRORS.BAD_LOGIN }] };
      await next();
    } else {
      ctx.body = Object.assign(ctx.body || {}, createTokenCtx(user));
      await next();
    }
  })(ctx, next);

/**
 * register - Attempts to register a new user, if a user with that email
 *            address does not already exist.
 */
exports.register = async (ctx, next) => {
  const register_user = {
    firstName: ctx.request.body.name.firstName,
    lastName: ctx.request.body.name.lastName,
    email: ctx.request.body.email,
    password: ctx.request.body.password,
    passwordConfirm: ctx.request.body.passwordConfirm
  };

  const validation = responseValidator(register_user, [
    { name: "firstName", required: true },
    { name: "lastName", required: true },
    { name: "email", required: true },
    { name: "password", required: true },
    { name: "passwordConfirm", required: true }
  ]);

  if (validation && validation.length && validation[0].error) {
    ctx.status = 422;
    ctx.body = { errors: validation };
    await next();
  }

  const {
    email,
    password,
    passwordConfirm,
    firstName,
    lastName,
    zipCode
  } = validation;

  if (
    email &&
    password &&
    passwordConfirm &&
    firstName &&
    lastName &&
    zipCode
  ) {
    const formattedEmail = email.toLowerCase();

    try {
      let user = await User.findOne({ email: formattedEmail });

      if (user !== null) {
        ctx.status = 422;

        ctx.body = { errors: [{ error: ERRORS.ALREADY_REGISTERED }] };

        await next();
      } else {
        user = new User({
          firstName,
          lastName,
          password,
          passwordConfirm,
          email
        });

        const savedUser = await user.save();

        ctx.body = Object.assign(ctx.body || {}, createTokenCtx(savedUser));

        await next();
      }
    } catch (err) {
      ctx.throw(500, err);
    }
  }
};

/**
 * forgotPassword - Allows a user to request a password reset, but does not
 *                  actually reset a password. Sends link in email for security.
 */
exports.forgotPassword = async (ctx, next) => {
  const { email } = ctx.request.body;

  try {
    const buffer = await crypto.randomBytes(48);

    const resetToken = buffer.toString("hex");

    const user = await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken: resetToken,
        resetPasswordExpires: moment().add(1, "hour")
      }
    );

    if (user) {
      let _host;

      if (process.env.AUTH_ENV === "dev") {
        _host = "http://localhost:8080";
      } else if (process.env.AUTH_ENV === "prod") {
        _host = "https://escanner.co";
      }

      const body = {
        from: "reset_password@escanner.co",
        subject: "Reset Password",
        text:
          `${"You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click the link below, or paste this into your browser to complete the process:\n\n"} +
				${_host}/reset-password/${resetToken}\n\n` +
          "If you did not request this, please ignore this email and your password will remain unchanged.\n"
      };

      _send_email(email, body);
    }

    ctx.body = {
      message: `We sent an email to ${email} containing a password reset link. It will expire in one hour.`
    };

    await next();
  } catch (err) {
    ctx.throw(500, err);
  }
};

/**
 * resetPassword  - Allows user with token from email to reset their password
 */
exports.resetPassword = async (ctx, next) => {
  const { password, confirmPassword } = ctx.request.body;

  const { resetToken } = ctx.params;

  try {
    if (password && confirmPassword && password !== confirmPassword) {
      ctx.status = 422;
      ctx.body = { errors: [{ error: ERRORS.PASSWORD_CONFIRM_FAIL }] };
    } else {
      const hashed_password = await utils._hash_password(password);

      const user = await User.findOneAndUpdate(
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: { $gt: Date.now() }
        },
        {
          password: hashed_password,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined
        }
      );

      if (!user) {
        ctx.status = 422;
        ctx.body = { errors: [{ error: ERRORS.PASSWORD_RESET_EXPIRED }] };
      } else {
        ctx.body = {
          message:
            "Your password has been successfully updated. Please login with your new password."
        };
      }

      await next();
    }
  } catch (err) {
    ctx.throw(500, err);
  }
};

/**
 * requireRole  - Ensures a user has a high enough role to access an endpoint
 */
exports.requireRole = async role => async (ctx, next) => {
  const { user } = ctx.state.user;

  try {
    const foundUser = await User.findById(user.id);
    // If the user couldn't be found, return an error
    if (!foundUser) {
      ctx.status = 404;
      ctx.body = { errors: [{ error: ERRORS.USER_NOT_FOUND }] };
    } else {
      // Otherwise, continue checking role
      if (getRole(user.role) >= getRole(role)) {
        await next();
      }

      ctx.status = 403;
      ctx.body = { errors: [{ error: ERRORS.NO_PERMISSION }] };
    }
  } catch (err) {
    ctx.throw(500, err);
  }
};

/**
 * getAuthenticatedUser  - Returns JSON for the authenticated user
 */
exports.getAuthenticatedUser = async (ctx, next) => {
  const user = await User.findById(ctx.state.user.id);
  ctx.status = 200;
  ctx.body = { user: standardizeUser(user) };
  await next();
};

exports.getAll = async (ctx, next) => {
  const all_users = await User.find().select("-hash");
  ctx.body = {
    message: "all users",
    data: all_users
  };
  await next();
};
