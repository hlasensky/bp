import prisma from "@/prisma/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text", placeholder: "jsmith" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
                const user = { id: "1", name: "J Smith", email: "jsmith@example.com" };
                
				if (!credentials) {
					return null;
				}

				const user2 = await prisma.user.findFirst({
					where: {
						email: credentials.username,
						password: credentials.password
					}
				})

				if (user) {
					return user;
				} else {
					return null;
				}
			},
		}),
	],
	adapter: PrismaAdapter(prisma),
});

export { handler as GET, handler as POST };
