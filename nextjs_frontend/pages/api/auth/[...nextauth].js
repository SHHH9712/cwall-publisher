import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: 'consent', 
        },
      },
      scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file",
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      console.log('Received Account Information: ', account);
      console.log("Received information for user: ", profile);
      
      const response = await fetch('http://localhost:8000/api/store-token/', { 
        method: 'POST',
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
        }),
        headers: { 'Content-Type': 'application/json' }, 
      });

      // console.log(response)
      if (!response.ok) {
          console.error(`Error storing tokens: ${response.statusText}`)
          return False
      } else {
          console.log('Tokens stored successfully!')
          return true
      } 
    }
  },
});
