"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";

import { UserRoundPlus } from "lucide-react";

export default function Page() {
  const router = useRouter();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  async function signUp(event: any) {
    event.preventDefault();

    if (password.length < 8) {
      alert("Password Must Be At Least Eight Characters Long");

      return;
    }

    if (!/[a-z]/.test(password)) {
      alert("Password Must Have At Least One Lowercase Letter");

      return;
    }

    if (!/[A-Z]/.test(password)) {
      alert("Password Must Have At Least One Uppercase Letter");

      return;
    }

    if (!/[0-9]/.test(password)) {
      alert("Password Must Have At Least One Number");

      return;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      alert("Password Must Have At Least One Special Symbol");

      return;
    }

    if (/\s/.test(password)) {
      alert("Password Can't Contain Spaces");

      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords Don't Match");

      return;
    }

    const response = await fetch("/api/sign-up", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        alert("This Email Is Already Used");

        return;
      }

      alert("Failed To Sign Up");

      return;
    }

    router.push("/account");
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <form
        onSubmit={(event) => signUp(event)}
        className="flex max-h-[75vh] max-w-[75vw] flex-col gap-4 border border-[#1a1a1a] bg-[#0d0d0d] p-4"
      >
        <div className="text-center text-xl font-bold">Sign Up</div>

        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          placeholder="Name"
          className="border-b border-[#1a1a1a] focus:outline-none"
        />

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

        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          placeholder="Confirm Password"
          className="border-b border-[#1a1a1a] focus:outline-none"
        />

        <button
          type="submit"
          className="flex cursor-pointer items-center gap-1 self-center focus:outline-none"
        >
          <UserRoundPlus className="h-4 w-4" />

          <div>Sign Up</div>
        </button>

        <div className="flex flex-wrap justify-center gap-1 text-center">
          <div>Already Have An Account?</div>

          <div
            className="cursor-pointer underline"
            onClick={() => router.push("/sign-in")}
          >
            Sign In
          </div>
        </div>
      </form>
    </div>
  );
}
