type MissedPaymentProps = {
  companyName: string;
};

export default ({ companyName }: MissedPaymentProps) => ({
  subject: "Missed payment",
  html: `<h2>We were unable to process your payment method for ${companyName}</h2><p><a href="http://ordinly.com/?form=login">Click Here</a> to login and update your payment method.</p>`,
});
