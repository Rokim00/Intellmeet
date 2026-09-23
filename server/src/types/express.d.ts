import { IJwtPayload } from './user.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}
