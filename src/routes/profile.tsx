import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  rootRouteId,
  useNavigate,
  useRouteContext,
} from "@tanstack/react-router";
import { useAuth } from "better-convex/react";
import { BookOpen, LogOutIcon } from "lucide-react";
import { useEffect } from "react";
import AuthAvatar from "@/components/auth/auth-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSignOutMutationOptions } from "@/lib/convex/auth/auth-mutations";
import { useCRPC } from "@/lib/convex/crpc";

interface UserStats {
  totalLists: number;
  totalWords: number;
  memberSince: Date;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { currentUser } = useRouteContext({ from: rootRouteId });
  const signOut = useMutation(useSignOutMutationOptions());
  const crpc = useCRPC();

  const { data: wordLists } = useQuery(
    crpc.wordLists.getUserLists.queryOptions({})
  );

  useEffect(() => {
    if (!(isLoading || isAuthenticated)) {
      navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const stats: UserStats = {
    totalLists: wordLists?.length ?? 0,
    totalWords:
      wordLists?.reduce((sum: number, list) => sum + list.wordCount, 0) ?? 0,
    memberSince: new Date(),
  };

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: "/" });
      },
    });
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center" />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-4 font-bold text-4xl tracking-tight">Profile</h1>
          <p className="text-lg text-zinc-400">
            Manage your account and view your statistics
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-6 font-semibold text-xl">Account</h2>
              <div className="flex items-center gap-6">
                <AuthAvatar />
                <div>
                  <h3 className="font-medium text-lg">
                    {currentUser?.name ?? "User"}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Member since {stats.memberSince.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-6 font-semibold text-xl">Statistics</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 bg-zinc-800/50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center bg-zinc-700">
                    <BookOpen className="size-6" />
                  </div>
                  <div>
                    <p className="font-bold text-2xl">{stats.totalWords}</p>
                    <p className="text-sm text-zinc-400">Total Words</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-zinc-800/50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center bg-zinc-700">
                    <BookOpen className="size-6" />
                  </div>
                  <div>
                    <p className="font-bold text-2xl">{stats.totalLists}</p>
                    <p className="text-sm text-zinc-400">Word Lists</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 font-semibold text-xl">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  className="block w-full bg-zinc-800 px-4 py-3 text-center font-medium transition-colors hover:bg-zinc-700"
                  to="/lists"
                >
                  View My Lists
                </Link>
                <Link
                  className="block w-full bg-zinc-800 px-4 py-3 text-center font-medium transition-colors hover:bg-zinc-700"
                  to="/discover"
                >
                  Discover New Lists
                </Link>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-6 font-semibold text-xl">Actions</h2>
              <Button
                className="w-full"
                loading={signOut.isPending}
                onClick={handleSignOut}
                variant="destructive"
              >
                <LogOutIcon className="mr-2 size-4" />
                Sign Out
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});
