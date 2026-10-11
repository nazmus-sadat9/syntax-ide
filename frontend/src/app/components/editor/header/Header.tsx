import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";

const Header = () => {

  const { user, loading } = useAuth();

  return (
    <div className="w-full text-white flex justify-between items-center p-4 bg-[#121212] border-b border-zinc-800">
      <div>
        <h2>Syntax IDE</h2>
      </div>

      <div>
        {loading ? null : user ? (
          <div>
            <Link href="/profile">{user.username}</Link>
          </div>
        ) : (

          <div className="flex gap-4">
            <Link href="/register" className="px-2.5 px-2">
              Sign up
            </Link>

            <Link href="/login" className="px-2.5 px-2">
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
