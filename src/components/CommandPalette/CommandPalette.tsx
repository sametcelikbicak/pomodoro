import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Play,
  RefreshCw,
  Target,
  Coffee,
  Moon,
  Repeat,
  BarChart2,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from 'react';

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type IconProps = {
  size?: number | string;
  strokeWidth?: number;
  className?: string;
};

const commands: Array<{
  id: string;
  title: string;
  shortcut?: string;
  Icon?: ComponentType<IconProps>;
  detail?: unknown;
}> = [
  {
    id: 'start-pause',
    title: 'Start / Pause timer',
    shortcut: 'P',
    Icon: Play,
  },
  { id: 'reset', title: 'Reset timer', shortcut: 'R', Icon: RefreshCw },
  { id: 'work', title: 'Switch to Work', shortcut: 'W', Icon: Target },
  { id: 'short', title: 'Start Short Break', shortcut: 'S', Icon: Coffee },
  { id: 'long', title: 'Start Long Break', shortcut: 'L', Icon: Moon },
  {
    id: 'toggle-auto',
    title: 'Toggle Auto-break',
    shortcut: 'A',
    Icon: Repeat,
  },
  { id: 'open-stats', title: 'Statistics', shortcut: '.', Icon: BarChart2 },
];

export default function CommandPalette({
  open,
  onOpenChange,
}: CommandPaletteProps) {
  // focus input when opened
  useEffect(() => {
    if (!open) return;
    // small timeout to allow dialog to render
    const id = setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(
        '[data-slot=command-input]'
      );
      if (el) el.focus();
    }, 50);
    return () => clearTimeout(id);
  }, [open]);

  const [query, setQuery] = useState('');

  const runCommand = useCallback(
    (id: string) => {
      // close palette first
      onOpenChange(false);
      // dispatch a global event so components can react
      const ev = new CustomEvent('pomodoro:command', { detail: { id } });
      window.dispatchEvent(ev);
    },
    [onOpenChange]
  );

  // enable single-key shortcuts while palette is open WHEN the query is empty
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      try {
        if (e.defaultPrevented) return;
        // ignore modifier combos and composition
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.altKey ||
          (e as KeyboardEvent & { isComposing?: boolean }).isComposing
        )
          return;
        const k = e.key;
        if (!k || k.length !== 1) return;
        if (query.trim() !== '') return; // let typing work when user is searching

        const keyUpper = k.toUpperCase();
        const match = commands.find(
          (c) => c.shortcut && c.shortcut.toUpperCase() === keyUpper
        );
        if (match) {
          e.preventDefault();
          runCommand(match.id);
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, query, runCommand]);

  // small fuzzy scoring: higher is better. 0 means no match.
  function fuzzyScore(q: string, text: string) {
    if (!q) return 100;
    const query = q.toLowerCase().trim();
    const t = text.toLowerCase();
    if (t === query) return 100;
    if (t.startsWith(query)) return 90;
    if (t.includes(query)) return 75;
    // subsequence match
    let qi = 0;
    for (let i = 0; i < t.length && qi < query.length; i++) {
      if (t[i] === query[qi]) qi++;
    }
    if (qi === query.length) return 50;
    return 0;
  }

  const filtered = useMemo(() => {
    const q = query.trim();
    const list = commands
      .map((c) => ({ c, score: fuzzyScore(q, c.title) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.c.title.localeCompare(b.c.title))
      .map((x) => x.c);
    return list;
  }, [query]);

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(
      navigator.platform || navigator.userAgent || ''
    );
  const placeholder = isMac
    ? 'Search commands... (Press ⌘ + K)'
    : 'Search commands... (Press Ctrl + K)';

  return (
    <CommandDialog
      className="dark"
      open={open}
      onOpenChange={onOpenChange}
      title="Commands"
    >
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={(v: string) => setQuery(v)}
      />
      <CommandList>
        {filtered.length === 0 ? (
          <CommandEmpty>No commands found.</CommandEmpty>
        ) : (
          <CommandGroup>
            {filtered.map((c) => (
              <CommandItem key={c.id} onSelect={() => runCommand(c.id)}>
                <div className="flex items-center gap-2">
                  {c.Icon && <c.Icon className="size-4 opacity-80" />}
                  <span>{c.title}</span>
                </div>
                {c.shortcut && <CommandShortcut>{c.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
