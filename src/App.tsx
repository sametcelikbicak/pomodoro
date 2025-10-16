import Pomodoro from '@/components/Pomodoro/Pomodoro';
import Statistics from '@/components/Statistics/Statistics';
import { StatsProvider } from '@/context/StatsContext';
import CommandPalette from '@/components/CommandPalette/CommandPalette';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useEffect, useState } from 'react';
import { requestNotificationPermission } from '@/utils/notifications';

function App() {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      // Cmd/Ctrl+K to open
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Request notification permission on app load
  useEffect(() => {
    requestNotificationPermission().catch(console.error);
  }, []);

  return (
    <StatsProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[color:var(--background)] via-[color:var(--muted)]/50 to-[color:var(--primary)] dark">
        <Header onOpenPalette={() => setCommandOpen(true)} />
        <div className="my-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mx-auto">
          <Pomodoro />
          <Statistics />
        </div>
        <Footer />
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </StatsProvider>
  );
}

export default App;
