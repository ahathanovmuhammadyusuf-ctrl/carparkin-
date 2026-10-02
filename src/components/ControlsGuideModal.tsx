import React from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Disc, Camera, CheckCircle2 } from 'lucide-react';

interface ControlsGuideModalProps {
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col gap-6 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-hud text-white tracking-wide">
              HOW TO PLAY & CONTROLS
            </h2>
            <p className="text-xs text-slate-400">Master precision driving and parking mechanics</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-95 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Controls Diagram */}
        <div>
          <h3 className="text-xs font-bold font-hud text-sky-400 tracking-wider mb-3">KEYBOARD CONTROLS (PC)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex gap-1 font-mono font-bold text-slate-200">
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">W</kbd>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded"><ArrowUp className="w-3.5 h-3.5" /></kbd>
              </div>
              <span className="text-slate-300">Accelerate Forward (Drive)</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex gap-1 font-mono font-bold text-slate-200">
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">S</kbd>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded"><ArrowDown className="w-3.5 h-3.5" /></kbd>
              </div>
              <span className="text-slate-300">Brake / Reverse (Reverse Gear)</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex gap-1 font-mono font-bold text-slate-200">
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">A</kbd>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">D</kbd>
              </div>
              <span className="text-slate-300">Steer Left / Right</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex gap-1 font-mono font-bold text-slate-200">
                <kbd className="px-3 py-1 bg-slate-800 border border-slate-700 rounded">SPACE</kbd>
              </div>
              <span className="text-slate-300">Handbrake (Lock Wheels)</span>
            </div>
          </div>
        </div>

        {/* Camera & Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-3">
            <Camera className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-200">Camera View</div>
              <div className="text-slate-400 text-[11px]">Toggle Chase, Top-Down, or Hood cam with HUD button</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-3">
            <Disc className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-200">Touch Controls</div>
              <div className="text-slate-400 text-[11px]">On-screen steering and pedals automatically ready for mobile</div>
            </div>
          </div>
        </div>

        {/* Pro Parking Tips */}
        <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-900/50 space-y-2 text-xs">
          <div className="font-hud font-bold text-sky-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            PARKING OBJECTIVES & SCORING
          </div>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            <li><strong className="text-white">Hold Still:</strong> Bring the car to a complete stop inside the green parking zone for 0.8s to lock your parking score.</li>
            <li><strong className="text-white">Angle & Centering:</strong> The straighter and more centered you are, the higher your accuracy percentage and star rating.</li>
            <li><strong className="text-white">Avoid Crashes:</strong> You have 3 lives. Colliding with barriers or parked cars deducts a life and penalizes your score!</li>
            <li><strong className="text-white">Top-Down Cam:</strong> Switch to Top-Down camera during tight parallel parking to see clearances easily.</li>
          </ul>
        </div>

        {/* Close CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-hud font-bold text-sm transition-all active:scale-95 cursor-pointer"
        >
          GOT IT, LET'S DRIVE!
        </button>
      </div>
    </div>
  );
};
