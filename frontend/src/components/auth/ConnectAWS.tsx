import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CheckCircle, AlertTriangle, Shield, Globe } from 'lucide-react';
import { DottedGlowBackground } from '../ui/dotted-glow-background';
import { EncryptedText } from '../ui/encrypted-text';

import { API_URL } from '../../config';

export default function ConnectAWS() {
  const [awsAccessKeyId, setAwsAccessKeyId] = useState('');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isManualRegion, setIsManualRegion] = useState(false);
  const { token, checkAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
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

      setSuccess('AWS account connected successfully!');
      setAwsAccessKeyId('');
      setAwsSecretAccessKey('');
      await checkAuth(); // Refresh user data
    } catch (err: any) {
      setError(err.message || 'Failed to connect AWS account. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <DottedGlowBackground
        className="pointer-events-none"
        opacity={0.8}
        gap={12}
        radius={1.5}
        colorLightVar="--color-slate-300"
        colorDarkVar="--color-slate-700"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-2xl p-8 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cloud className="w-64 h-64 text-blue-400 -rotate-12 translate-x-12 -translate-y-12" />
        </div>

        <div className="relative z-10">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30"
            >
              <Globe className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              <EncryptedText
                text="Connect AWS Account"
                revealDelayMs={100}
                className="inline-block"
              />
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Securely connect your AWS account to start monitoring resources and detecting waste.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-200"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3 text-green-200"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400 mt-0.5" />
                <p>{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="awsAccessKeyId" className="block text-sm font-medium text-slate-300 ml-1">
                  Access Key ID
                </label>
                <input
                  type="text"
                  id="awsAccessKeyId"
                  value={awsAccessKeyId}
                  onChange={(e) => setAwsAccessKeyId(e.target.value)}
                  required
                  placeholder="AKIA..."
                  className="w-full px-4 py-3 rounded-xl glass-input placeholder-slate-500 text-white font-mono text-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="awsSecretAccessKey" className="block text-sm font-medium text-slate-300 ml-1">
                  Secret Access Key
                </label>
                <input
                  type="password"
                  id="awsSecretAccessKey"
                  value={awsSecretAccessKey}
                  onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                  required
                  placeholder="Your secret key"
                  className="w-full px-4 py-3 rounded-xl glass-input placeholder-slate-500 text-white font-mono text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="awsRegion" className="block text-sm font-medium text-slate-300 ml-1">
                  AWS Region
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualRegion(!isManualRegion);
                    if (!isManualRegion) setAwsRegion(''); // Clear when switching to manual
                    else setAwsRegion('us-east-1'); // Reset to default when switching back
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
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
                    placeholder="e.g., eu-north-1"
                    className="w-full px-4 py-3 rounded-xl glass-input placeholder-slate-500 text-white font-mono text-sm"
                    disabled={isLoading}
                  />
                ) : (
                  <select
                    id="awsRegion"
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl glass-input text-white appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-east-2">US East (Ohio)</option>
                    <option value="us-west-1">US West (N. California)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="af-south-1">Africa (Cape Town)</option>
                    <option value="ap-east-1">Asia Pacific (Hong Kong)</option>
                    <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                    <option value="ap-south-2">Asia Pacific (Hyderabad)</option>
                    <option value="ap-northeast-3">Asia Pacific (Osaka)</option>
                    <option value="ap-northeast-2">Asia Pacific (Seoul)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                    <option value="ap-southeast-3">Asia Pacific (Jakarta)</option>
                    <option value="ap-southeast-4">Asia Pacific (Melbourne)</option>
                    <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                    <option value="ca-central-1">Canada (Central)</option>
                    <option value="ca-west-1">Canada West (Calgary)</option>
                    <option value="eu-central-1">EU (Frankfurt)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="eu-west-2">EU (London)</option>
                    <option value="eu-south-1">EU (Milan)</option>
                    <option value="eu-west-3">EU (Paris)</option>
                    <option value="eu-south-2">EU (Spain)</option>
                    <option value="eu-north-1">EU (Stockholm)</option>
                    <option value="eu-central-2">EU (Zurich)</option>
                    <option value="il-central-1">Israel (Tel Aviv)</option>
                    <option value="me-south-1">Middle East (Bahrain)</option>
                    <option value="me-central-1">Middle East (UAE)</option>
                    <option value="sa-east-1">South America (São Paulo)</option>
                  </select>
                )}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Globe className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 px-6 rounded-xl glass-button font-bold text-lg flex items-center justify-center gap-3 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Connect Account
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              <strong>Security Note:</strong> Your credentials are encrypted using AES-256 before being stored.
              We strictly use read-only permissions to scan for idle resources and never modify your infrastructure.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

