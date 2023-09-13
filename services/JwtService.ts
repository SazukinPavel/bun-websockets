import { JWTPayload, SignJWT, jwtVerify } from "jose";

export default class JwtService<T extends JWTPayload> {
  private secret: Uint8Array;
  private alg: string;
  private issuer: string;
  private audience: string;
  private expiration: string;

  constructor() {
    this.secret = new TextEncoder().encode(process.env.JWT_SECRET);
    this.alg = "HS256";
    this.issuer = process.env.JWT_ISSUER!;
    this.audience = process.env.JWT_AUDIENCE!;
    this.expiration = process.env.JWT_EXPIRATION!;
  }

  sign(data: T) {
    return new SignJWT(data)
      .setProtectedHeader({ alg: this.alg })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(this.expiration)
      .sign(this.secret);
  }

  async verify(token: string) {
    const { payload } = await jwtVerify(token, this.secret, {
      issuer: this.issuer,
      audience: this.audience,
    });

    return payload as T;
  }
}
