import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ActionResult, Form } from "~/components/form";
import { lucia, validateRequest } from "~/lib/auth";

export default async function Home() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Hi, {user.username}!</h1>
      <p>Your user ID is {user.id}.</p>
      <Form action={logout}>
        <button>Sign out</button>
      </Form>
    </main>
  );
}

async function logout(): Promise<ActionResult> {
  "use server";
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/login");
}
