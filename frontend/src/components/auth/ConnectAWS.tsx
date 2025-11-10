import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ConnectAWS.css';

const API_URL = 'http://localhost:3001';

export default function ConnectAWS() {
  const [awsAccessKeyId, setAwsAccessKeyId] = useState('');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="connect-aws-container">
      <div className="connect-aws-card">
        <div className="connect-aws-header">
          <span className="connect-aws-icon">☁️</span>
          <h2>Connect AWS Account</h2>
          <p>Connect your AWS account to start monitoring your resources</p>
        </div>

        {error && (
          <div className="connect-aws-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="connect-aws-success">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="connect-aws-form">
          <div className="form-group">
            <label htmlFor="awsAccessKeyId">AWS Access Key ID</label>
            <input
              type="text"
              id="awsAccessKeyId"
              value={awsAccessKeyId}
              onChange={(e) => setAwsAccessKeyId(e.target.value)}
              required
              placeholder="AKIAIOSFODNN7EXAMPLE"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="awsSecretAccessKey">AWS Secret Access Key</label>
            <input
              type="password"
              id="awsSecretAccessKey"
              value={awsSecretAccessKey}
              onChange={(e) => setAwsSecretAccessKey(e.target.value)}
              required
              placeholder="Enter your secret access key"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="awsRegion">AWS Region</label>
            <input
              type="text"
              id="awsRegion"
              list="awsRegions"
              value={awsRegion}
              onChange={(e) => setAwsRegion(e.target.value)}
              required
              placeholder="Select or type AWS region (e.g., us-east-1)"
              disabled={isLoading}
              className="region-input"
            />
            <datalist id="awsRegions">
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-east-2">US East (Ohio)</option>
              <option value="us-west-1">US West (N. California)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="eu-west-2">EU (London)</option>
              <option value="eu-west-3">EU (Paris)</option>
              <option value="eu-central-1">EU (Frankfurt)</option>
              <option value="eu-north-1">EU (Stockholm)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
              <option value="ap-southeast-3">Asia Pacific (Jakarta)</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
              <option value="ap-northeast-2">Asia Pacific (Seoul)</option>
              <option value="ap-south-1">Asia Pacific (Mumbai)</option>
              <option value="ca-central-1">Canada (Central)</option>
              <option value="sa-east-1">South America (São Paulo)</option>
              <option value="af-south-1">Africa (Cape Town)</option>
              <option value="me-south-1">Middle East (Bahrain)</option>
              <option value="me-central-1">Middle East (UAE)</option>
            </datalist>
          </div>

          <button type="submit" className="connect-aws-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                Connecting...
              </>
            ) : (
              <>
                <span className="btn-icon">🔗</span>
                Connect AWS Account
              </>
            )}
          </button>
        </form>

        <div className="connect-aws-info">
          <p>
            <strong>Note:</strong> Your AWS credentials are encrypted and stored securely.
            They are only used to scan your AWS resources.
          </p>
        </div>
      </div>
    </div>
  );
}

