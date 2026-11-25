import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: IconComponent,
  trend,
  trendType = 'up',
  subtitle,
  iconBg = 'var(--color-primary-light)',
  iconColor = 'var(--color-primary)'
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{title}</span>
        {IconComponent && (
          <div className="stat-icon-wrapper" style={{ backgroundColor: iconBg, color: iconColor }}>
            <IconComponent size={22} />
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-footer">
        {trend && (
          <span className={`stat-trend ${trendType === 'up' ? 'trend-up' : 'trend-down'}`}>
            {trendType === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
};

export default StatCard;

