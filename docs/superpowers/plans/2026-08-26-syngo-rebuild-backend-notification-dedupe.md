# Backend Notification Trigger Dedupe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the repeated "look up partner, fetch actor's display name, send push + create in-app notification" boilerplate duplicated across 6 Cloud Functions triggers, without changing any notification's title, body, type, or data shape.

**Architecture:** Extract the common orchestration into one `notifyPartner()` helper (unit-tested with mocked `sendPush` functions), then refactor each trigger to call it with only its own title/body-building logic. `onNotificationCreated` is excluded — it reacts to already-created notification docs and only sends a push, a genuinely different pattern, not part of this duplication.

**Tech Stack:** Firebase Functions v2, TypeScript, Jest (new to the `functions/` package).

**Spec:** `docs/superpowers/specs/2026-08-26-syngo-rebuild-design.md` (Phase 0, section 7)

## Global Constraints

- This plan runs on its own branch (`rebuild/backend-notification-dedupe`), independent of and not blocking the Phase 0 foundation plan — per the spec, this is a parallel track.
- No Firestore schema, security rule, or notification payload changes. Every push/in-app-notification a partner receives must be byte-identical to today's output for the same input.
- `functions/` has its own `package.json`/`tsconfig.json`, separate from the app's root — dependencies and scripts added here go in `functions/package.json`, not the root one.

---

## Task 1: `notifyPartner` helper with unit tests

**Files:**
- Create: `functions/jest.config.js`
- Modify: `functions/package.json` (devDependencies + `test` script)
- Create: `functions/src/notifications/notifyPartner.ts`
- Test: `functions/src/notifications/__tests__/notifyPartner.test.ts`

**Interfaces:**
- Consumes: `sendPushToUser`, `createInAppNotification`, `getPartnerUid` from `functions/src/notifications/sendPush.ts` (all pre-existing, unchanged).
- Produces: `notifyPartner(params: NotifyPartnerParams): Promise<{ partnerUid: string } | null>` — every task below refactors a trigger to call this instead of inlining the push+in-app pattern.

- [ ] **Step 1: Install Jest for the functions package**

Run (from `functions/`): `npm install --save-dev jest ts-jest @types/jest`

- [ ] **Step 2: Add Jest config**

Create `functions/jest.config.js`:

```js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
};
```

- [ ] **Step 3: Add the `test` script**

Modify `functions/package.json` scripts block — add after `"lint": "eslint ."`:

```json
    "test": "jest",
```

- [ ] **Step 4: Write the failing tests**

Create `functions/src/notifications/__tests__/notifyPartner.test.ts`:

