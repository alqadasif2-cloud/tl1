import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Radio,
  Plus,
  CheckCircle2,
  Lock,
  Users,
  ShieldAlert,
  Send,
  ExternalLink,
} from 'lucide-react';
import { TelegramChat, AppScreenId } from '../types';

interface SourcesScreenProps {
  chats: TelegramChat[];
  onAddChat: (chat: TelegramChat) => void;
  onNavigate: (screen: AppScreenId) => void;
  isRtl: boolean;
  onSyncRealDialogs?: () => Promise<void>;
}

export const SourcesScreen: React.FC<SourcesScreenProps> = ({
  chats,
  onAddChat,
  onNavigate,
  isRtl,
  onSyncRealDialogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'sources' | 'destinations'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Chat Form
  const [newTitle, setNewTitle] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newType, setNewType] = useState<'CHANNEL' | 'SUPERGROUP' | 'GROUP'>('CHANNEL');
  const [canPost, setCanPost] = useState(false);

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chat.username && chat.username.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeTab === 'destinations') return chat.canPostMessages;
    return true;
  });

  const handleCreateChat = () => {
    if (!newTitle.trim()) return;
    const newChat: TelegramChat = {
      id: `-100${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      title: newTitle.trim(),
      username: newUsername.trim() || undefined,
      type: newType,
      canPostMessages: canPost,
      memberCount: 1,
    };
    onAddChat(newChat);
    setNewTitle('');
    setNewUsername('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <h2 className="text-sm font-bold text-white">
            {isRtl ? 'إدارة المصادر والوجهات' : 'Sources & Destinations'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {onSyncRealDialogs && (
            <button
              onClick={async () => {
                setIsSyncing(true);
                try {
                  await onSyncRealDialogs();
                } finally {
                  setIsSyncing(false);
                }
              }}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition-all"
            >
              <Send className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isRtl ? 'جار المزامنة...' : 'Syncing...') : isRtl ? 'مزامنة قنوات حسابي' : 'Sync My Chats'}</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إضافة محادثة' : 'Add Chat'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isRtl ? 'جميع المحادثات' : 'All Chats'} ({chats.length})
        </button>
        <button
          onClick={() => setActiveTab('destinations')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'destinations'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isRtl ? 'الوجهات (صلاحية النشر)' : 'Destinations (Writable)'}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-3 left-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isRtl ? 'البحث عن قناة أو مجموعة...' : 'Search by name or @username...'}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Chats List */}
      <div className="space-y-2.5">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white shrink-0">
                {chat.title[0]?.toUpperCase() || 'C'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{chat.title}</h4>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded uppercase font-semibold">
                    {chat.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                  {chat.username ? <span>@{chat.username}</span> : <span>ID: {chat.id}</span>}
                  <span>•</span>
                  <span>{chat.memberCount.toLocaleString()} {isRtl ? 'عضو' : 'members'}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              {chat.canPostMessages ? (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isRtl ? 'وجهة صالحة' : 'Writable'}</span>
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  <span>{isRtl ? 'مصدر فقط' : 'Source only'}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Chat Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">
              {isRtl ? 'إضافة قناة أو محادثة جديدة' : 'Add New Telegram Chat'}
            </h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                {isRtl ? 'اسم القناة أو المجموعة:' : 'Chat Title:'}
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                placeholder="e.g. VIP Forex Private Channel"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                {isRtl ? 'المعرف (Username) أو الرابط:' : 'Username (@handle) optional:'}
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.replace('@', ''))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                placeholder="vip_channel_name"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">{isRtl ? 'نوع المحادثة:' : 'Chat Type:'}</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="CHANNEL">Channel (قناة)</option>
                <option value="SUPERGROUP">Supergroup (مجموعة فائقة)</option>
                <option value="GROUP">Group (مجموعة عادية)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={canPost}
                onChange={(e) => setCanPost(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>{isRtl ? 'أملك صلاحية النشر في هذه القناة (صالحة كوجهة)' : 'I have posting rights here (Valid as Destination)'}</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleCreateChat}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow"
              >
                {isRtl ? 'حفظ المحادثة' : 'Save Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
