import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Shield, Globe, KeyRound, LockKeyhole, Cloud } from 'lucide-react';
import { DottedGlowBackground } from '../ui/dotted-glow-background';

import { API_URL } from '../../config';

const regions = [
  ['us-east-1', 'US East (N. Virginia)'],
  ['us-east-2', 'US East (Ohio)'],
  ['us-west-1', 'US West (N. California)'],
  ['us-west-2', 'US West (Oregon)'],
  ['af-south-1', 'Africa (Cape Town)'],
  ['ap-east-1', 'Asia Pacific (Hong Kong)'],
  ['ap-south-1', 'Asia Pacific (Mumbai)'],
  ['ap-south-2', 'Asia Pacific (Hyderabad)'],
  ['ap-northeast-3', 'Asia Pacific (Osaka)'],
  ['ap-northeast-2', 'Asia Pacific (Seoul)'],
  ['ap-southeast-1', 'Asia Pacific (Singapore)'],
  ['ap-southeast-2', 'Asia Pacific (Sydney)'],
  ['ap-southeast-3', 'Asia Pacific (Jakarta)'],
  ['ap-southeast-4', 'Asia Pacific (Melbourne)'],
  ['ap-northeast-1', 'Asia Pacific (Tokyo)'],
  ['ca-central-1', 'Canada (Central)'],
  ['ca-west-1', 'Canada West (Calgary)'],
  ['eu-central-1', 'EU (Frankfurt)'],
  ['eu-west-1', 'EU (Ireland)'],
  ['eu-west-2', 'EU (London)'],
  ['eu-south-1', 'EU (Milan)'],
  ['eu-west-3', 'EU (Paris)'],
  ['eu-south-2', 'EU (Spain)'],
  ['eu-north-1', 'EU (Stockholm)'],
  ['eu-central-2', 'EU (Zurich)'],
  ['il-central-1', 'Israel (Tel Aviv)'],
  ['me-south-1', 'Middle East (Bahrain)'],
  ['me-central-1', 'Middle East (UAE)'],
  ['sa-east-1', 'South America (Sao Paulo)'],
];

const trustItems = [
  { label: 'AES-256 credential encryption', icon: Shield },
  { label: 'Read-only scan workflow', icon: LockKeyhole },
  { label: 'Region-aware recommendations', icon: Globe },
];

export default function ConnectAWS() {
  const [awsAccessKeyId, setAwsAccessKeyId] = useState('');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isManualRegion, setIsManualRegion] = useState(false);
  const { token, checkAuth } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/connect-aws`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          awsAccessKeyId,
          awsSecretAccessKey,
          awsRegion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect AWS account');
      }

      setSuccess('AWS account connected successfully.');
      setAwsAccessKeyId('');
      setAwsSecretAccessKey('');
      await checkAuth();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect AWS account. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-[78vh] max-w-6xl items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-950/20 p-4 md:p-8">
      <DottedGlowBackground
        className="pointer-events-none"
        opacity={0.45}
        gap={14}
        radius={1.2}
        colorLightVar="--color-slate-300"
      />

      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="premium-panel flex flex-col justify-between rounded-lg p-6"
        >
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg border border-cyan-300/16 bg-cyan-300/10 text-cyan-100">
              <Cloud className="h-7 w-7" />
            </div>
            <h2 className="app-text-balance text-3xl font-semibold tracking-tight text-white">
              Connect AWS and unlock the command center.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              CloudGuard uses read-only telemetry to detect idle infrastructure, cost anomalies, and risky security-group posture.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            {trustItems.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <Icon className="h-4 w-4 text-emerald-200" />
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="premium-panel rounded-lg p-6 md:p-8"
        >
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
              <KeyRound className="h-4 w-4" />
              Secure AWS onboarding
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-white">Connection details</h3>
            <p className="mt-2 text-sm text-slate-500">Use a least-privilege access key with read-only permissions.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-start gap-3 overflow-hidden rounded-lg border border-rose-300/20 bg-rose-300/10 p-4 text-rose-100"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-200" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-start gap-3 overflow-hidden rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-100"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
                <p className="text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="awsAccessKeyId" className="ml-1 block text-sm font-medium text-slate-300">
                  Access Key ID
                </label>
                <input
                  type="text"
                  id="awsAccessKeyId"
                  value={awsAccessKeyId}
                  onChange={(e) => setAwsAccessKeyId(e.target.value)}
                  required
                  placeholder="AKIA..."
                  className="premium-input w-full rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="awsSecretAccessKey" className="ml-1 block text-sm font-medium text-slate-300">
                  Secret Access Key
                </label>
                <input
                  type="password"
                  id="awsSecretAccessKey"
                  value={awsSecretAccessKey}
                  onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                  required
                  placeholder="Your secret key"
                  className="premium-input w-full rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="awsRegion" className="ml-1 block text-sm font-medium text-slate-300">
                  AWS Region
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualRegion(!isManualRegion);
                    setAwsRegion(isManualRegion ? 'us-east-1' : '');
                  }}
                  className="text-xs font-semibold text-cyan-100 transition-colors hover:text-white"
                >
                  {isManualRegion ? 'Select from list' : 'Enter manually'}
                </button>
              </div>
              <div className="relative">
                {isManualRegion ? (
                  <input
                    type="text"
                    id="awsRegion"
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value)}
                    required
                    placeholder="e.g. eu-north-1"
                    className="premium-input w-full rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600"
                    disabled={isLoading}
                  />
                ) : (
                  <select
                    id="awsRegion"
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value)}
                    required
                    className="premium-input w-full cursor-pointer appearance-none rounded-lg px-4 py-3 text-white"
                    disabled={isLoading}
                  >
                    {regions.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                )}
                <Globe className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="premium-button mt-2 flex w-full items-center justify-center gap-3 rounded-lg px-6 py-4 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Connect Account
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
