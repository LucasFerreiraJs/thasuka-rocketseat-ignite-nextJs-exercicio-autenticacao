import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { destroyCookie } from "nookies";
import { useContext, useEffect } from "react";
import { Can } from "../components/Can";
import { AuthContext, signOut } from "../contexts/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {

  const { user } = useContext(AuthContext);

  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list']

  })

  // useEffect(()=>{
  //   api.get('/me')
  //     .then(res => console.log(res))
  //     .catch(err => console.log(err))

  // },[]);

  return (
    <div>
      <h1>Dashboard{user?.email}</h1>

      {/* <button onClick={signOut}>Sign Out</button> */}

      <Can permissions={['metrics.list']}>

        <div>Dash</div>
      </Can>

    </div>
  )

}

export const getServerSideProps = withSSRAuth(async (ctx: GetServerSidePropsContext) => {

  const apiClient = setupAPIClient(ctx);
  const response = await apiClient('/me')
  console.log('response dash', response.data)

  return {
    props: {

    }
  };
})
