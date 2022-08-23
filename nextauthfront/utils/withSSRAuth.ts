
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { destroyCookie, parseCookies } from 'nookies';
import { AuthTokenError } from '../services/errors/AuthTokenError';
import decode from 'jwt-decode';
import { validateUserPermissions } from './validateUserPermissions';


type WithSSRAuthOptions = {
  permissions: string[];
  roles: string[];

}


export function withSSRAuth<P extends { [key: string]: any; }>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {

  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['nextauth.token']

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    //checkar permissões do user

    if (options){
      const user = decode<{ permissions: string[], roles: string[] }>(token);
      // const { permissions, roles } = typeof options != "undefined" ? options : { permissions: [''], roles: [''] };
      const { permissions, roles } =  options;

      const userHasValuePermissions = validateUserPermissions({
        user,
        permissions,
        roles
      });


      if(!userHasValuePermissions){
        return {
          redirect:{
            destination:  '/dashboard',
            permanent: false,
          }
        }
      }


    }

    try {
      return await fn(ctx);
    } catch (err) {

      if (err instanceof AuthTokenError) {

        destroyCookie(ctx, 'nextauth.token')
        destroyCookie(ctx, 'nextauth.refreshToken')

        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        };

      }

      return {
        redirect: {
          destination: '/error', // Em caso de um erro não esperado, você pode redirecionar para uma página publica de erro genérico
          permanent: false
        }
      }

    }

  }
}



