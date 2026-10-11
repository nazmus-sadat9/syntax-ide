"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.replace("/");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return <>{children}</>;
}
