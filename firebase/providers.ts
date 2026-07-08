import { GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

export const googleProvider = new GoogleAuthProvider();
// You can add custom scopes if needed:
// googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export const githubProvider = new GithubAuthProvider();
// githubProvider.addScope('user:email');
