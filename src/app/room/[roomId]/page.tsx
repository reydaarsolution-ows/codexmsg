"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import { getSocket } from '@/lib/socket';
import { useChatStore, type ChatMessage } from '@/store/chat';
import { deriveKeyFromString, encryptMessage, decryptMessage, encryptBytes, decryptBytes } from '@/lib/crypto';
import { ShareModal } from '@/components/ShareModal';
import { AnimatePresence, motion } from 'framer-motion';

export default function RoomPage() {
  const params = useParams();
  const roomId = String((params as any)?.roomId || '');
  const { setRoom, addMessage, removeMessage, messages } = useChatStore();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('connecting...');
  const [shareOpen, setShareOpen] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string>('--:--');
  const [selfId, setSelfId] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const keyPromise = useMemo(() => deriveKeyFromString(roomId || 'dev'), [roomId]); // TODO: replace with secure key exchange

  useEffect(() => {
    if (!roomId) return;
    setRoom(roomId);
    const socket = getSocket();
    const applyExpiry = (createdAt?: number, ttl?: number, expires?: number) => {
      if (expires) {
        setExpiresAt(expires);
        return;
      }
      if (createdAt && ttl) {
        setExpiresAt(createdAt + ttl * 1000);
      }
    };

    socket.emit('join-room', { roomId });
    const onJoined = (payload: any) => {
      setStatus('connected');
      setSelfId(socket.id || '');
      if (payload?.participants) setParticipantCount(Number(payload.participants));
      const settings = payload?.settings;
      applyExpiry(settings?.createdAt, settings?.ttl, payload?.expiresAt);
    };
    const onNewMessage = async (evt: any) => {
      // evt: { id, ts, from, message }
      const msg = evt?.message;
      const common = { id: String(evt?.id || ''), from: String(evt?.from || ''), ts: Number(evt?.ts || Date.now()) };
      if (msg?.kind === 'text' && msg?.payload?.iv && msg?.payload?.ciphertext) {
        addMessage({ ...common, kind: 'text', payload: msg.payload });
      } else if ((msg?.kind === 'image' || msg?.kind === 'video') && msg?.attachment?.data?.iv) {
        addMessage({ ...common, kind: msg.kind, attachment: msg.attachment });
      } else if (msg?.iv && msg?.ciphertext) {
        // backward compatibility: treat as text
        addMessage({ ...common, kind: 'text', payload: msg });
      }
    };
    const onBurned = ({ id }: { id: string }) => removeMessage(id);
    const onCount = ({ count }: { count: number }) => setParticipantCount(count);
    const onConnect = () => setSelfId(socket.id || '');
    socket.on('room-joined', onJoined);
    socket.on('new-message', onNewMessage);
    socket.on('message-burned', onBurned);
    socket.on('participant-count', onCount);
    socket.on('connect', onConnect);

    // Fetch room info as fallback for expiry/count
    (async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
        const res = await fetch(`${apiBase}/api/room/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data.participants === 'number') setParticipantCount(data.participants);
          if (typeof data.expiresAt === 'number') setExpiresAt(data.expiresAt);
        }
      } catch {}
    })();

    // Countdown interval
    let timer: any;
    timer = setInterval(() => {
      if (!expiresAt) return;
      const ms = Math.max(0, expiresAt - Date.now());
      const totalSec = Math.floor(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      setCountdown(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);

    return () => {
      socket.off('room-joined', onJoined);
      socket.off('new-message', onNewMessage);
      socket.off('message-burned', onBurned);
      socket.off('participant-count', onCount);
      socket.off('connect', onConnect);
      if (timer) clearInterval(timer);
    };
  }, [roomId, setRoom, addMessage, removeMessage, expiresAt]);

  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    try {
      setSending(true);
      const key = await keyPromise;
      const payload = await encryptMessage(key, text);
      const socket = getSocket();
      socket.emit('send-message', { roomId, message: { kind: 'text', payload } });
      setInput('');
    } finally {
      setSending(false);
    }
  };

  const onSelectFile = useCallback(async (file: File) => {
    if (!file) return;
    if (!/^image\//.test(file.type) && !/^video\//.test(file.type)) {
      alert('Only images and videos are supported');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('File too large (max 8MB)');
      return;
    }
    const ab = await file.arrayBuffer();
    const key = await keyPromise;
    const data = await encryptBytes(key, ab);
    const socket = getSocket();
    const kind = /^image\//.test(file.type) ? 'image' : 'video';
    socket.emit('send-message', {
      roomId,
      message: { kind, attachment: { meta: { name: file.name, mime: file.type, size: file.size }, data } },
    });
  }, [keyPromise, roomId]);

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-3xl flex min-h-dvh flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b backdrop-blur px-4 py-3" style={{ background: 'var(--background)', borderColor: 'color-mix(in oklab, var(--foreground) 12%, transparent)' }}>
          <h1 className="text-xl font-semibold">Room: <span className="font-mono">{roomId}</span></h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400 hidden sm:inline">{status}</span>
            <span className="inline-flex items-center gap-1 rounded-md neo-surface neo-inset px-2 py-1 text-xs" title="Participants">
              👥 {participantCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md neo-surface neo-inset px-2 py-1 text-xs" title="Room expires in">
              ⏳ {countdown}
            </span>
            <button
              onClick={() => setShareOpen(true)}
              className="neo-btn px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white"
              aria-label="Share room"
            >Share</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto rounded-none sm:rounded-lg p-3 pb-28 space-y-2 neo-surface neo-inset" role="log" aria-live="polite">
          {messages.length === 0 && (
            <div className="text-neutral-500 text-sm">No messages yet.</div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22 }}
              >
                <MessageItem msg={m} roomId={roomId} selfId={selfId} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 left-0 right-0 z-10 border-t backdrop-blur px-3 py-3 [padding-bottom:calc(env(safe-area-inset-bottom)+0.75rem)]" style={{ background: 'var(--background)', borderColor: 'color-mix(in oklab, var(--foreground) 12%, transparent)' }}>
          <div className="flex items-end gap-2">
            <button
              onClick={() => setShowEmoji((s) => !s)}
              title="Emoji"
              className="neo-btn px-3 py-2"
              aria-label="Emoji"
            >😊</button>
            <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={(e) => onSelectFile(e.target.files?.[0]!) } />
            <button
              onClick={() => fileRef.current?.click()}
              title="Attach image/video"
              className="neo-btn px-3 py-2"
              aria-label="Attach"
            >📎</button>
            <input
              className="flex-1 neo-inset neo-surface rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Type a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSend();
              }}
              aria-label="Message input"
            />
            <button
              disabled={sending}
              className="neo-btn bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white"
              onClick={onSend}
            >
              Send
            </button>
          </div>
        </div>

        {showEmoji && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 neo-surface neo-inset rounded-md p-2 grid grid-cols-8 sm:grid-cols-10 gap-1 text-xl shadow-lg">
            {COMMON_EMOJIS.map((e) => (
              <button key={e} className="hover:bg-neutral-800 rounded" onClick={() => setInput((s) => s + e)} aria-label={`Insert ${e}`}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} url={typeof window !== 'undefined' ? window.location.href : ''} />
    </div>
  );
}

function MessageItem({ msg, roomId, selfId }: { msg: ChatMessage; roomId: string; selfId: string }) {
  const [text, setText] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [burning, setBurning] = useState(false);
  const name = useMemo(() => makeDisplayName(msg.from), [msg.from]);
  const color = useMemo(() => colorForId(msg.from), [msg.from]);
  const isSelf = msg.from === selfId;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const key = await deriveKeyFromString(roomId || 'dev');
        if (msg.kind === 'text') {
          const t = await decryptMessage(key, msg.payload);
          if (mounted) setText(DOMPurify.sanitize(t));
        } else {
          const ab = await decryptBytes(key, msg.attachment.data);
          const blob = new Blob([ab], { type: msg.attachment.meta.mime });
          const url = URL.createObjectURL(blob);
          if (mounted) setMediaUrl(url);
        }
      } catch (e) {
        if (mounted) {
          if (msg.kind === 'text') setText('[decryption failed]');
        }
      }
    })();
    return () => {
      mounted = false;
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg, roomId]);

  const burn = () => {
    setBurning(true);
    setTimeout(() => {
      getSocket().emit('message-burned', { roomId, id: msg.id });
    }, 250);
  };

  return (
    <div className={`group rounded-lg border border-neutral-700/70 px-4 py-3 ${burning ? 'opacity-60 blur-[1px] transition-all duration-200' : 'bg-neutral-900/90'} text-neutral-100 hover:border-neutral-600 hover:shadow-md transition-colors`}>
      <div className="flex items-center justify-between gap-2 text-[11px] md:text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="grid place-items-center size-6 rounded-full font-semibold text-[10px]" style={{ background: color }} title={name}>
            {initials(name)}
          </div>
          <span className="text-neutral-100">{isSelf ? `${name} (you)` : name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-neutral-400/80">{new Date(msg.ts).toLocaleTimeString()}</span>
          <button onClick={burn} className="text-neutral-500 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 rounded-sm" title="Burn message" aria-label="Burn">🗑️</button>
        </div>
      </div>
      <div className="mt-2">
        {msg.kind === 'text' ? (
          <div className="whitespace-pre-wrap break-words text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
        ) : msg.kind === 'image' ? (
          mediaUrl ? <img src={mediaUrl} alt={msg.attachment.meta.name} className="max-h-80 max-w-full h-auto rounded" /> : <div className="text-neutral-500">Decrypting image…</div>
        ) : (
          mediaUrl ? (
            <video src={mediaUrl} className="max-h-80 max-w-full h-auto rounded" controls preload="metadata" />
          ) : (
            <div className="text-neutral-500">Decrypting video…</div>
          )
        )}
      </div>
    </div>
  );
}

const COMMON_EMOJIS = [
  '😀','😂','😊','😍','😘','😎','🤩','😇','😉','🥳',
  '👍','🙏','👏','🔥','💯','✨','🎉','🎈','🫶','🤝',
  '🤔','🙃','😴','😅','😭','😡','🤗','🤭','🥺','😏',
  '🍕','🍔','🍰','🍫','☕','🍵','🍺','🍻','🎁','❤️',
];

// ————— Avatar/Name helpers —————
function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h >>> 0);
}

const ADJ = ['Calm','Brave','Swift','Merry','Quiet','Bright','Sly','Noble','Witty','Bold','Lucky','Keen','Neat','Kind'];
const ANIM = ['Fox','Owl','Hawk','Wolf','Bear','Lynx','Deer','Puma','Crane','Seal','Mink','Crow','Swan','Koala'];

function makeDisplayName(id: string): string {
  const h = hashId(id);
  const a = ADJ[h % ADJ.length];
  const b = ANIM[Math.floor(h / 7) % ANIM.length];
  return `${a} ${b}`;
}

function initials(name: string): string {
  const parts = name.split(' ');
  return (parts[0][0] || '') + (parts[1]?.[0] || '');
}

function colorForId(id: string): string {
  const h = hashId(id) % 360;
  // pastel-ish background using HSL
  return `hsl(${h} 70% 25% / 0.9)`;
}
