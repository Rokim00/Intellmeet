import React, { useState } from 'react';
import { Copy, Check, RefreshCw, X, Shield, Sparkles } from 'lucide-react';
import { regenerateInviteCode } from '@/api/organization/organization.api';

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  onGenerateNewCode: (newCode: string) => void;
}

export const InviteCodeModal: React.FC<InviteCodeModalProps> = ({
  isOpen,
  onClose,
  inviteCode,
  onGenerateNewCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setFeedback('');
    try {
      const res = await regenerateInviteCode();
      if (res.data?.data?.inviteCode) {
        onGenerateNewCode(res.data.data.inviteCode);
        setFeedback('New code generated and synced with server!');
      }
    } catch {
      setFeedback('Unable to generate an invite code. Please try again.');
    } finally {
      setGenerating(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#121214] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Organization Invite Code</h3>
              <p className="text-xs text-zinc-400">Share this code with team members to let them join.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current Invite Code Display */}
        <div className="rounded-md border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
            <span>Recent Active Code</span>
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Sparkles size={12} className="text-amber-400" /> Active
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 bg-[#0c0c0e] rounded-sm border border-zinc-800 px-4 py-3">
            <span className="font-mono text-xl font-bold tracking-widest text-emerald-400 select-all">
              {inviteCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="text-center text-xs text-emerald-400 font-medium bg-emerald-950/30 border border-emerald-800/40 py-1.5 rounded-sm">
            {feedback}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 rounded-sm border border-zinc-700 bg-zinc-800 hover:bg-zinc-700/80 text-white py-2.5 text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
            <span>{generating ? 'Generating Fresh Code...' : 'Generate New Invite Code'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-zinc-400 hover:text-white transition-colors py-1 cursor-pointer"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
