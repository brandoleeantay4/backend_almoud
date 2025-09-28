import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenantId,
      isSuperAdmin: decoded.isSuperAdmin
    };
    
    next();
  });
};
