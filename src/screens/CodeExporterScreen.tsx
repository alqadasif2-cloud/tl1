import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  Code2,
  FileCode,
  FolderTree,
  Terminal,
  ExternalLink,
  Github,
  Sparkles,
} from 'lucide-react';
import { AppScreenId } from '../types';
import { ANDROID_FILES, downloadAndroidProjectZip } from '../services/zipExporter';

interface CodeExporterScreenProps {
  onNavigate: (screen: AppScreenId) => void;
  isRtl: boolean;
}

export const CodeExporterScreen: React.FC<CodeExporterScreenProps> = ({
  onNavigate,
  isRtl,
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(ANDROID_FILES[3].path); // app/build.gradle.kts default
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedFile = ANDROID_FILES.find((f) => f.path === selectedFilePath) || ANDROID_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setIsDownloading(false);
    }
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
          <div>
            <h2 className="text-sm font-bold text-white">
              {isRtl ? 'مشروع أندرويد الكامل وبناء APK' : 'Native Android Source & APK Export'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {isRtl ? 'كود Kotlin الأصلي وجاهز لـ Android Studio و GitHub Actions' : 'Full Kotlin project ready for Android Studio & CI/CD'}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? (isRtl ? 'جار التحزيم...' : 'Bundling...') : isRtl ? 'تحميل المشروع ZIP' : 'Download ZIP'}</span>
        </button>
      </div>

      {/* APK & Build Instructions Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-blue-400 font-bold">
          <Terminal className="w-4 h-4" />
          <span>{isRtl ? 'أوامر بناء APK السريعة:' : 'How to build the APK:'}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1">
          <div><span className="text-slate-500"># 1. Open in Android Studio or Terminal:</span></div>
          <div>cd android</div>
          <div><span className="text-slate-500"># 2. Compile Debug APK:</span></div>
          <div>./gradlew assembleDebug</div>
          <div><span className="text-slate-500"># Output: app/build/outputs/apk/debug/app-debug.apk</span></div>
        </div>
        <p className="text-[11px] text-slate-400">
          {isRtl
            ? 'يتضمن المشروع ملف .github/workflows/build-apk.yml للبناء التلقائي عند الرفع لـ GitHub واستخراج الـ APK فوراً كـ Artifact.'
            : 'Pre-configured GitHub Actions workflow automatically builds the APK artifact on every push.'}
        </p>
      </div>

      {/* File Explorer & Code Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* File Tabs / Selector */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {ANDROID_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFilePath(file.path)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedFilePath === file.path
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-850'
                }`}
              >
                <FileCode className="w-3 h-3 shrink-0" />
                <span>{file.path.split('/').pop()}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs shrink-0"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Current File Path */}
        <div className="px-4 py-1.5 bg-slate-950 border-b border-slate-850 text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span>{selectedFile.path}</span>
          <span className="text-[10px] text-slate-500">
            {selectedFile.content.split('\n').length} lines
          </span>
        </div>

        {/* Code Content */}
        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] bg-slate-950/40 leading-relaxed selection:bg-blue-600/30">
          {selectedFile.content}
        </pre>
      </div>
    </div>
  );
};
