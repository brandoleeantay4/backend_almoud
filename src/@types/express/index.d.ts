// backend/src/@types/express/index.d.ts
import { File } from 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        email: string;
        tenantId?: string;
        isSuperAdmin?: boolean;
      };
      tenantId?: string;
      tenantSubdomain?: string;
      isSuperAdmin?: boolean;
      file?: File;
      files?: File[] | { [fieldname: string]: File[] };
    }
  }
}
