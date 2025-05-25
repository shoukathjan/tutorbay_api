const asyncWrapper = require('../../middleware/asyncWrapper')

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


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
      success_url: 'http://localhost:5000/api/payments/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5000/api/paymentscancel',
      customer_email: customerEmail,
      metadata: { customerEmail }
    });
  
    // Optionally store initial transaction (uncomment if needed)
    /*
    await Transaction.create({
      stripeId: session.id, // Use Checkout Session ID
      amount: amount,
      currency: currency || 'usd',
      status: 'pending', // Initial status for Checkout
      customerEmail
    });
    */
  
    // Return the payment gateway URL
    return res.json({
      paymentUrl: session.url
    });
  });

exports.successThePayment = asyncWrapper(async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['subscription', 'subscription.plan.product'] })
    console.log("session:===",session)
    res.send('Subscribed successfully')
})

exports.paymentWebhook = asyncWrapper(async (req, res) => {
    const {event, type} = req.body
    console.log('event:===',event)
    /*
    const sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
    );
    */

    // Handle the event
    switch (type) {
        case 'payment_intent.succeeded':
            // const paymentIntent = event.data.object;
            // await Transaction.findOneAndUpdate(
            //     { stripeId: paymentIntent.id },
            //     {
            //         status: 'succeeded',
            //         customerEmail: paymentIntent.metadata.customerEmail
            //     }
            // );
            console.log('PaymentIntent was successful!');
            break;
        // case 'payment_intent.payment_failed':
        //     const failedPayment = event.data.object;
        //     await Transaction.findOneAndUpdate(
        //         { stripeId: failedPayment.id },
        //         {
        //             status: 'failed',
        //             customerEmail: failedPayment.metadata.customerEmail
        //         }
        //     );
            console.log('PaymentIntent failed!');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return res.json({ received: 'true' });
})


exports.validateUser = asyncWrapper(async (req, res,next) => {
  const {userId:_id}  = req.user;

  const user = await usersModel.findById(userId);
  if (!user) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_USER_NOT_FOUND,
    });
  }

  if(user.status != 'active'){
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
        status: customConstants.messages.MESSAGE_FAIL,
        message: customConstants.messages.MESSAGE_USER_STATUS_IS_NOT_ACTIVE
    })

  }
  next()
});
