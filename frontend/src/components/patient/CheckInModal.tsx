import React, { useState } from 'react';
import { X, CheckCircle, Clock, Stethoscope, AlertTriangle, User, Calendar } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWaitTime: number;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  currentWaitTime,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [symptom, setSymptom] = useState('Chest Discomfort / Shortness of Breath');
  const [severity, setSeverity] = useState(3);
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Estimate wait time based on severity multiplier
    // Higher severity (4-5) gets priority triage -> lower wait
    const multiplier = severity >= 4 ? 0.35 : severity === 3 ? 0.75 : 1.1;
    const calculatedWait = Math.max(8, Math.round(currentWaitTime * multiplier));

    setEstimatedWait(calculatedWait);
    setStep('success');
  };

  const handleReset = () => {
    setStep('form');
    setFullName('');
    setAge('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-toast">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-outfit">Patient Self Check-In</h3>
                <p className="text-xs text-slate-500">Estimate your immediate triage wait time</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johnathan Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Age</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      placeholder="e.g. 42"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Symptom Category</label>
                  <select
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
                  >
                    <option>Chest Discomfort / Shortness of Breath</option>
                    <option>High Fever / Severe Flu</option>
                    <option>Abdominal Pain / Nausea</option>
                    <option>Laceration / Fracture / Physical Injury</option>
                    <option>Neurological / Dizziness / Severe Migraine</option>
                    <option>Other Routine Consultation</option>
                  </select>
                </div>
              </div>

              {/* Symptom Severity Slider (1-5 ESI Scale) */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Self-Reported Discomfort / Severity (1-5)
                  </label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">
                    Level {severity} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value))}
                  className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 - Mild Discomfort</span>
                  <span>3 - Moderate Pain</span>
                  <span>5 - Severe / Critical</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-xs hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all"
                >
                  Submit & Calculate Wait
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-outfit">Check-In Registered!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Thank you, <strong className="text-slate-800">{fullName}</strong>. Your ticket has been assigned to ER Triage Desk 2.
            </p>

            <div className="my-6 p-5 bg-sky-50 rounded-2xl border border-sky-200 text-center">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block mb-1">
                Your Priority Estimated Wait Time
              </span>
              <div className="text-5xl font-extrabold text-sky-700 font-outfit my-1">
                ~{estimatedWait} <span className="text-lg font-medium text-sky-900">mins</span>
              </div>
              <p className="text-[11px] text-sky-800 mt-2 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                Severity level {severity} prioritized based on real-time bed capacity.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
            >
              Done & Return to Public View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
