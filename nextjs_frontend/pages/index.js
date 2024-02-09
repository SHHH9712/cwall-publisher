import Head from 'next/head';
import GoogleLoginButton from '../components/GoogleLoginButton'; 
import UserProfile from '../components/UserProfile';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession(); // Handles authentication 

  return (
    <div>
      <Head>
        <title>My Single-Page App</title>
      </Head>

      <div className="container"> {/* Example styling container */}
        {session ? (
          <UserProfile session={session} /> 
        ) : (
          <GoogleLoginButton />
        )}
      </div>
    </div>
  );
}
