
import { BookOpen, TrendingUp, DollarSign, Users } from 'lucide-react';

const Stats = () => {
  const stats = [
    { label: "Books Tracked", value: "500K+", icon: BookOpen },
    { label: "Avg Profit Margin", value: "25%", icon: TrendingUp },
    { label: "Success Rate", value: "89%", icon: DollarSign },
    { label: "Active Users", value: "10K+", icon: Users }
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center group">
            <div className="mx-auto w-12 h-12 glass-panel rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <stat.icon className="w-6 h-6 text-neon-orange" />
            </div>
            <div className="text-3xl font-header text-white mb-1">{stat.value}</div>
            <div className="text-white/60 font-body">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
