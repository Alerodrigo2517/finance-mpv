import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "super-secret-key-for-local-dev-12345",
  providers: [
    CredentialsProvider({
      name: 'Email y Contraseña',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'tu@email.com' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Faltan credenciales');
        }

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.contrasena) {
          throw new Error('Usuario no encontrado');
        }

        const isValid = await bcrypt.compare(credentials.password, user.contrasena);

        if (!isValid) {
          // Fallback para contraseñas en texto plano del MVP si bcrypt falla temporalmente (hasta que los reseten)
          if (credentials.password === user.contrasena) {
            return { id: user.id, name: `${user.nombre} ${user.apellido}`, email: user.email };
          }
          throw new Error('Contraseña incorrecta');
        }

        return { id: user.id, name: `${user.nombre} ${user.apellido}`, email: user.email };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Ruta personalizada
  },
};
