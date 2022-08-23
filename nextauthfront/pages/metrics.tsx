import { GetServerSidePropsContext } from "next";

import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";



export default function Metrics() {

  return (
    <div>
      <h1>Metrics </h1>
    </div>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx: GetServerSidePropsContext) => {

  const apiClient = setupAPIClient(ctx);
  const response = await apiClient('/me')


  return {
    props: {

    }
  };
}, {
  permissions:['metrics.list'],
  roles:['administrator']
})
