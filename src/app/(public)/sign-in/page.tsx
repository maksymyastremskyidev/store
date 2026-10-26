"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";

import { UserRoundCheck } from "lucide-react";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  async function signIn(event: any) {
    event.preventDefault();

    const response = await fetch("/api/sign-in", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert("Invalid Email Or Password");

        return;
      }

      alert("Failed To Sign In");

      return;
    }

    router.push("/account");
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <form
        onSubmit={(event) => signIn(event)}
        className="flex max-h-[75vh] max-w-[75vw] flex-col gap-4 border border-[#1a1a1a] bg-[#0d0d0d] p-4"
      >
        <div className="text-center text-xl font-bold">Sign In</div>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="Email"
          className="border-b border-[#1a1a1a] focus:outline-none"
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          placeholder="Password"
          className="border-b border-[#1a1a1a] focus:outline-none"
        />

        <button
          type="submit"
          className="flex cursor-pointer items-center gap-1 self-center focus:outline-none"
        >
          <UserRoundCheck className="h-4 w-4" />

          <div>Sign In</div>
        </button>

        <div className="flex flex-wrap justify-center gap-1 text-center">
          <div>Don't Have An Account?</div>

          <div
            className="cursor-pointer underline"
            onClick={() => router.push("/sign-up")}
          >
            Sign Up
          </div>
        </div>
      </form>
    </div>
  );
}
