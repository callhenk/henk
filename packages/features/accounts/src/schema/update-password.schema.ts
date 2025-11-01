import { z } from 'zod';

export const PasswordUpdateSchema = {
  withTranslation: (errorMessage: string) => {
    return z
      .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8).max(99),
        repeatPassword: z.string().min(8).max(99),
      })
      .refine(
        (values) => {
          return values.newPassword === values.repeatPassword;
        },
        {
          path: ['repeatPassword'],
          message: errorMessage,
        },
      );
  },
};
