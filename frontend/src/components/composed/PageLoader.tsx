import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'


export interface PageLoaderProps {
  fullScreen?: boolean
  message?: string
}

export function PageLoader({
  fullScreen = true,
  message = 'Loading...',
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        'grid place-items-center bg-background p-6',
        fullScreen ? 'min-h-screen' : 'min-h-[40vh] p-8 sm:min-h-[50vh] sm:p-10',
      )}
    >
      <div aria-live="polite" className="grid place-items-center" role="status">
        <Spinner
          aria-hidden="true"
          aria-label={undefined}
          className="size-11 text-primary"
          role={undefined}
        />
        <span className="sr-only">{message}</span>
      </div>
    </div>
  )
}
