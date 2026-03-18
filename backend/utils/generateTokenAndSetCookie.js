import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res , userid) => {
  const token = jwt.sign({userid}, process.env.JWT_SECRET, {expiresIn:"7d"})

  res.cookie("token" , token , {
    httpOnly : true, // cookie can not be accesses by client side js
    secure : process.env.NODE_ENV === "production",// only works on https
    sameSite: "strict",// prevents from attack called csrf
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days 

  });
  return token;
} 