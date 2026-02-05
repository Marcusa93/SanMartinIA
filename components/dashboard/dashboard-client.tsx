'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';
import { useDashboardData } from '../../hooks/useDashboardData';
import { DashboardKpiGrid } from './DashboardKpiGrid';
import { DashboardAlerts } from './DashboardAlerts';
import { DashboardCharts } from './DashboardCharts';
import { DashboardTeamSummary } from './DashboardTeamSummary';

export function DashboardClient() {
  const { loading, players, alerts, stats } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      <DashboardKpiGrid players={players} stats={stats} itemVariant={item} />
      <DashboardAlerts alerts={alerts} itemVariant={item} />
      <DashboardCharts stats={stats} itemVariant={item} />
      <DashboardTeamSummary players={players} itemVariant={item} />
    </motion.div>
  );
}
