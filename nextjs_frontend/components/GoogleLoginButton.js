// components/GoogleLoginButton.js
import { signIn } from "next-auth/react";

const GoogleLoginButton = () => {
    return (
        <button onClick={() => signIn("google") }>
            Sign in with Google
        </button>
    )
}

export default GoogleLoginButton;
