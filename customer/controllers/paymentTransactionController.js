const asyncWrapper = require('../../middleware/asyncWrapper')
const customConstants = require('../../config/constants.json')
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const walletTransactionsModel = require('../../models/walletTransactionsModel');
const usersModel = require('../../models/usersModel');

exports.createPayment = asyncWrapper(async (req, res) => {
  const { amount, currency, customerEmail } = req.body;

  // Create a Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: currency || 'usd',
          product_data: {
            name: 'Payment',
          },
          unit_amount: amount * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'https://tutorbay.netlify.app/payments/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://tutorbay.netlify.app/paymentscancel',
    customer_email: customerEmail,
    metadata: { customerEmail }
  });
  // Optionally store initial transaction (uncomment if needed)
  /*
  await walletTransactionsModel.create({
    stripeId: session.id, // Use Checkout Session ID
    amount: amount,
    currency: currency || 'usd',
    status: 'pending', // Initial status for Checkout
    customerEmail
  });
  */

  // Return the payment gateway URL
  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    // message: customConstants.messages.MESSAGE_PAYMENT_SUCCESS,
    data: {
      successUrl: session.url,
      cancelUrl: session.cancel_url,
      // sessionId:session.id
    }
  });
});

exports.successThePayment = asyncWrapper(async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['subscription', 'subscription.plan.product'] })
  // console.log("session:===", session)
  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    // message: customConstants.messages.MESSAGE_PAYMENT_SUCCESS,
    data: session
  });
})

exports.paymentWebhook = asyncWrapper(async (req, res) => {
  const { sessionId } = req.body
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription', 'subscription.plan.product'] })
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
  let tranasactionId = `TXN-${year}${month}${random}`;
  /*
  const sig = req.headers['stripe-signature'];
  let event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
  );
  */
  let transactionDetails
  // Handle the event
  if (session?.payment_status === "paid") {
    let userDetails = await usersModel.findById(req.user._id)
    // const paymentIntent = event.data.object;
    transactionDetails = await walletTransactionsModel.create(
      {
        userId: req.user._id || userDetails._id,
        tranasactionId: tranasactionId,
        paymentId: session?.payment_intent,
        transactionType: 'credit',
        walletCredits: session?.amount_total,
        userType: userDetails.userType,
        paymentStatus: 'success'
      }
    );
    console.log('PaymentIntent was successful!');

  }
  else {
    transactionDetails = await walletTransactionsModel.create(
      {
        userId: req.user._id || userDetails._id,
        tranasactionId: tranasactionId,
        transactionType: 'credit',
        walletCredits: 0,
        userType: userDetails.userType,
        paymentStatus: 'fail'
      }
    );
    console.log('PaymentIntent failed!');
  }

  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    message: customConstants.messages.MESSAGE_PAYMENT_SUCCESS,
    data: transactionDetails
  });
})