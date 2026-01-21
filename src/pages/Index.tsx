import { useState, useMemo } from 'react';
import { CollaborativeCanvas } from '@/components/canvas/CollaborativeCanvas';
import { USER_COLORS } from '@/types/canvas';

// Generate a random user ID and name
function generateUserId() {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateUserName() {
  const adjectives = ['Swift', 'Clever', 'Bright', 'Quick', 'Bold', 'Calm', 'Keen', 'Wise'];
  const nouns = ['Artist', 'Painter', 'Creator', 'Maker', 'Drawer', 'Sketcher', 'Designer'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

function getUserColor(userId: string) {
  // Use hash of userId to get consistent color
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

const Index = () => {
  const [userId] = useState(generateUserId);
  const [userName] = useState(generateUserName);
  const userColor = useMemo(() => getUserColor(userId), [userId]);

  // Use a fixed room ID for simplicity - could be made dynamic
  const roomId = 'main-canvas';

  return (
    <CollaborativeCanvas
      roomId={roomId}
      userId={userId}
      userName={userName}
      userColor={userColor}
    />
  );
};

export default Index;
