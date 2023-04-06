import express, { Request, Response, NextFunction } from 'express';
import qs from 'qs';
import axios from 'axios';
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import path from 'path';
import fs from 'fs';

const app = express();
const port: string = '4001';
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
/*
// app.get('/welcome', (req: Request, res: Response, next: NextFunction) => {
//   res.send('welcome!');
// });
// app.use('/auth', (req: Request, res: Response, next: NextFunction) => {
//   const queryStr = qs.stringify({
//     client_id: process.env.GOOGLECALENDAR_CLIENT_ID,
//     redirect_uri: 'http://localhost:3000',
//     response_type: 'token',
//     scope: 'https://www.googleapis.com/auth/calendar',
//   });
//   const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryStr}`;
//   // res.redirect(loginUrl);
//   axios.get(loginUrl).then((authRes) => {
//     console.log(authRes.config.url);

//     // res.send(authRes.config.url);
//     res.redirect(authRes.config.url as string);
//   });
//   // next();
// });
*/
/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFileSync(TOKEN_PATH);
    console.log(content);
    // const credentials = JSON.parse(content);
    // return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  // if (client) {
  //   return client;
  // }
  // client = await authenticate({
  //   scopes: SCOPES,
  //   keyfilePath: CREDENTIALS_PATH,
  // });
  // if (client.credentials) {
  //   await saveCredentials(client);
  // }
  return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
// async function listEvents(auth) {
//   const calendar = google.calendar({ version: 'v3', auth });
//   const res = await calendar.events.list({
//     calendarId: 'primary',
//     timeMin: new Date().toISOString(),
//     maxResults: 10,
//     singleEvents: true,
//     orderBy: 'startTime',
//   });
//   const events = res.data.items;
//   if (!events || events.length === 0) {
//     console.log('No upcoming events found.');
//     return;
//   }
//   console.log('Upcoming 10 events:');
//   events.map((event, i) => {
//     const start = event.start.dateTime || event.start.date;
//     console.log(`${start} - ${event.summary}`);
//   });
// }

// authorize().then(listEvents).catch(console.error);
app.get('/auth', (req: Request, res: Response, next: NextFunction) => {
  console.log('FUCK');
  // authorize();
});

app.listen(port, () => {
  console.log(`
  #######################################
  ✔ Server listening on port: ${port}
  #######################################
  `);
});
