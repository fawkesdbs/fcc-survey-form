const User = require("./../user/model");
const { sendOTP, verifyOTP, deleteOTP } = require("./../otp/controller");
const { hashData } = require("./../../util/hashData");

const resetUserPassword = async ({ email, otp, newPassword }) => {
  try {
    const validOTP = await verifyOTP({ email, otp });
    if (!validOTP) {
      throw Error("Invalid OTP Passed. Check your inbox.");
    }

    // update user record with newPassword
    if (newPassword.length < 8) {
      throw Error("Password is too short!");
    }

    const hashedPassword = await hashData(newPassword);
    await User.updateOne({ email }, { password: hashedPassword });
    await deleteOTP(email);
    return;
  } catch (error) {
    throw error;
  }
};

const sendPasswordResteOTPEmail = async (email) => {
  try {
    // check if an account exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw Error("There is no existing account for the provided email.");
    }

    if (!existingUser.verified) {
      throw Error("Email hasn't been verified yet. Check your inbox.");
    }

    const otpDetails = {
      email,
      subject: "Password Reset",
      message: "Enter the code below to reset your password",
      duration: 1,
    };

    const createdOTP = await sendOTP(otpDetails);
    return createdOTP;
  } catch (error) {
    throw error;
  }
};

module.exports = { sendPasswordResteOTPEmail, resetUserPassword };
