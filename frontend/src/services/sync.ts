import { apiRequest } from "./api";
import {
  readQueue,
  writeQueue,
} from "./offline";

import {
  cancelAssignmentReminders,
  scheduleAssignmentReminders,
} from "./notifications";

import type { Mutation } from "./offline";
import type { Assignment } from "../types/api";
import { session } from "./session";

function replacePathId(
  path: string,
  map: Map<string, string>,
) {
  let next = path;

  for (const [localId, serverId] of map.entries()) {
    next = next.replace(localId, serverId);
  }

  return next;
}

export async function syncOfflineMutations() {
  const ownerUserId = await session.getUserId();
  const startingToken = await session.getToken();
  if (!ownerUserId || !startingToken) return 0;

  const queue = await readQueue(ownerUserId);
  if (!queue.length) return 0;

  const idMap = new Map<string, string>();
  const remaining: Mutation[] = [];

  for (let index = 0; index < queue.length; index += 1) {
    const mutation = queue[index];
    // Never replay queued writes after logout or an account switch.
    if ((await session.getUserId()) !== ownerUserId || !(await session.getToken())) {
      remaining.push(...queue.slice(index));
      break;
    }
    const path = replacePathId(
      mutation.path,
      idMap,
    );

    try {
      const response =
        await apiRequest<Assignment | { id: string }>(
          path,
          {
            method: mutation.method,
            body: mutation.body,
            skipCache: true,
          },
        );

      if (
        mutation.method === "POST" &&
        mutation.localId &&
        "id" in response
      ) {
        idMap.set(
          mutation.localId,
          response.id,
        );
      }

      if (mutation.resource === "assignment") {
        if (mutation.method === "DELETE") {
          // DELETE responses often contain only a success message, not a title.
          // Resolve the actual ID from the rewritten request path so scheduled
          // notifications are removed after an offline delete syncs.
          const deletedId = path.split("/").filter(Boolean).at(-1) ?? mutation.localId;
          if (deletedId) await cancelAssignmentReminders(deletedId, ownerUserId);
        } else if ("title" in response) {
          await scheduleAssignmentReminders(response as Assignment);
        }
      }
    } catch {
      remaining.push(mutation);
    }
  }

  // Explicit owner key prevents a concurrent account switch from writing account A's
  // remaining queue into account B's storage bucket.
  await writeQueue(remaining, ownerUserId);

  return queue.length - remaining.length;
}