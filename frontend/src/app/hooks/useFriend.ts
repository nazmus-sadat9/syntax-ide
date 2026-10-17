"use client";
import { useState } from "react";

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/friends`;

export const useFriend = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async (path: string, body: object) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = (recipientId: string) => request("/request", { recipientId });
  const acceptRequest = (requesterId: string) => request("/accept", { requesterId });
  const rejectRequest = (requesterId: string) => request("/reject", { requesterId });

  return { sendRequest, acceptRequest, rejectRequest, loading, error };
};
