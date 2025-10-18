import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import { client } from "@/lib/orpc/orpc";

export const orpc = createTanstackQueryUtils(client);
