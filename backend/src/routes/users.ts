import { Router } from 'express';
import bcrypt from 'bcrypt';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getRepositories } from '../utils/repositories';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users
router.get('/', async (req, res) => {
  try {
    const { users: userRepository } = getRepositories();
    const users = await userRepository.find({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { users: userRepository } = getRepositories();
    const { id } = req.params;
    const user = await userRepository.findOne({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { users } = getRepositories();
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    // Get current user
    const user = await users.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y correo son requeridos' });
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await users.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El correo ya está en uso' });
      }
    }

    // If changing password, validate current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'La contraseña actual es requerida' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update user fields
    user.name = name;
    user.email = email;

    // Save changes
    await users.save(user);

    // Return updated user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
});

export default router;
