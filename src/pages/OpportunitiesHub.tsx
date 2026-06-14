import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import PublicOpportunitiesList from '../components/PublicOpportunitiesList';

export default function OpportunitiesHub() {
  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="relative overflow-hidden bg-secondary px-6 pb-14 pt-10">
        <div className="absolute left-0 top-0 h-64 w-64 -translate-x-32 -translate-y-32 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-32 translate-y-32 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black leading-tight text-white md:text-4xl">مستقبلك يبدأ هنا</h1>
            <p className="mb-6 text-xs font-black uppercase italic tracking-widest text-primary">Your Future Starts Here</p>
            <p className="mx-auto max-w-md text-sm font-medium text-white/60">
              فرص عامة معتمدة من قاعدة بيانات رافد: وظائف، تدريب، منح، فعاليات، وإعلانات.
            </p>
          </motion.div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white/70">
            <Search size={14} className="text-primary" />
            <span>Real backend opportunities</span>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-8 max-w-xl px-4">
        <PublicOpportunitiesList compact />
      </div>
    </div>
  );
}
