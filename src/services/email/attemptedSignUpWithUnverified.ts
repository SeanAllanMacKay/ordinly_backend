type AttemptedSignUpWithUnverifiedProps = {
  verificationCode: string;
};

export default ({ verificationCode }: AttemptedSignUpWithUnverifiedProps) => ({
  subject: "Attempted sign up",
  html: `<h2>Someone just tried signing up with this email address</h2><p><a href="http://ordinly.com/landing/verify-account?code=${verificationCode}">Click Here</a> to verify your email and start planning!</p>`,
});