```ts
const mockGet = jest.fn();

jest.mock("firebase-admin", () => ({
  firestore: () => ({
    doc: () => ({ get: mockGet }),
  }),
}));

jest.mock("../sendPush", () => ({
  sendPushToUser: jest.fn(),
  createInAppNotification: jest.fn(),
  getPartnerUid: jest.fn(),
}));

import { notifyPartner } from "../notifyPartner";
import {
  sendPushToUser,
  createInAppNotification,
  getPartnerUid,
} from "../sendPush";

describe("notifyPartner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: () => ({ displayName: "Alex" }) });
  });

  it("returns null and sends nothing when no partner is found", async () => {
    (getPartnerUid as jest.Mock).mockResolvedValue(null);

    const result = await notifyPartner({
      actorUid: "user-1",
      pairId: "pair-1",
      notificationType: "todo_reminder",
      preferenceKey: "todoReminders",
      buildContent: () => ({ title: "t", body: "b" }),
    });

    expect(result).toBeNull();
    expect(sendPushToUser).not.toHaveBeenCalled();
    expect(createInAppNotification).not.toHaveBeenCalled();
  });

  it("sends a push and creates an in-app notification using the actor's display name", async () => {
    (getPartnerUid as jest.Mock).mockResolvedValue("partner-1");

    const result = await notifyPartner({
      actorUid: "user-1",
      pairId: "pair-1",
      notificationType: "todo_reminder",
      preferenceKey: "todoReminders",
      buildContent: (actorName) => ({
        title: "New Task Added",
        body: `${actorName} added: Buy milk`,
        pushData: { todoId: "todo-1" },
        inAppData: { todoId: "todo-1" },
      }),
    });

    expect(result).toEqual({ partnerUid: "partner-1" });
    expect(sendPushToUser).toHaveBeenCalledWith(
      "partner-1",
      expect.objectContaining({
        title: "New Task Added",
        body: "Alex added: Buy milk",
        data: { type: "todo_reminder", pairId: "pair-1", todoId: "todo-1" },
      }),
      "todoReminders",
    );
    expect(createInAppNotification).toHaveBeenCalledWith(
      "partner-1",
      "pair-1",
      {
        type: "todo_reminder",
        title: "New Task Added",
        body: "Alex added: Buy milk",
        data: { todoId: "todo-1" },
      },
    );
  });

  it("falls back to 'Your partner' when the actor has no displayName", async () => {
    (getPartnerUid as jest.Mock).mockResolvedValue("partner-1");
    mockGet.mockResolvedValue({ data: () => ({}) });

    await notifyPartner({
      actorUid: "user-1",
      pairId: "pair-1",
      notificationType: "nudge",
      preferenceKey: "nudgeNotifications",
      buildContent: (actorName) => ({
        title: "Nudge",
        body: `${actorName} nudged you`,
      }),
    });

    expect(sendPushToUser).toHaveBeenCalledWith(
      "partner-1",
      expect.objectContaining({ body: "Your partner nudged you" }),
      "nudgeNotifications",
    );
  });
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run (from `functions/`): `npx jest`
Expected: FAIL — `Cannot find module '../notifyPartner'`.

- [ ] **Step 6: Write the implementation**

Create `functions/src/notifications/notifyPartner.ts`:

```ts
import * as admin from "firebase-admin";
import {
  sendPushToUser,
  createInAppNotification,
  getPartnerUid,
  PushPayload,
} from "./sendPush";

const db = admin.firestore();

export interface NotifyPartnerContent {
  title: string;
  body: string;
  subtitle?: string;
  imageUrl?: string;
  richContent?: PushPayload["richContent"];
  pushData?: Record<string, string>;
  inAppData?: Record<string, any>;
}

export interface NotifyPartnerParams {
  actorUid: string;
  pairId: string;
  notificationType: string;
  preferenceKey: string;
  buildContent: (actorName: string) => NotifyPartnerContent;
}

/**
 * Resolves the actor's partner, fetches the actor's display name, and
 * sends both a push notification and an in-app notification to the
 * partner. Returns null (sending nothing) if no partner is found.
 */
