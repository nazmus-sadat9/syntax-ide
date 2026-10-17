"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export const useFriend = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const request = async (path: string, method: string, body?: object) => {
    // Build full URL using the provided path
    const url = `${API}/friends${path}`;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };


  const sendRequest = (recipientId: string) => {
    request("/request", "POST", { recipientId });
  };

  const acceptRequest = (recipientId: string) => {
    request("/accept", "POST", { recipientId });
  };

  const rejectRequest = (recipientId: string) => {
    request("/reject", "POST", { recipientId });
  };

  return { sendRequest, acceptRequest, rejectRequest };
};
