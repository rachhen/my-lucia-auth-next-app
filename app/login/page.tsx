import Link from "next/link";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id } from "oslo/password";

import { db } from "~/db";
import { users } from "~/db/schema";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { ActionResult, Form } from "~/components/form";
import { lucia, validateRequest } from "~/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default async function Page() {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/");
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form action={login}>
            <div className="flex flex-col gap-4">
              <Input id="username" name="username" placeholder="Username" />
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
              />
              <Button>Login</Button>
            </div>
          </Form>
          <Link href="/signup">Create an account</Link>
        </CardContent>
      </Card>
    </div>
  );
}

async function login(_: any, formData: FormData): Promise<ActionResult> {
  "use server";
  const username = formData.get("username");
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      error: "Invalid username",
    };
  }
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!existingUser) {
    return {
      error: "Incorrect username or password",
    };
  }

  const validPassword = await new Argon2id().verify(
    existingUser.hashedPassword,
    password
  );

  if (!validPassword) {
    return {
      error: "Incorrect username or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return redirect("/");
}
