import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 40,
};

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const px = SIZE_MAP[size];

  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn('inline-block animate-spin rounded-full border-2 border-primary border-t-transparent', className)}
      style={{ width: px, height: px }}
    />
  );
}
