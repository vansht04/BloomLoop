import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/lib/AppContext';
import Garden from '@/components/Garden';
import HabitForm from '@/components/HabitForm';
import HabitCard from '@/components/HabitCard';

export default function GardenDashboard() {
  const { habits } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Garden</h1>
          <p className="text-muted-foreground">Watch your habits grow into a beautiful garden</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <HabitForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-8">
        <Garden />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Active Habits</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
          {habits.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No habits yet. Create your first habit to start growing your garden!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
