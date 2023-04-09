import { jwtVerify } from 'jose';
import { TextEncoder } from 'util';

const verifyDalsamoJwt = async (token: string) => {
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

  const result = await jwtVerify(token, secretKey);

  return result.payload;
};

export default verifyDalsamoJwt;
