import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";

import {db} from "../app/db/index";

export const auth = betterAuth({
    socialProviders: {
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    database: drizzleAdapter(db, {
        provider: "pg"
    }),
    emailAndPassword: {
        enabled: true,
    },
    // socialProviders: {
    //     ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    //         ? {
    //               google: {
    //                   clientId: process.env.GOOGLE_CLIENT_ID,
    //                   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //               },
    //           }
    //         : {}),
    //     ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    //         ? {
    //               github: {
    //                   clientId: process.env.GITHUB_CLIENT_ID,
    //                   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    //               },
    //           }
    //         : {}),
    // },
})