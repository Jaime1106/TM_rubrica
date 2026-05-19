import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Intentando login con:", credentials?.email); 
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Faltan credenciales");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        console.log("Usuario encontrado:", user ? "Sí" : "No"); 

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log("Contraseña válida:", isValid); 

        if (!isValid) {
          return null;
        }

        console.log("Login exitoso para:", user.email); 
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};