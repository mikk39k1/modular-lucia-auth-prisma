
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ComponentType } from "react";

export function withAuth<T>(Component: ComponentType<T>) {
  return async function AuthenticatedComponent(props: T) {
    const { user } = await validateRequest();
    if (!user) {
      redirect("/login");
      return null;
    }
    return <Component {...props} user={user} />;
  };
}
