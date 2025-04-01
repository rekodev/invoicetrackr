import { cookies } from "next/headers";

export const getAuthTokenFromCookies = async () =>
  (await cookies()).get("authjs.session-token")?.value;
