import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp, type Habit, type PlantType } from '@/lib/AppContext';
import { toast } from 'sonner';

interface HabitFormProps {
  habit?: Habit;
  onSuccess: () => void;
}

export default function HabitForm({ habit, onSuccess }: HabitFormProps) {
  const { addHabit, updateHabit } = useApp();
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [duration, setDuration] = useState(habit?.duration.toString() || '21');
  const [plantType, setPlantType] = useState<PlantType>(habit?.plantType || 'sunflower');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    const durationNum = parseInt(duration);
    if (durationNum < 7 || durationNum > 30) {
      toast.error('Duration must be between 7 and 30 days');
      return;
    }

    if (habit) {
      updateHabit(habit.id, {
        name,
        description,
        duration: durationNum,
        plantType,
      });
      toast.success('Habit updated!');
    } else {
      addHabit({
        name,
        description,
        duration: durationNum,
        plantType,
        position: {
          x: Math.random() * 500 + 50,
          y: Math.random() * 400 + 50,
        },
      });
      toast.success('Habit created! 🌱');
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Habit Name</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Morning Meditation"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your habit..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (days)</Label>
        <Input
          id="duration"
          type="number"
          min="7"
          max="30"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">Choose between 7-30 days</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="plantType">Plant Type</Label>
        <Select value={plantType} onValueChange={value => setPlantType(value as PlantType)}>
          <SelectTrigger id="plantType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sunflower">🌻 Sunflower</SelectItem>
            <SelectItem value="rose">🌹 Rose</SelectItem>
            <SelectItem value="cactus">🌵 Cactus</SelectItem>
            <SelectItem value="fern">🌿 Fern</SelectItem>
            <SelectItem value="tulip">🌷 Tulip</SelectItem>
            <SelectItem value="orchid">🌺 Orchid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        {habit ? 'Update Habit' : 'Create Habit'}
      </Button>
    </form>
  );
}
