import { Router } from 'express';
import multer from 'multer';
import { 
  register, 
  login, 
  getProfile, 
  uploadProfileImage 
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenantResolver';

const router = Router();

// Configurar multer CORRECTAMENTE
const upload = multer({ 
  storage: multer.memoryStorage(), // Importante: usar memoryStorage
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp)') as any, false);
    }
  }
});

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', authenticateToken, tenantResolver, getProfile);

// RUTA DE UPLOAD CORREGIDA
router.post('/upload-profile-image', 
  authenticateToken,        // Autenticación
  tenantResolver,          // Multi-tenancy
  upload.single('image'),  // Multer middleware
  uploadProfileImage       // Controller
);

export default router;
