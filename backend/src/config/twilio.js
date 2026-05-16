import twilio from "twilio";
import { env } from "./env.js";

export const twilioClient =
  env.twilioSid && env.twilioAuthToken
    ? twilio(env.twilioSid, env.twilioAuthToken)
    : null;
