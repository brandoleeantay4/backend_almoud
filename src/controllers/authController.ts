import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload REAL a Cloudinary - NUEVA FUNCIÓN
const uploadToCloudinary = async (
  buffer: Buffer, 
  folder: string, 
  fileName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `food-cost/${folder}`, // Carpeta en Cloudinary
        public_id: fileName,
        transformation: [
          { width: 400, height: 400, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('❌ Error subiendo a Cloudinary:', error);
          reject(error);
        } else {
          console.log('✅ Imagen subida a Cloudinary:', result?.secure_url);
          resolve(result!.secure_url);
        }
      }
    ).end(buffer);
  });
};

// Registro
export const register = async (req: any, res: Response): Promise<void> => {
  try {
    const { email, password, name, lastname } = req.body;
    
    if (!email || !password || !name || !lastname) {
      res.status(400).json({ 
        message: 'Todos los campos son requeridos' 
      });
      return;
    }

    const domain = email.split('@')[1];
    
    if (!domain.endsWith('.almoud.pe') && domain !== 'almoud.pe') {
      res.status(400).json({
        message: 'Email debe usar dominio @[restaurante].almoud.pe o @almoud.pe'
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      res.status(400).json({ 
        message: 'El email ya está registrado' 
      });
      return;
    }

    let tenantId = null;
    if (domain !== 'almoud.pe') {
      const subdomain = domain.split('.')[0];
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain }
      });
      
      if (!tenant) {
        res.status(400).json({
          message: 'Restaurante no encontrado'
        });
        return;
      }
      
      tenantId = tenant.id;
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        lastname,
        tenantId
      }
    });
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        tenantId: user.tenantId,
        isSuperAdmin: domain === 'almoud.pe'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        lastname: user.lastname,
        role: user.role,
        profileImage: user.profileImage,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Login
export const login = async (req: any, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ 
        message: 'Email y password son requeridos' 
      });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        tenant: true,
        assignedRole: true
      }
    });
    
    if (!user || !user.isActive) {
      res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
      return;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const domain = email.split('@')[1];
    const isSuperAdmin = domain === 'almoud.pe';
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        tenantId: user.tenantId,
        isSuperAdmin
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login exitoso',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        lastname: user.lastname,
        role: user.role,
        profileImage: user.profileImage,
        tenantId: user.tenantId,
        tenant: user.tenant,
        assignedRole: user.assignedRole
      },
      dashboardType: isSuperAdmin ? 'super-admin' : 'tenant'
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener perfil
export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        tenant: true,
        assignedRole: true
      }
    });
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        role: user.role,
        profileImage: user.profileImage,
        tenantId: user.tenantId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        tenant: user.tenant,
        assignedRole: user.assignedRole
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Upload de imagen CON CLOUDINARY REAL - FUNCIÓN ACTUALIZADA
export const uploadProfileImage = async (req: any, res: Response): Promise<void> => {
  try {
    console.log('📁 Upload iniciado...');
    console.log('User from token:', req.user?.email);
    console.log('Files received:', req.files ? req.files.length : 0);
    console.log('File received (single):', req.file ? 'Sí' : 'No');

    // Manejar upload.any() - buscar el archivo
    let file = req.file;
    if (!file && req.files && req.files.length > 0) {
      file = req.files[0]; // Tomar el primer archivo
    }

    if (!file) {
      res.status(400).json({ 
        message: 'No se proporcionó imagen. Asegúrate de usar un campo de tipo File.',
        error: 'FILE_MISSING'
      });
      return;
    }

    console.log('📄 Procesando imagen:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Procesar imagen con Sharp
    const processedImageBuffer = await sharp(file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    console.log('✅ Imagen procesada con Sharp');

    // UPLOAD REAL A CLOUDINARY
    const imageUrl = await uploadToCloudinary(
      processedImageBuffer,
      `tenants/${req.tenantId || 'system'}/profiles`,
      `${req.user.userId}-${Date.now()}`
    );

    console.log('🌩️ Imagen subida a Cloudinary:', imageUrl);

    // Actualizar usuario en BD
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { profileImage: imageUrl }
    });

    console.log('✅ Usuario actualizado en BD');

    res.json({
      message: 'Imagen actualizada exitosamente',
      profileImage: imageUrl,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        lastname: updatedUser.lastname,
        profileImage: updatedUser.profileImage
      }
    });

  } catch (err) {
    console.error('❌ Error subiendo imagen:', err);
    
    const error = err as any;
    const errorMessage = error?.message || 'Error desconocido';
    
    // Error específico de Sharp
    if (errorMessage.includes('Input buffer contains unsupported image format')) {
      res.status(400).json({ 
        message: 'Formato de imagen no soportado',
        error: 'INVALID_FORMAT'
      });
      return;
    }

    // Error específico de Multer
    if (error?.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ 
        message: 'Imagen muy grande. Máximo 5MB',
        error: 'FILE_TOO_LARGE'
      });
      return;
    }

    // Error específico de Cloudinary
    if (error?.message?.includes('Invalid cloud_name')) {
      res.status(500).json({ 
        message: 'Error de configuración de Cloudinary',
        error: 'CLOUDINARY_CONFIG_ERROR'
      });
      return;
    }

    res.status(500).json({ 
      message: 'Error interno del servidor al procesar imagen',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'INTERNAL_ERROR'
    });
  }
};
