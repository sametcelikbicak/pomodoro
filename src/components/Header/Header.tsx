import { Kbd } from '@/components/ui/kbd';

export default function Header({
  onOpenPalette,
}: {
  onOpenPalette?: () => void;
}) {
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(
      navigator.platform || navigator.userAgent || ''
    );

  const shortcut = isMac ? (
    <>
      <Kbd className="mr-0.5">⌘</Kbd>
      <Kbd>K</Kbd>
    </>
  ) : (
    <>
      <Kbd className="mr-0.5">Ctrl</Kbd>
      <Kbd>K</Kbd>
    </>
  );

  return (
    <header className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="w-full flex items-center gap-3 bg-popover/80 backdrop-blur px-3 py-1 rounded-md shadow justify-between">
            <div className="flex items-center gap-3 text-foreground">
              <img
                src="./pomodoro.svg"
                alt="Pomodoro"
                width={36}
                height={36}
                className="rounded-full"
              />
              <div className="hidden sm:block">
                <div className="text-sm font-semibold">Pomodoro</div>
                <div className="text-xs text-muted-foreground">Focus Time</div>
              </div>
            </div>

            <button type="button" onClick={() => onOpenPalette?.()}>
              <span className="font-medium">{shortcut}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
