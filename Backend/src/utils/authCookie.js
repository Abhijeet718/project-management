export const authCookieOptions = (maxAge = 7 * 24 * 60 * 60 * 1000) => {
  const sameSite = (process.env.COOKIE_SAME_SITE || "lax").trim().toLowerCase();

  if (!["strict", "lax", "none"].includes(sameSite)) {
    throw new Error("COOKIE_SAME_SITE must be one of: strict, lax, none");
  }

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || sameSite === "none",
    sameSite,
    path: "/",
    maxAge,
  };
};
