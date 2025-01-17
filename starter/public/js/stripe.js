/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51HToYNLPmc91JdmbrFhU2SlU1Sv0A3GBpaokANqzWE0Cu4WOrfnXqROuTcZAMzV9GxxIXjiEbcXPl0RBxPpLSaux00Vday2TKV'
  );
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log('sessionsessionsessionsession');
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
