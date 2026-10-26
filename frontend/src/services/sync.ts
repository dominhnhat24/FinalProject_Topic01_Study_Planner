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
  const queue = await readQueue();

  if (!queue.length) {
    return 0;
  }

  const idMap = new Map<string, string>();
  const remaining: Mutation[] = [];

  for (const mutation of queue) {
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

      if (
        mutation.resource === "assignment" &&
        "title" in response
      ) {
        if (mutation.method === "DELETE") {
          await cancelAssignmentReminders(
            response.id,
          );
        } else {
          await scheduleAssignmentReminders(
            response,
          );
        }
      }
    } catch {
      remaining.push(mutation);
    }
  }

  await writeQueue(remaining);

  return (
    queue.length - remaining.length
  );
}