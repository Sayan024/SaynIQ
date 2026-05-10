import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color = "purple" }) => {
  const colorMap = {
    purple: "text-premium-lightPurple bg-premium-purple/10",
    green: "text-emerald-400 bg-emerald-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    orange: "text-orange-400 bg-orange-500/10"
  };

  return (
    <div className="glass-card p-6 hover:border-premium-purple/30 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
          
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-400">
            <TrendingUp size={14} />
            <span>{trend} vs last month</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-xl ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
