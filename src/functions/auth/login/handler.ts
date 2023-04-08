import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import UserService from 'src/services/userService';
import schema from './schema';
import { OAuth2Client } from 'google-auth-library';
import { formatErrorResponse } from '@libs/api-gateway';
import signDalsamoJwt from '@libs/sign-dalsamo-jwt';

const client = new DynamoDBClient({ region: 'ap-northeast-2' });
const googleClient = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);

const loginHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { credential } = event.body;

  console.log(credential);

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
    });

    console.log(ticket);

    const { email } = ticket.getPayload();

    console.log(email);

    const userService = new UserService(client);
    const user = await userService.findOneByEmail(email);

    console.log(user);

    if (!user) {
      return formatErrorResponse(401, {
        message: 'user login failed',
        success: false,
      });
    }

    const token = await signDalsamoJwt(user);

    return formatJSONResponse(
      { message: `user login`, user, success: true },
      {
        'Set-Cookie': `auth-token=${token}; Domain=${process.env.DALSAMO_WEB_DOMAIN}; HttpOnly; Expires=Fri, 31 Dec 9999 23:59:59 GMT`,
      }
    );
  } catch (error) {
    console.log(error);
    return formatErrorResponse(500, {
      message: 'user login failed',
      success: false,
    });
  }
};

/*
  Google token payload example
  {
    "iss": "https://accounts.google.com", // The JWT's issuer
    "nbf":  161803398874,
    "aud": "314159265-pi.apps.googleusercontent.com", // Your server's client ID
    "sub": "3141592653589793238", // The unique ID of the user's Google Account
    "hd": "gmail.com", // If present, the host domain of the user's GSuite email address
    "email": "elisa.g.beckett@gmail.com", // The user's email address
    "email_verified": true, // true, if Google has verified the email address
    "azp": "314159265-pi.apps.googleusercontent.com",
    "name": "Elisa Beckett",
                              // If present, a URL to user's profile picture
    "picture": "https://lh3.googleusercontent.com/a-/e2718281828459045235360uler",
    "given_name": "Elisa",
    "family_name": "Beckett",
    "iat": 1596474000, // Unix timestamp of the assertion's creation time
    "exp": 1596477600, // Unix timestamp of the assertion's expiration time
    "jti": "abc161803398874def"
  }
*/

export const main = middyfy(loginHandler);
