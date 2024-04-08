export type User = {
  username: string;
  name: string;
  isAdmin: boolean;
  id: number;
};

export type GameRoom = {
  admin: number;
  gameId: number;
  gamePin: number;
  gameToken: string;
  status: string;
  users: [User]
}
