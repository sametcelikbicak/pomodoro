import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useStats } from '@/context/StatsContext';
import { Button } from '@/components/ui/button';

function secondsToHMS(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':');
}

export default function Statistics() {
  const { stats, resetStats } = useStats();

  return (
    <Card className="w-full max-w-md shadow">
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Work sessions</div>
          <div className="text-right">{stats.workSessions}</div>

          <div className="text-muted-foreground">Rounds completed</div>
          <div className="text-right">{stats.roundsCompleted}</div>

          <div className="text-muted-foreground">Short breaks</div>
          <div className="text-right">{stats.shortBreaksTaken}</div>

          <div className="text-muted-foreground">Long breaks</div>
          <div className="text-right">{stats.longBreaksTaken}</div>

          <div className="text-muted-foreground">Total focus</div>
          <div className="text-right">
            {secondsToHMS(stats.totalFocusSeconds)}
          </div>

          <div className="text-muted-foreground">Total break</div>
          <div className="text-right">
            {secondsToHMS(stats.totalBreakSeconds)}
          </div>
        </div>

        <div className="mt-4 text-right">
          <Button
            variant="secondary"
            className="text-xs cursor-pointer"
            onClick={resetStats}
          >
            Reset stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
