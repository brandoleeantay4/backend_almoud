import multer from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: multer.File;
      files?: multer.File[] | { [fieldname: string]: multer.File[] };
      user?: {
        id: string;
        email: string;
        userId: string;
        tenantId?: string;
        isSuperAdmin?: boolean;
      };
      tenantId?: string;
      tenantSubdomain?: string;
      isSuperAdmin?: boolean;
    }
  }
}

export {};
