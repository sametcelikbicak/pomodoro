import Pomodoro from "@/components/Pomodoro/Pomodoro";
import Statistics from "@/components/Pomodoro/Statistics";
import { StatsProvider } from "@/context/StatsContext";

function App() {
  return (
    <StatsProvider>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[color:var(--background)] via-[color:var(--muted)]/30 to-[color:var(--background)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Pomodoro />
          <Statistics />
        </div>
      </div>
    </StatsProvider>
  );
}

export default App;
