import prisma from "@/prisma/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";

const handler = NextAuth({
	providers: [],
	adapter: PrismaAdapter(prisma),
});

export { handler as GET, handler as POST };
