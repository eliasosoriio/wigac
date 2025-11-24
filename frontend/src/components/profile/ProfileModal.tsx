import { useState } from 'react';
import { X, User, Mail, Lock, Save } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Debes ingresar tu contraseña actual para cambiarla');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const updateData: any = {
        name: formData.name,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/users/profile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Actualizar usuario en el store
      setUser(response.data);

      setSuccess('Perfil actualizado correctamente');

      // Limpiar campos de contraseña
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mi Perfil">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-apple-orange-500 flex items-center justify-center text-white text-3xl font-semibold shadow-apple">
            {user?.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Información básica */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nombre
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
              placeholder="Tu nombre completo"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Correo Electrónico
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="pt-4 border-t border-apple-gray-200 dark:border-dark-border">
          <h4 className="text-sm font-semibold text-apple-gray-900 dark:text-apple-gray-100 mb-3 flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            Cambiar Contraseña (opcional)
          </h4>
          <div className="space-y-3">
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('currentPassword', e.target.value)}
              placeholder="Contraseña actual"
              disabled={loading}
            />
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('newPassword', e.target.value)}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              disabled={loading}
            />
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('confirmPassword', e.target.value)}
              placeholder="Confirmar nueva contraseña"
              disabled={loading}
            />
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="p-3 bg-apple-red-50 border border-apple-red-200 rounded-apple text-apple-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-apple-green-50 border border-apple-green-200 rounded-apple text-apple-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-apple bg-apple-gray-200 hover:bg-apple-gray-300 dark:bg-dark-hover dark:hover:bg-dark-card text-apple-gray-700 dark:text-apple-gray-300 font-medium transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileModal;
