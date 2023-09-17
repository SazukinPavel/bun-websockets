import { User } from ".";

export class ChatMessage {
  private owner: User | null;
  private message: string;
  private createdAt: number;

  constructor(message: string, owner?: User) {
    this.message = message;
    this.createdAt = Math.floor(new Date().getTime() / 1000);
    this.owner = owner || null;
  }
}
