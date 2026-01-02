import { useState } from 'react';
import { MessageSquare, Heart, Send, UserPlus, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp, type User } from '@/lib/AppContext';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

export default function SocialFeed() {
  const { currentUser, posts, addPost, likePost, addComment, friends, addFriend, allUsers, friendHabits, habits } = useApp();
  const [newPost, setNewPost] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [friendUsername, setFriendUsername] = useState('');
  const [friendSuggestions, setFriendSuggestions] = useState<User[]>([]);
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleCreatePost = () => {
    if (newPost.trim()) {
      addPost(newPost);
      setNewPost('');
      toast.success('Post created!');
    }
  };

  const handleAddComment = (postId: string) => {
    const content = commentInputs[postId];
    if (content?.trim()) {
      addComment(postId, content);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added!');
    }
  };

  const handleFriendInputChange = (value: string) => {
    setFriendUsername(value);
    if (value.trim()) {
      const suggestions = allUsers.filter(
        u =>
          u.id !== currentUser.id &&
          !friends.find(f => f.id === u.id) &&
          (u.username.toLowerCase().includes(value.toLowerCase()) ||
            u.displayName.toLowerCase().includes(value.toLowerCase()))
      );
      setFriendSuggestions(suggestions.slice(0, 5));
    } else {
      setFriendSuggestions([]);
    }
  };

  const handleSelectFriend = (username: string) => {
    setFriendUsername(username);
    setFriendSuggestions([]);
    handleAddFriend(username);
  };

  const handleAddFriend = (username?: string) => {
    const usernameToAdd = username || friendUsername;
    if (usernameToAdd.trim()) {
      const success = addFriend(usernameToAdd);
      if (success) {
        toast.success(`Added ${usernameToAdd} as a friend!`);
        setFriendUsername('');
        setFriendSuggestions([]);
      } else {
        toast.error('User not found or already a friend');
      }
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUserProfile(user);
    setShowUserProfile(true);
  };

  const getUserById = (userId: string) => {
    if (userId === currentUser.id) return currentUser;
    return allUsers.find(u => u.id === userId) || { id: userId, username: 'Unknown', displayName: 'Unknown User', avatar: '👤', bio: '' };
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getLeaderboardData = () => {
    const usersWithStats = allUsers.map(user => {
      const userHabits = user.id === currentUser.id ? habits : friendHabits[user.id] || [];
      const totalCheckIns = userHabits.reduce((sum, habit) => sum + habit.checkIns.length, 0);
      const completedHabits = userHabits.filter(habit => {
        const daysSinceCreation = Math.floor((Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return habit.checkIns.length >= habit.duration || daysSinceCreation >= habit.duration;
      }).length;
      const points = totalCheckIns * 10 + completedHabits * 100;
      return { user, totalCheckIns, completedHabits, points };
    });
    return usersWithStats.sort((a, b) => b.points - a.points);
  };

  const getUserStats = (user: User) => {
    const userHabits = user.id === currentUser.id ? habits : friendHabits[user.id] || [];
    const totalCheckIns = userHabits.reduce((sum, habit) => sum + habit.checkIns.length, 0);
    const completedHabits = userHabits.filter(habit => {
      const daysSinceCreation = Math.floor((Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return habit.checkIns.length >= habit.duration || daysSinceCreation >= habit.duration;
    }).length;
    const maxStreak = userHabits.reduce((max, habit) => Math.max(max, habit.checkIns.length), 0);
    return { userHabits, totalCheckIns, completedHabits, maxStreak };
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Social Feed</h1>
            <p className="text-muted-foreground">Connect with friends and share your progress</p>
          </div>
          <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Leaderboard
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {getLeaderboardData().map((entry, index) => (
                  <div
                    key={entry.user.id}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {index + 1}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-xl">{entry.user.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.user.displayName}</p>
                      <p className="text-sm text-muted-foreground">@{entry.user.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{entry.points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{entry.totalCheckIns} check-ins</p>
                      <p className="text-xs text-muted-foreground">{entry.completedHabits} completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Share your progress or thoughts..."
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              rows={3}
            />
            <Button onClick={handleCreatePost} className="w-full gap-2">
              <Send className="h-4 w-4" />
              Post
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Friend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter username..."
                    value={friendUsername}
                    onChange={e => handleFriendInputChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddFriend()}
                  />
                  {friendSuggestions.length > 0 && (
                    <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                      {friendSuggestions.map(user => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectFriend(user.username)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted"
                        >
                          <span className="text-xl">{user.avatar}</span>
                          <div>
                            <p className="font-medium">{user.displayName}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={() => handleAddFriend()} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Your Friends ({friends.length})</p>
              <div className="flex flex-wrap gap-2">
                {friends.map(friend => (
                  <Button
                    key={friend.id}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleUserClick(friend)}
                  >
                    <span>{friend.avatar}</span>
                    <span>{friend.displayName}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {posts.map(post => {
            const author = getUserById(post.userId);
            const isLiked = post.likes.includes(currentUser.id);

            return (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleUserClick(author)} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                      <Avatar>
                        <AvatarFallback className="text-2xl">{author.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{author.displayName}</p>
                        <p className="text-sm text-muted-foreground">@{author.username} · {formatTimestamp(post.timestamp)}</p>
                      </div>
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground">{post.content}</p>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likePost(post.id)}
                      className={`gap-2 ${isLiked ? 'text-primary' : ''}`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      {post.likes.length}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {post.comments.length}
                    </Button>
                  </div>

                  {post.comments.length > 0 && (
                    <div className="space-y-3 border-t pt-4">
                      {post.comments.map(comment => {
                        const commentAuthor = getUserById(comment.userId);
                        return (
                          <div key={comment.id} className="flex gap-3">
                            <button onClick={() => handleUserClick(commentAuthor)}>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-sm">{commentAuthor.avatar}</AvatarFallback>
                              </Avatar>
                            </button>
                            <div className="flex-1">
                              <div className="rounded-lg bg-muted p-3">
                                <p className="text-sm font-semibold">{commentAuthor.displayName}</p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <Button size="sm" onClick={() => handleAddComment(post.id)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
          <DialogContent className="max-w-2xl">
            {selectedUserProfile && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-2xl">{selectedUserProfile.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xl">{selectedUserProfile.displayName}</p>
                      <p className="text-sm font-normal text-muted-foreground">@{selectedUserProfile.username}</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{selectedUserProfile.bio}</p>
                  </div>
                  
                  <div>
                    <h3 className="mb-3 font-semibold">Statistics</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{getUserStats(selectedUserProfile).userHabits.length}</p>
                        <p className="text-sm text-muted-foreground">Active Habits</p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{getUserStats(selectedUserProfile).totalCheckIns}</p>
                        <p className="text-sm text-muted-foreground">Total Check-ins</p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{getUserStats(selectedUserProfile).maxStreak}</p>
                        <p className="text-sm text-muted-foreground">Best Streak</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 font-semibold">Habits</h3>
                    <div className="space-y-2">
                      {getUserStats(selectedUserProfile).userHabits.length > 0 ? (
                        getUserStats(selectedUserProfile).userHabits.map(habit => (
                          <div key={habit.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <p className="font-medium">{habit.name}</p>
                              <p className="text-sm text-muted-foreground">{habit.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{habit.checkIns.length}/{habit.duration} days</p>
                              <p className="text-xs text-muted-foreground">{Math.round((habit.checkIns.length / habit.duration) * 100)}% complete</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-sm text-muted-foreground">No active habits</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
