import { useRouter } from "next/router";

import { useAuth } from "./useAuth";

export const useRoutePrefix = () => {
  const router = useRouter();
  const { user } = useAuth();

  const getPrefix = () => {
    if (!user) return "";
    switch (user.role) {
      case "Admin":
        return "/a";
      case "Student":
        return "/s";
      case "TrainingManager":
        return "/t";
      default:
        return "";
    }
  };

  const pushWithPrefix = (path: string) => {
    const prefix = getPrefix();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return router.push(`${prefix}${normalizedPath}`);
  };

  const replaceWithPrefix = (path: string) => {
    const prefix = getPrefix();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return router.replace(`${prefix}${normalizedPath}`);
  };

  const { push: _, replace: __, ...restRouter } = router;

  return {
    push: pushWithPrefix,
    replace: replaceWithPrefix,
    prefix: getPrefix(),
    ...restRouter,
  };
};
