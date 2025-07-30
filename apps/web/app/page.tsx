import { redirect } from 'next/navigation';

import pathsConfig from '~/config/paths.config';

export default function RootPage() {
  // Redirect to the sign-in page
  redirect(pathsConfig.auth.signIn);
}
