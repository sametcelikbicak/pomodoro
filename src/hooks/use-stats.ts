import { use } from 'react';
import { StatsContext } from '../context/stats-context';

export const useStats = () => use(StatsContext);
