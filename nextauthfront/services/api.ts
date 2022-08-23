import { AuthTokenError } from './errors/AuthTokenError';
import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';
import { GetServerSidePropsContext } from 'next';

interface AxiosErrorResponse {
  code?: string;
}

type failedRequestsQueue = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}

// inicializado
let isRefreshing = false;
let failedRequestsQueue = Array<failedRequestsQueue>();

export function setupAPIClient(ctx: GetServerSidePropsContext | undefined = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  });

  // recebe duas fn
  //    executa quando ocorre  sucesso outra em error
  api.interceptors.response.use(response => {
    return response;
  }, (error: AxiosError<AxiosErrorResponse>) => {

    if (error.response?.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        //renovar token
        //atualizado
        cookies = parseCookies(ctx);
        const { 'nextauth.refreshToken': refreshToken } = cookies;
        const originalConfig = error.config;


        if (!isRefreshing) {
          isRefreshing = true;


          console.log('refresh')
          api.post('/refresh', {
            refreshToken
          }).then(response => {
            const { token } = response.data;

            setCookie(ctx, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 dias
              path: '/' // qualquer endereço
            });

            setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 dias
              path: '/' // qualquer endereço
            });

            // api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            failedRequestsQueue.forEach(request => request.onSuccess(token));
            failedRequestsQueue = [];

          }).catch(err => {
            failedRequestsQueue.forEach(request => request.onFailure(err));
            failedRequestsQueue = [];

            if (process.browser) {

              signOut();
            }

          }).finally(() => {
            isRefreshing = false;
          });

        }


        // não conseguimos usar await
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {

              if (!originalConfig?.headers) {
                return;
              }

              originalConfig.headers['Authorization'] = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            }
          });

        });
      } else {
        // deslogar

        if (process.browser) {

          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }

        console.log('type of', window, process)
      }
    }

    return Promise.reject(error);
  });

  return api;
}

