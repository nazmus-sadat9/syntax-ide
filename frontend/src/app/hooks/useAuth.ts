"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// types
type User = { id: string; username: string; email: string; bio?: string; github?: string };

// server api
const API = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // remove the token and user from localStorage
  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // if token is missing than push login page
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // get user api
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

  // update user api
  const updateUser = async (changes: { username?: string; bio?: string; github?: string }) => {
    const token = localStorage.getItem("token");

    // send the data to server
    const res = await fetch(`${API}/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(changes),
    });

    // get the user data from server
    const data = await res.json();
    // if response is not success
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Update failed");
    }

    // set the user data and return
    setUser(data.user);
    return data.user;
  };

  // search User api
  const searchUsers = async (query: string): Promise<User[]> => {
    const token = localStorage.getItem("token");

    // send the username to the server
    const res = await fetch(`${API}/search/${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // if user not found
    if (res.status === 404) return [];

    // get the user data from json
    const data = await res.json();

    // if the response is not success
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Search failed");
    }

    return data.users ?? [];
  };

  // logout an user
  const logout = () => {
    clearSession();
    router.push("/login");
  };

  return { user, loading, error, logout, updateUser, searchUsers };
}