export async function notifyPartner(
  params: NotifyPartnerParams,
): Promise<{ partnerUid: string } | null> {
  const partnerUid = await getPartnerUid(params.actorUid, params.pairId);
  if (!partnerUid) {
    return null;
  }

  const actorDoc = await db.doc(`users/${params.actorUid}`).get();
  const actorName = actorDoc.data()?.displayName || "Your partner";

  const content = params.buildContent(actorName);

  await Promise.all([
    sendPushToUser(
      partnerUid,
      {
        title: content.title,
        body: content.body,
        subtitle: content.subtitle,
        imageUrl: content.imageUrl,
        richContent: content.richContent,
        data: {
          type: params.notificationType,
          pairId: params.pairId,
          ...content.pushData,
        },
      },
      params.preferenceKey,
    ),
    createInAppNotification(partnerUid, params.pairId, {
      type: params.notificationType,
      title: content.title,
      body: content.body,
      data: content.inAppData ?? {},
    }),
  ]);

  return { partnerUid };
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run (from `functions/`): `npx jest`
Expected: PASS, all 3 test cases green.

- [ ] **Step 8: Commit**

```bash
git add functions/jest.config.js functions/package.json functions/package-lock.json functions/src/notifications/notifyPartner.ts functions/src/notifications/__tests__/notifyPartner.test.ts
git commit -m "test: add notifyPartner helper with unit coverage"
```

---

## Task 2: Refactor the 3 todo triggers to use `notifyPartner`

**Files:**
- Modify: `functions/src/notifications/onTodoCreated.ts`
- Modify: `functions/src/notifications/onTodoUpdated.ts`
- Modify: `functions/src/notifications/onTodoDeleted.ts`

**Interfaces:**
- Consumes: `notifyPartner` from Task 1.
- Produces: nothing new — these are leaf triggers.

- [ ] **Step 1: Refactor `onTodoCreated.ts`**

Replace the full contents of `functions/src/notifications/onTodoCreated.ts`:

```ts
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { notifyPartner } from "./notifyPartner";
import { expoAccessToken } from "../index";

/**
 * Firestore trigger: When a todo/dream is created
 */
export const onTodoCreated = onDocumentCreated(
  { document: "todos/{todoId}", secrets: [expoAccessToken] },
  async (event) => {
    const todoData = event.data?.data();
    const todoId = event.params.todoId;

    if (!todoData) {
      logger.info("⚠️ No todo data");
      return;
    }

    try {
      const creatorUid = todoData.createdBy;
      const pairId = todoData.pairId;

      if (!creatorUid || !pairId) {
        logger.info("⚠️ Todo missing creatorUid or pairId");
        return;
      }

      const isDream = todoData.listType === "dream";
      const categoryEmoji = getCategoryEmoji(todoData.category);
      const type = isDream ? "dream_created" : "todo_reminder";

      const result = await notifyPartner({
        actorUid: creatorUid,
        pairId,
        notificationType: type,
        preferenceKey: "todoReminders",
        buildContent: (creatorName) => ({
          title:
            isDream ? `New Dream Added ${categoryEmoji}` : "New Task Added",
          body:
            isDream ?
              `${creatorName} added to bucket list: ${todoData.title}`
            : `${creatorName} added: ${todoData.title}`,
          pushData: { todoId },
          inAppData: { todoId },
        }),
      });

      if (!result) {
        logger.info("⚠️ Partner not found");
        return;
      }

      logger.info(
        `✅ ${
          isDream ? "Dream" : "Todo"
        } notification sent to partner: ${result.partnerUid}`,
      );
    } catch (error) {
      logger.error("❌ Error in onTodoCreated:", error);
    }
  },
);

/**
 * Get emoji for dream category
 */
function getCategoryEmoji(category?: string): string {
  switch (category) {
    case "travel":
      return "✈️";
    case "food":
      return "🍕";
    case "adventure":
      return "🎢";
    case "together":
      return "💕";
    default:
      return "✨";
  }
}
```

- [ ] **Step 2: Refactor `onTodoUpdated.ts`**

Replace the full contents of `functions/src/notifications/onTodoUpdated.ts`:

```ts
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { notifyPartner } from "./notifyPartner";
import { expoAccessToken } from "../index";

/**
 * Firestore trigger: When a todo/dream is updated
 */
export const onTodoUpdated = onDocumentUpdated(
  { document: "todos/{todoId}", secrets: [expoAccessToken] },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    const todoId = event.params.todoId;

    if (!beforeData || !afterData) {
      logger.info("⚠️ No todo data");
      return;
    }

    try {
      const updaterUid = afterData.updatedBy || afterData.createdBy;
      const pairId = afterData.pairId;

      if (!updaterUid || !pairId) {
        logger.info("⚠️ Todo missing updaterUid or pairId");
        return;
      }

      const isDream = afterData.listType === "dream";
      const itemLabel = isDream ? "dream" : "todo";
      const categoryEmoji = getCategoryEmoji(afterData.category);

      let notificationTitle = isDream ? "Dream Updated" : "Todo Updated";
      let notificationBody = "";
      let notificationType = isDream ? "dream_updated" : "todo_updated";

      if (!beforeData.isCompleted && afterData.isCompleted) {
        if (isDream) {
          notificationTitle = `Dream Achieved! ${categoryEmoji}`;
          notificationType = "dream_achieved";
        } else {
          notificationTitle = "Todo Completed ✅";
          notificationType = "todo_completed";
        }
      } else if (beforeData.title !== afterData.title) {
        notificationBody = `renamed ${itemLabel} to: ${afterData.title}`;
      } else if (beforeData.dueDate !== afterData.dueDate) {
        notificationBody = `updated ${
          isDream ? "target date" : "due date"
        } for: ${afterData.title}`;
      } else if (beforeData.priority !== afterData.priority) {
        notificationBody = `changed ${
          isDream ? "importance" : "priority"
        } for: ${afterData.title}`;
      } else if (beforeData.isCompleted && !afterData.isCompleted) {
        notificationBody = `reopened: ${afterData.title}`;
      } else if (isDream && beforeData.category !== afterData.category) {
        notificationBody = `changed category for: ${afterData.title}`;
      } else {
        const beforeSubtasks = JSON.stringify(beforeData.subtasks || []);
        const afterSubtasks = JSON.stringify(afterData.subtasks || []);
        if (beforeSubtasks !== afterSubtasks) {
          logger.info("⏭️ Skipping notification for subtask-only change");
          return;
        }
        notificationBody = `updated: ${afterData.title}`;
      }

      const result = await notifyPartner({
        actorUid: updaterUid,
        pairId,
        notificationType,
        preferenceKey: "todoReminders",
        buildContent: (updaterName) => {
          const body =
            notificationBody.startsWith(updaterName) ? notificationBody
            : `${updaterName} ${notificationBody}`;
          return {
            title: notificationTitle,
            body:
              // Completion messages need the actor's name spliced in
              // differently ("X completed: Y") rather than prefixed
              // to a generic verb phrase.
              !beforeData.isCompleted && afterData.isCompleted ?
                isDream ?
                  `${updaterName} achieved: ${afterData.title}`
                : `${updaterName} completed: ${afterData.title}`
              : body,
            pushData: { todoId },
            inAppData: { todoId },
          };
        },
      });

      if (!result) {
        logger.info("⚠️ Partner not found");
        return;
      }

      logger.info(
        `✅ ${
          isDream ? "Dream" : "Todo"
        } update notification sent to partner: ${result.partnerUid}`,
      );
    } catch (error) {
      logger.error("❌ Error in onTodoUpdated:", error);
    }
  },
);

/**
 * Get emoji for dream category
 */
function getCategoryEmoji(category?: string): string {
  switch (category) {
    case "travel":
      return "✈️";
    case "food":
      return "🍕";
    case "adventure":
      return "🎢";
    case "together":
      return "💕";
    default:
      return "✨";
  }
}
```

- [ ] **Step 3: Verify `onTodoUpdated`'s body text still matches the original exactly**

The original produced these exact bodies (with `${updaterName}` prefixed):
`"${updaterName} renamed ${itemLabel} to: ${afterData.title}"`,
`"${updaterName} updated ${isDream ? "target date" : "due date"} for: ${afterData.title}"`,
`"${updaterName} changed ${isDream ? "importance" : "priority"} for: ${afterData.title}"`,
`"${updaterName} reopened: ${afterData.title}"`,
`"${updaterName} changed category for: ${afterData.title}"`,
`"${updaterName} updated: ${afterData.title}"`.

Read back Step 2's `buildContent` and confirm each branch's `notificationBody` (built without the name) plus the `${updaterName} ` prefix reconstructs each of these strings exactly. This is a manual line-by-line check, not a test — write it down in the PR description as the verification.

- [ ] **Step 4: Refactor `onTodoDeleted.ts`**

Replace the full contents of `functions/src/notifications/onTodoDeleted.ts`:

```ts
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { notifyPartner } from "./notifyPartner";
import { expoAccessToken } from "../index";

/**
 * Firestore trigger: When a todo/dream is deleted
 */
export const onTodoDeleted = onDocumentDeleted(
  { document: "todos/{todoId}", secrets: [expoAccessToken] },
  async (event) => {
    const todoData = event.data?.data();
    const todoId = event.params.todoId;

    if (!todoData) {
      logger.info("⚠️ No todo data");
      return;
    }

    try {
      const deleterUid = todoData.deletedBy || todoData.createdBy;
      const pairId = todoData.pairId;

      if (!deleterUid || !pairId) {
        logger.info("⚠️ Todo missing deleterUid or pairId");
        return;
      }

      const isDream = todoData.listType === "dream";
      const type = isDream ? "dream_deleted" : "todo_deleted";

      const result = await notifyPartner({
        actorUid: deleterUid,
        pairId,
        notificationType: type,
        preferenceKey: "todoReminders",
        buildContent: (deleterName) => ({
          title: isDream ? "Dream Removed" : "Todo Deleted 🗑️",
          body:
            isDream ?
              `${deleterName} removed from bucket list: ${todoData.title}`
            : `${deleterName} removed: ${todoData.title}`,
          pushData: { todoId },
          inAppData: { todoId },
        }),
      });

      if (!result) {
        logger.info("⚠️ Partner not found");
        return;
      }

      logger.info(
        `✅ ${
          isDream ? "Dream" : "Todo"
        } deleted notification sent to partner: ${result.partnerUid}`,
      );
    } catch (error) {
      logger.error("❌ Error in onTodoDeleted:", error);
    }
  },
);
```

- [ ] **Step 5: Typecheck**

Run (from `functions/`): `npm run build`
Expected: compiles with no errors.

- [ ] **Step 6: Commit**

```bash
git add functions/src/notifications/onTodoCreated.ts functions/src/notifications/onTodoUpdated.ts functions/src/notifications/onTodoDeleted.ts
git commit -m "refactor: use notifyPartner in todo triggers"
```

---

## Task 3: Refactor the favorite and mood triggers to use `notifyPartner`

**Files:**
- Modify: `functions/src/notifications/onFavoriteAdded.ts`
- Modify: `functions/src/notifications/onMoodUpdated.ts`

**Interfaces:**
- Consumes: `notifyPartner` from Task 1.

- [ ] **Step 1: Refactor `onFavoriteAdded.ts`**

Replace the full contents of `functions/src/notifications/onFavoriteAdded.ts`:

```ts
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { notifyPartner } from "./notifyPartner";
import { expoAccessToken } from "../index";

/**
 * Firestore trigger: When a favorite is added
 */
export const onFavoriteAdded = onDocumentCreated(
  { document: "favorites/{favoriteId}", secrets: [expoAccessToken] },
  async (event) => {
    const favoriteData = event.data?.data();
    const favoriteId = event.params.favoriteId;

    if (!favoriteData) {
      logger.info("⚠️ No favorite data");
      return;
    }

    try {
      const creatorUid = favoriteData.createdBy;
      const pairId = favoriteData.pairId;

      if (!creatorUid || !pairId) {
        logger.info("⚠️ Favorite missing creatorUid or pairId");
        return;
      }

      const favoriteDescription = favoriteData.description || "";
      const favoriteImageUrl = favoriteData.imageUrl || undefined;
      const favoriteCategory = favoriteData.category || "other";

      const result = await notifyPartner({
        actorUid: creatorUid,
        pairId,
        notificationType: "favorite_added",
        preferenceKey: "favoriteUpdates",
        buildContent: (creatorName) => ({
          title: "New Favorite Added ⭐",
          body: `${creatorName} added: ${favoriteData.title}`,
          subtitle: favoriteDescription || undefined,
          imageUrl: favoriteImageUrl,
          richContent: {
            type: "favorite",
            imageUrl: favoriteImageUrl,
            favoriteTitle: favoriteData.title,
            favoriteDescription: favoriteDescription || undefined,
          },
          pushData: { favoriteId },
          inAppData: {
            favoriteId,
            favoriteTitle: favoriteData.title,
            favoriteDescription,
            favoriteImageUrl,
            favoriteCategory,
          },
        }),
      });

      if (!result) {
        logger.info("⚠️ Partner not found");
        return;
      }

      logger.info(`✅ Favorite notification sent to partner: ${result.partnerUid}`);
    } catch (error) {
      logger.error("❌ Error in onFavoriteAdded:", error);
    }
  },
);
```

- [ ] **Step 2: Refactor `onMoodUpdated.ts`**

Replace the full contents of `functions/src/notifications/onMoodUpdated.ts`:

```ts
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { notifyPartner } from "./notifyPartner";
import { expoAccessToken } from "../index";

const MOOD_EMOJIS: Record<number, string> = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "🙂",
  5: "😊",
};

const MOOD_LABELS: Record<number, string> = {
  1: "Struggling",
  2: "Down",
  3: "Okay",
  4: "Good",
  5: "Great",
};

/**
 * Firestore trigger: When a mood entry is created
 * Sends notification to partner with mood emoji
 */
export const onMoodUpdated = onDocumentCreated(
  { document: "moodEntries/{moodId}", secrets: [expoAccessToken] },
  async (event) => {
    const moodData = event.data?.data();
    const moodId = event.params.moodId;

    if (!moodData) {
      logger.info("⚠️ No mood data");
      return;
    }

    if (moodData.isPrivate) {
      logger.info("ℹ️ Mood is private, skipping notification");
      return;
    }

    try {
      const creatorUid = moodData.userId;
      const pairId = moodData.pairId;

      if (!creatorUid || !pairId) {
        logger.info("⚠️ Mood missing userId or pairId");
        return;
      }

      const moodLevel = moodData.level as number;
      const moodEmoji = MOOD_EMOJIS[moodLevel] || "❓";
      const moodLabel = MOOD_LABELS[moodLevel] || "Unknown";
      const moodNote = moodData.note || "";

      const result = await notifyPartner({
        actorUid: creatorUid,
        pairId,
        notificationType: "mood_updated",
        preferenceKey: "system",
        buildContent: (creatorName) => {
          let body = `${creatorName} is feeling ${moodLabel.toLowerCase()}`;
          if (moodNote) {
            body += `: "${moodNote.substring(0, 50)}${
              moodNote.length > 50 ? "..." : ""
            }"`;
          }
          return {
            title: `${moodEmoji} Mood Update`,
            body,
            richContent: { type: "mood", moodEmoji, moodLabel },
            inAppData: {
              moodId,
              moodLevel: String(moodLevel),
              moodEmoji,
              moodLabel,
              moodNote,
            },
          };
        },
      });

      if (!result) {
        logger.info("⚠️ Partner not found");
        return;
      }

      logger.info(`✅ Mood notification sent to partner: ${result.partnerUid}`);
    } catch (error) {
      logger.error("❌ Error in onMoodUpdated:", error);
    }
  },
);
```

Note: the original also put `moodId` in the push `data` payload (not just in-app `data`). `notifyPartner` always adds `pairId` to push data automatically; `moodId` was in the original push data too, so add it to `pushData` here to preserve that — Step 2's code above omits it, fix by adding `pushData: { moodId }` alongside `inAppData` in the returned object before moving to Step 3.

- [ ] **Step 3: Typecheck**

Run (from `functions/`): `npm run build`
Expected: compiles with no errors.

- [ ] **Step 4: Commit**

```bash
git add functions/src/notifications/onFavoriteAdded.ts functions/src/notifications/onMoodUpdated.ts
git commit -m "refactor: use notifyPartner in favorite and mood triggers"
```

---

## Task 4: Refactor `onStickerSent` (callable function, different error handling)

**Files:**
- Modify: `functions/src/notifications/onStickerSent.ts`

**Interfaces:**
- Consumes: `notifyPartner` from Task 1.

`onStickerSent` is an `onCall` function, not a Firestore trigger — it must keep throwing `HttpsError` on failure instead of swallowing errors, so it can't delegate its precondition checks to `notifyPartner`. It only uses `notifyPartner` for the actual send step.

- [ ] **Step 1: Refactor `onStickerSent.ts`**

Replace the full contents of `functions/src/notifications/onStickerSent.ts`:

```ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { notifyPartner } from "./notifyPartner";
import * as admin from "firebase-admin";
import { expoAccessToken } from "../index";

