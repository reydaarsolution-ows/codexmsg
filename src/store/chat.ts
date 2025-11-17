"use client";
import { create } from 'zustand';

export type EncryptedPayload = { iv: string; ciphertext: string };
export type AttachmentMeta = { name: string; mime: string; size: number };
export type ChatMessage =
  | { id: string; from: string; ts: number; kind: 'text'; payload: EncryptedPayload }
  | { id: string; from: string; ts: number; kind: 'image' | 'video'; attachment: { meta: AttachmentMeta; data: EncryptedPayload } };

type State = {
  roomId?: string;
  messages: ChatMessage[];
  setRoom: (id: string) => void;
  addMessage: (m: ChatMessage) => void;
  removeMessage: (id: string) => void;
  clear: () => void;
};

export const useChatStore = create<State>((set) => ({
  messages: [],
  setRoom: (id) => set({ roomId: id, messages: [] }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  removeMessage: (id) => set((s) => ({ messages: s.messages.filter((x) => x.id !== id) })),
  clear: () => set({ roomId: undefined, messages: [] }),
}));
