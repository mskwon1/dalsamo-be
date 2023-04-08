import { TextEncoder } from 'util';
import { SignJWT } from 'jose';

const signDalsamoJwt = async (user: UserEntity) => {
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
  const alg = 'HS256';

  const { id, email } = user;

  const token = await new SignJWT({ id, email })
    .setProtectedHeader({ alg })
    .setIssuer('dalsamo-be')
    .setAudience('dalsamo-web')
    .sign(secretKey);

  console.log(token);

  return token;
};

export default signDalsamoJwt;
