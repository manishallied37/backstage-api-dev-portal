import {
  googleAuthApiRef,
  githubAuthApiRef,
} from '@backstage/core-plugin-api';

export const providers = [
  {
    id: 'google-auth-provider',
    title: 'Google',
    message: 'Sign In using Google',
    apiRef: googleAuthApiRef,
  },
  {
    id: 'github-auth-provider',
    title: 'GitHub',
    message: 'Sign In using GitHub',
    apiRef: githubAuthApiRef,
  },
];
