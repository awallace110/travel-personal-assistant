import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import { configureAutoTrack } from 'aws-amplify/analytics';
import { identifyUser } from 'aws-amplify/analytics';
import { getCurrentUser } from 'aws-amplify/auth';
import { AwsRum } from 'aws-rum-web';

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

try {
  const config = {
    sessionSampleRate: 1,
    identityPoolId: "us-east-1:243843b4-2c3c-4ba7-80e5-29fe0bb4a97a",
    endpoint: "https://dataplane.rum.us-east-1.amazonaws.com",
    telemetries: ["performance","errors","http"],
    allowCookies: true,
    enableXRay: true
  };

  const APPLICATION_ID = '96abfaba-1258-42de-9761-d99a8f5aed1f';
  const APPLICATION_VERSION = '1.0.0';
  const APPLICATION_REGION = 'us-east-1';

  const awsRum = new AwsRum(
    APPLICATION_ID,
    APPLICATION_VERSION,
    APPLICATION_REGION,
    config
  );
} catch (error) {
  // Ignore errors thrown during CloudWatch RUM web client initialization
}
