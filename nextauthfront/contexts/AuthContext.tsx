import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies';





type User = {
  email: string;
  permissions: Array<string>;
  roles: string[];
}

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  isAuthenticated: boolean;
  user: User
}

type AuthProviderProps = {
  children: ReactNode;
}



// const authChannel = new BroadcastChannel('auth');
let authChannel: BroadcastChannel

export function signOut() {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  authChannel.postMessage('signOut');

  Router.push('/');

}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {

  const [user, setUser] = useState<User>({} as User);
  const isAuthenticated = !!user.email;

  useEffect(() => {


    authChannel = new BroadcastChannel('auth');
    authChannel.onmessage = (message) => {
      switch (message.data) {

        case 'signOut':
          // signOut();
          break;

        default:
          break;
      }

    }
  }, [])

  // carregar pela primeira vez
  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();


    if (token) {
      api.get('/me')
        .then(res => {

          const { email, permissions, roles } = res.data;

          setUser({ email, permissions, roles });

        }).catch(err => {
          signOut();
        });
    }
  }, []);


  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('/sessions', {
        email,
        password
      })

      //  sessionsStorage
      //    dura somente a sessão

      //  localstorage
      //

      //  cookies
      //     acesso no lado cliente e servidor
      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/' // qualquer endereço
      });

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/' // qualquer endereço
      });

      setUser({
        email: email,
        permissions,
        roles

      })

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // authChannel.postMessage('signIn');
      Router.push('/dashboard')
    } catch (err) { console.log('err auth', err) }
  }


  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )

}
