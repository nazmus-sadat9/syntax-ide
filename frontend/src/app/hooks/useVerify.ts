"use client";

// types
type Result = { success: boolean; message: string };

// server api
const API = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

export function useVerify() {

  // verification code api
  const verifyEmail = async (email: string, code: string): Promise<Result> => {
    try {
      // fetch the emqil and code
      const res = await fetch(`${API}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      //get the response in json
      const data = await res.json();

      // set the data token in localStorage
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // return the data
      return { success: !!data.success, message: data.message || "" };

    } catch {
      return { success: false, message: "Cannot reach the server" };
    }
  };

  // resend Code api
  const resendCode = async (email: string): Promise<Result> => {
    try {
      // send the email for get the code again
      const res = await fetch(`${API}/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // get the response in json
      const data = await res.json();

      // rturn the data
      return { success: !!data.success, message: data.message || "" };

    } catch {
      return { success: false, message: "Cannot reach the server" };
    }
  };

  return { verifyEmail, resendCode };
}
