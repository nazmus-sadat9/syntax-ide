"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; username: string; email: string; bio?: string; github?: string };

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);

        } else {
          clearSession();
          router.replace("/login");
        }
      })
      .catch(() => {
        setError("Cannot reach the server");
      })
      .finally(() => setLoading(false));

  }, [router]);

  const updateUser = async (changes: { username?: string; bio?: string; github?: string }) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(changes),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Update failed");
    }

    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearSession();
    router.push("/login");
  };

  return { user, loading, error, logout, updateUser };
}
