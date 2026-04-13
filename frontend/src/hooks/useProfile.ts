import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { updateProfile, changePassword } from '@/services/settings.service';
import type { UpdateProfileData, ChangePasswordData } from '@/services/settings.service';
import { useAuthStore } from '@/store/auth.store';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
}

export function useProfile() {
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: (result) => {
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, fullName: result.fullName } : state.user,
      }));
      toast({ description: 'Perfil actualizado correctamente' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => changePassword(data),
    onSuccess: () => {
      toast({ description: 'Contraseña actualizada correctamente' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  return { updateProfileMutation, changePasswordMutation };
}
