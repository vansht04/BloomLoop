import { useState } from 'react';
import { Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/lib/AppContext';
import { toast } from 'sonner';

export default function Profile() {
  const { currentUser, updateCurrentUser, achievements, habits } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(currentUser);

  const handleSave = () => {
    updateCurrentUser(editedUser);
    setIsEditing(false);
    toast.success('Profile updated!');
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalCheckIns = habits.reduce((sum, habit) => sum + habit.checkIns.length, 0);

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile</CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <Button size="sm" onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full"
                style={{ backgroundColor: editedUser.backgroundColor || '#e8f5e9' }}
              >
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-transparent text-4xl">{editedUser.avatar}</AvatarFallback>
                </Avatar>
              </div>
              {isEditing && (
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <Label>Avatar Emoji</Label>
                    <Input
                      value={editedUser.avatar}
                      onChange={e => setEditedUser(prev => ({ ...prev, avatar: e.target.value }))}
                      placeholder="Enter emoji"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={editedUser.backgroundColor || '#e8f5e9'}
                        onChange={e => setEditedUser(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="h-10 w-20"
                      />
                      <Input
                        value={editedUser.backgroundColor || '#e8f5e9'}
                        onChange={e => setEditedUser(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        placeholder="#e8f5e9"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                {isEditing ? (
                  <Input
                    value={editedUser.displayName}
                    onChange={e => setEditedUser(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                ) : (
                  <p className="text-lg font-semibold">{currentUser.displayName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Username</Label>
                {isEditing ? (
                  <Input
                    value={editedUser.username}
                    onChange={e => setEditedUser(prev => ({ ...prev, username: e.target.value }))}
                  />
                ) : (
                  <p className="text-muted-foreground">@{currentUser.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                {isEditing ? (
                  <Textarea
                    value={editedUser.bio}
                    onChange={e => setEditedUser(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <p className="text-foreground">{currentUser.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold text-primary">{habits.length}</p>
                <p className="text-sm text-muted-foreground">Active Habits</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold text-primary">{totalCheckIns}</p>
                <p className="text-sm text-muted-foreground">Total Check-ins</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold text-primary">{unlockedAchievements.length}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unlocked Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {unlockedAchievements.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {unlockedAchievements.map(achievement => (
                  <div key={achievement.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <img src={achievement.icon} alt={achievement.name} className="h-12 w-12 object-contain" />
                    <div>
                      <p className="font-semibold">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No achievements unlocked yet. Keep building your habits!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
