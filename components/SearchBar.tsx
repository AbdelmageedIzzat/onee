"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        const url = query ? `/?q=${encodeURIComponent(query)}` : "/";
        router.push(url);
      }}
    >
      <input
        className="border rounded-md px-3 py-2 w-64"
        placeholder="ابحث عن منتج..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button className="btn" type="submit">بحث</button>
    </form>
  );
}
