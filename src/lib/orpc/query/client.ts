import { StandardRPCJsonSerializer } from "@orpc/client/standard";
import type { StandardRPCJsonSerializedMetaItem } from "@orpc/client/standard";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

const serializer = new StandardRPCJsonSerializer();

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        serializeData(data) {
          const [json, meta] = serializer.serialize(data);
          return { json, meta };
        },
      },
      hydrate: {
        deserializeData(data) {
          const serialized = data as {
            json: unknown;
            meta: readonly StandardRPCJsonSerializedMetaItem[];
          };
          return serializer.deserialize(serialized.json, serialized.meta);
        },
      },
    },
  });
}
