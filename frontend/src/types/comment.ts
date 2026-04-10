export interface CommentAuthor {
  id: number;
  name: string;
  avatar: string | null;
}

export interface Comment {
  id: number;
  author: CommentAuthor;
  content: string;
  created_at: string;
}
