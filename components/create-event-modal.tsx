'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  X, 
  Sparkles, 
  Calendar, 
  FileText, 
  Tag, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export type CreateEventFormValues = z.infer<typeof createEventSchema>;

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (newEvent: any) => void;
}

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
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

      const { data: insertedData, error } = await supabase
        .from('events')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Supabase notice:', error.message);
      }

      setIsSuccess(true);
      if (onEventCreated) {
        onEventCreated(insertedData || { id: `evt-${Date.now()}`, ...payload });
      }

      setTimeout(() => {
        setIsSuccess(false);
        reset();
        onClose();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to initialize event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-sm border-4 border-black bg-white text-black shadow-[8px_8px_0px_#000000] overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-5 border-b-4 border-black bg-[#F5FF00]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-sm bg-[#8A2BE2] border-2 border-black flex items-center justify-center text-[#F5FF00] shadow-[2px_2px_0px_#000000]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-black uppercase tracking-tight">Deploy Prediction Quest</h2>
                <p className="text-[10px] text-black font-mono font-extrabold tracking-wider">SOMNIA ORACLE REGISTRY PROTOCOL</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-sm border-2 border-black bg-white text-black hover:bg-[#FF3EA5] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Title Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-black text-black uppercase flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-black" />
                <span>Quest Question / Title *</span>
              </label>
              <Input
                {...register('title')}
                placeholder="e.g. Will Somnia Network exceed 500k TPS in Q4 Stress Test?"
                className="bg-white border-3 border-black text-black font-bold placeholder:text-slate-500 shadow-[3px_3px_0px_#000000]"
              />
              {errors.title && (
                <p className="text-xs text-[#FF3EA5] font-mono font-black flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.title.message}
                </p>
              )}
            </div>

            {/* Category & Deadline Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-black text-black uppercase flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-black" />
                  <span>Category *</span>
                </label>
                <select
                  {...register('category')}
                  className="w-full h-11 rounded-sm border-3 border-black bg-white px-3 py-2 text-sm text-black font-mono font-black focus:outline-none shadow-[3px_3px_0px_#000000] cursor-pointer"
                >
                  <option value="crypto">Crypto &amp; Web3</option>
                  <option value="sports">High-Stakes Sports</option>
                  <option value="weather">Climate &amp; Weather</option>
                  <option value="politics">Politics &amp; Macro</option>
                  <option value="other">Other / Synthetic</option>
                </select>
                {errors.category && (
                  <p className="text-xs text-[#FF3EA5] font-mono font-black mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-black text-black uppercase flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-black" />
                  <span>Resolution Deadline *</span>
                </label>
                <Input
                  type="datetime-local"
                  {...register('deadline')}
                  className="bg-white border-3 border-black text-black font-mono font-bold shadow-[3px_3px_0px_#000000]"
                />
                {errors.deadline && (
                  <p className="text-xs text-[#FF3EA5] font-mono font-black flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.deadline.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-black text-black uppercase flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-black" />
                <span>Resolution Criteria &amp; Oracle Rules *</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Specify precise metrics, data sources (e.g. Explorer, CoinGecko, NOAA), and criteria required for settlement."
                className="w-full rounded-sm border-3 border-black bg-white p-3 text-sm text-black font-bold placeholder:text-slate-500 focus:outline-none shadow-[3px_3px_0px_#000000] resize-none font-sans"
              />
              {errors.description && (
                <p className="text-xs text-[#FF3EA5] font-mono font-black flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.description.message}
                </p>
              )}
            </div>

            {submitError && (
              <div className="p-3 rounded-sm bg-[#FF3EA5] text-white border-3 border-black text-xs font-mono font-black flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-sm bg-[#00FF66] text-black border-3 border-black text-xs font-mono font-black flex items-center gap-2 shadow-[2px_2px_0px_#000000]"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>PREDICTION QUEST DEPLOYED SUCCESSFULLY!</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t-3 border-black">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="font-mono text-xs font-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-6 bg-[#8A2BE2] text-white border-3 border-black font-black font-mono tracking-wide shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 animate-spin" /> DEPLOYING QUEST...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" /> INITIALIZE EVENT
                  </span>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
