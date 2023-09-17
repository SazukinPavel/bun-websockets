import { JWTPayload } from "jose";
import { User } from ".";

type UserJwtPayload = JWTPayload & User;

export default UserJwtPayload;
