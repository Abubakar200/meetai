import { createTRPCRouter } from '../init';
import { agentsRouter } from '@/app/modules/agents/server/procedures';
 import { meetingsRouter } from '@/app/modules/mettings/server/procedures';
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
    meetings: meetingsRouter,
});
 
// export type definition of API
export type AppRouter = typeof appRouter;