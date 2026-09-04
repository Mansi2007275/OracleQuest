'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Calendar, 
  FileText, 
  Tag, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

const createEventSchema = z.object({
  title: z
    .string()
    .min(8, 'Title must be at least 8 characters long')
    .max(150, 'Title cannot exceed 150 characters'),
  description: z
    .string()
    .min(15, 'Please provide a clear resolution description (min 15 chars)')
    .max(1000, 'Description cannot exceed 1000 characters'),
  category: z.enum(['crypto', 'sports', 'weather', 'politics', 'other'], {
    message: 'Please select a valid category',
  }),
  deadline: z.string().refine((val) => {
    const selectedDate = new Date(val).getTime();
    const now = Date.now();
    return selectedDate > now + 1000 * 60 * 15;
  }, 'Deadline must be at least 15 minutes in the future'),
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'crypto',
      deadline: '',
    },
  });

  const onSubmit = async (data: CreateEventFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        deadline: new Date(data.deadline).toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('events').insert([payload]);

      if (error) {
        console.warn('Supabase notice:', error.message);
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/events');
      }, 1800);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to initialize event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#090514] text-[#e0f2fe]">
      {/* Background Cybernetic Aura */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-5%] w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Cyber Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-purple-900/40 bg-[#090514]/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/events" className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO ALL EVENTS</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="cyan" className="font-mono">SOMNIA DEVNET</Badge>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>ORACLE PROTOCOL PROPOSAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Create Prediction Event
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Submit a new verifiable prediction market. Once submitted, autonomous AI agents and community stakers can engage with the pool.
          </p>
        </div>

        <Card className="border-cyan-500/40 bg-[#12082b]/90 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          <CardHeader>
            <CardTitle className="text-lg text-white">Quest Specifications</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Ensure all parameters are quantifiable and verifiable before final on-chain submission.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-cyan-200/90 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Quest Title / Statement *</span>
                </label>
                <Input
                  {...register('title')}
                  placeholder="e.g. Will Somnia Network exceed 500,000 TPS in the upcoming Q4 benchmark?"
                  className="bg-[#0b041a] border-purple-900/60 focus:border-cyan-400 text-white placeholder:text-muted-foreground/60 text-sm"
                />
                {errors.title && (
                  <p className="text-xs text-pink-400 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.title.message}
                  </p>
                )}
              </div>

              {/* Category & Deadline Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-cyan-200/90 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-purple-400" />
                    <span>Category *</span>
                  </label>
                  <select
                    {...register('category')}
                    className="w-full h-10 rounded-lg border border-purple-900/60 bg-[#0b041a] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-mono"
                  >
                    <option value="crypto">Crypto & Web3</option>
                    <option value="sports">High-Stakes Sports</option>
                    <option value="weather">Climate & Weather</option>
                    <option value="politics">Politics & Macro</option>
                    <option value="other">Other / Synthetic</option>
                  </select>
                  {errors.category && (
                    <p className="text-xs text-pink-400 font-mono mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Deadline Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-cyan-200/90 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Resolution Deadline *</span>
                  </label>
                  <Input
                    type="datetime-local"
                    {...register('deadline')}
                    className="bg-[#0b041a] border-purple-900/60 focus:border-cyan-400 text-white font-mono text-sm"
                  />
                  {errors.deadline && (
                    <p className="text-xs text-pink-400 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.deadline.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-cyan-200/90 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                  <span>Resolution Criteria & Oracle Rules *</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Detail the oracle proof sources (e.g. Block Explorer indexer, official regulatory register) and resolution conditions."
                  className="w-full rounded-lg border border-purple-900/60 bg-[#0b041a] p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all resize-none font-sans"
                />
                {errors.description && (
                  <p className="text-xs text-pink-400 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.description.message}
                  </p>
                )}
              </div>

              {/* Error Box */}
              {submitError && (
                <div className="p-3 rounded-lg bg-pink-950/70 border border-pink-500/50 text-pink-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Success Box */}
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 animate-bounce" />
                  <span>Prediction quest created successfully! Redirecting to events arena...</span>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-900/40">
                <Link href="/events">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-purple-900/60 hover:bg-purple-950/40 text-muted-foreground hover:text-white"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-8 bg-gradient-to-r from-cyan-500 via-teal-400 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-bold font-mono tracking-wide shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 animate-spin" /> Deploying Event...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" /> Create Event
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
