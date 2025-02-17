import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import { configureAutoTrack } from 'aws-amplify/analytics';
import { identifyUser } from 'aws-amplify/analytics';
import { getCurrentUser } from 'aws-amplify/auth';

Amplify.configure(outputs);

export const amplifyClient = generateClient<Schema>();

configureAutoTrack({
  // REQUIRED, turn on/off the auto tracking
  enable: true,
  // REQUIRED, the event type, it's one of 'event', 'pageView' or 'session'
  type: 'session',
  // OPTIONAL, additional options for the tracked event.
  options: {
    // OPTIONAL, the attributes of the event
    attributes: {
      customizableField: 'attr'
    }
  }
});

const location = {
  latitude: 47.606209,
  longitude: -122.332069,
  postalCode: '98122',
  city: 'Seattle',
  region: 'WA',
  country: 'USA'
};

const customProperties = {
  plan: ['plan'],
  phoneNumber: ['+11234567890'],
  age: ['25']
};

const userProfile = {
  location,
  name: 'username',
  email: 'name@example.com',
  customProperties
};

async function sendUserData() {
  const user = await getCurrentUser();

  identifyUser({
    userId: user.userId,
    userProfile
  });
}