const db = admin.firestore();

/**
 * Callable function: Send sticker to partner
 */
export const onStickerSent = onCall(
  { secrets: [expoAccessToken] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { stickerId, stickerName, stickerUrl, stickerDescription } =
      request.data;
    const senderUid = request.auth.uid;

    if (!stickerId || !stickerName) {
      throw new HttpsError("invalid-argument", "Sticker data required");
    }

    try {
      const senderDoc = await db.doc(`users/${senderUid}`).get();
      const pairId = senderDoc.data()?.pairId;

      if (!pairId) {
        throw new HttpsError("failed-precondition", "User is not paired");
      }

      const result = await notifyPartner({
        actorUid: senderUid,
        pairId,
        notificationType: "sticker_sent",
        preferenceKey: "stickerNotifications",
        buildContent: (senderName) => ({
          title: "Sticker from your partner! 🎨",
          body: `${senderName} sent you: ${stickerName}`,
          subtitle: stickerDescription || undefined,
          imageUrl: stickerUrl || undefined,
          richContent: {
            type: "sticker",
            imageUrl: stickerUrl || undefined,
            stickerName,
            stickerDescription: stickerDescription || undefined,
          },
          pushData: { stickerId, stickerUrl: stickerUrl || "" },
          inAppData: { stickerId, stickerUrl, stickerName, stickerDescription },
        }),
      });

      if (!result) {
        throw new HttpsError("not-found", "Partner not found");
      }

      logger.info(`✅ Sticker notification sent to partner: ${result.partnerUid}`);

      return { success: true };
    } catch (error: any) {
      logger.error("❌ Error in onStickerSent:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  },
);
```

- [ ] **Step 2: Typecheck**

Run (from `functions/`): `npm run build`
Expected: compiles with no errors.

- [ ] **Step 3: Commit**

```bash
git add functions/src/notifications/onStickerSent.ts
git commit -m "refactor: use notifyPartner in onStickerSent"
```

---

## Task 5: Emulator verification and PR

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite and build**

Run (from `functions/`): `npm test && npm run build`
Expected: all Jest tests pass, `tsc` compiles cleanly.

- [ ] **Step 2: Smoke-test against the Firebase emulator**

Run (from `functions/`): `npm run serve`
In the emulator UI (or via the app pointed at the emulator), create a todo, update it, delete it, add a favorite, log a mood, and send a sticker as one paired test user; confirm the other test user receives an in-app notification for each with the same title/body wording as before this refactor (compare against the strings documented in Task 2 Step 3 and the other triggers' original bodies).

- [ ] **Step 3: Push and open a PR**

```bash
git push -u origin rebuild/backend-notification-dedupe
```

Open a PR to `main` titled "Dedupe notification-trigger boilerplate with notifyPartner". This branch is independent of `rebuild/00-foundation` and can merge in either order.

---

## Self-review notes

- **Spec coverage:** Spec section 7 ("Backend notification-trigger dedupe") — covered by Tasks 1–4. "No behavior change — same notifications, same payloads" — covered by Task 2 Step 3's manual string verification and Task 5's emulator smoke test.
- **Placeholder scan:** none — Task 3 Step 2 flags a real gap (missing `moodId` in push data) inline rather than leaving a TODO, with the exact fix given in text.
- **Type consistency:** `NotifyPartnerParams`/`NotifyPartnerContent` (Task 1) are used with matching field names (`actorUid`, `pairId`, `notificationType`, `preferenceKey`, `buildContent`, `pushData`, `inAppData`, `richContent`, `subtitle`, `imageUrl`) across every trigger refactor in Tasks 2–4; `notifyPartner`'s return type (`{ partnerUid: string } | null`) is checked with `if (!result)` consistently everywhere it's called.
- **onNotificationCreated.ts** is unmodified by design — it's a different pattern (push-only reaction to already-created notification docs) explicitly excluded in the spec discussion.
