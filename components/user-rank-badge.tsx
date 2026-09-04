'use client';

import * as React from 'react';
import { Shield, Cpu, Zap, Sparkles } from 'lucide-react';
import { UserRank, getRankTitle } from '@/lib/xp';

interface UserRankBadgeProps {
  rank?: UserRank | string;
  level?: number;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserRankBadge({
  rank,
  level,
  showLevel = true,
  size = 'md',
  className = '',
}: UserRankBadgeProps) {
  const resolvedRank: UserRank = rank
    ? (rank as UserRank)
    : level
    ? getRankTitle(level)
    : 'Beginner';

  const rankConfig = {
    Beginner: {
      label: 'Beginner',
      levelRange: 'Lv 1-3',
      icon: Shield,
      classes: 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000000]',
      iconColor: 'text-slate-800',
    },
    Analyst: {
      label: 'Analyst',
      levelRange: 'Lv 4-7',
      icon: Cpu,
      classes: 'border-2 border-black bg-[#00F0FF] text-black shadow-[2px_2px_0px_#000000]',
      iconColor: 'text-black',
    },
    Strategist: {
      label: 'Strategist',
      levelRange: 'Lv 8-12',
      icon: Zap,
      classes: 'border-2 border-black bg-[#FF3EA5] text-white shadow-[2px_2px_0px_#000000]',
      iconColor: 'text-white',
    },
    Oracle: {
      label: 'Oracle',
      levelRange: 'Lv 13+',
      icon: Sparkles,
      classes: 'border-2 border-black bg-[#F5FF00] text-black shadow-[3px_3px_0px_#000000]',
      iconColor: 'text-black',
    },
  }[resolvedRank] || {
    label: 'Beginner',
    levelRange: 'Lv 1-3',
    icon: Shield,
    classes: 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000000]',
    iconColor: 'text-black',
  };

  const IconComponent = rankConfig.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-black',
  }[size];

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-sm font-mono font-black tracking-wider uppercase select-none ${rankConfig.classes} ${sizeClasses} ${className}`}
    >
      <IconComponent className={`${iconSizes} ${rankConfig.iconColor}`} />
      <span>{rankConfig.label}</span>
      {showLevel && level !== undefined && (
        <span className="font-extrabold pl-0.5">
          (LV.{level})
        </span>
      )}
    </span>
  );
}

