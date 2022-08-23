import type { GetServerSideProps, NextPage } from 'next'
import { FormEvent, useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { parseCookies } from 'nookies';
import { withSSRGuest } from '../utils/withSSRGuest';


export default function Home() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn, isAuthenticated } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password
    }
    await signIn(data);


    console.log('data', data);
  }

  return (
    <div className='h-screen  flex items-center'>

      <form className="mx-auto bg-gray-200 w-72 h-32 p-4 flex flex-col gap-1  justify-center" onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}


export const getServerSideProps: GetServerSideProps = withSSRGuest(async (ctx) => {

  return {
    props: {}
  }
})
