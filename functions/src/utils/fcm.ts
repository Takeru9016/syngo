import * as admin from "firebase-admin";

/**
 * Send FCM message to multiple tokens
 */
export async function sendMulticastMessage(
  tokens: string[],
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>
): Promise<admin.messaging.BatchResponse> {
  const message: admin.messaging.MulticastMessage = {
    notification,
    data: data || {},
    tokens,
  };

  return admin.messaging().sendEachForMulticast(message);
}

/**
 * Send FCM message to a single token
 */
export async function sendToToken(
  token: string,
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>
): Promise<string> {
  const message: admin.messaging.Message = {
    notification,
    data: data || {},
    token,
  };

  return admin.messaging().send(message);
}

/**
 * Subscribe tokens to a topic
 */
export async function subscribeToTopic(
  tokens: string[],
  topic: string
): Promise<admin.messaging.MessagingTopicManagementResponse> {
  return admin.messaging().subscribeToTopic(tokens, topic);
}

/**
 * Unsubscribe tokens from a topic
 */
export async function unsubscribeFromTopic(
  tokens: string[],
  topic: string
): Promise<admin.messaging.MessagingTopicManagementResponse> {
  return admin.messaging().unsubscribeFromTopic(tokens, topic);
}
