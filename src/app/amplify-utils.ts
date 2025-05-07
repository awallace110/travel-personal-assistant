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
  const config: AwsRumConfig = {
    sessionSampleRate: 1 ,
    endpoint: "https://dataplane.rum.us-east-1.amazonaws.com" ,
    telemetries: ["performance","errors","http"] ,
    allowCookies: true ,
    enableXRay: false ,
    signing: true // If you have a public resource policy and wish to send unsigned requests please set this to false
  };

  const APPLICATION_ID: string = 'e303242b-0c0c-45c3-9e45-f97e4300b45b';
  const APPLICATION_VERSION: string = '1.0.0';
  const APPLICATION_REGION: string = 'us-east-1';

  const awsRum: AwsRum = new AwsRum(
    APPLICATION_ID,
    APPLICATION_VERSION,
    APPLICATION_REGION,
    config
  );
} catch (error) {
  // Ignore errors thrown during CloudWatch RUM web client initialization
}
