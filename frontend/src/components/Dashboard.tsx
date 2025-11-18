import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ConnectAWS from './auth/ConnectAWS';
import StatisticsChart from './StatisticsChart';
import '../App.css';

const API_URL = 'http://localhost:3001';

interface IdleInstance {
  id: string;
  instanceId: string;
  instanceType: string | null;
  estimatedMonthlyCost: string | null;
  reason: string;
}

interface OrphanedVolume {
  id: string;
  volumeId: string;
  sizeGb: number | null;
  estimatedMonthlyCost: string | null;
}

interface UnattachedEIP {
  id: string;
  publicIp: string | null;
  allocationId: string;
}

export default function Dashboard() {
  const { token, user, logout, deleteAccount } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [instances, setInstances] = useState<IdleInstance[]>([]);
  const [volumes, setVolumes] = useState<OrphanedVolume[]>([]);
  const [eips, setEips] = useState<UnattachedEIP[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchResults = async () => {
    if (!token) return;
    
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setInstances(result.data.idleInstances);
      setVolumes(result.data.orphanedVolumes);
      setEips(result.data.unattachedEips);
      setLastFetched(new Date());
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRunScan = async () => {
    if (!token) return;
    
    setIsScanning(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Scan initiation failed');
      }
      await fetchResults();
    } catch (err: any) {
      setError(err.message || 'Failed to run a new scan. Please try again.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (token && user?.awsConnected) {
      fetchResults();
    } else {
      setIsFetching(false);
    }
  }, [token, user?.awsConnected]);

  const parseCost = (costString: string | null): number => {
    if (!costString || !costString.startsWith('$')) return 0;
    return parseFloat(costString.replace('$', ''));
  };
  
  const totalSavings =
    instances.reduce((acc, curr) => acc + parseCost(curr.estimatedMonthlyCost), 0) +
    volumes.reduce((acc, curr) => acc + parseCost(curr.estimatedMonthlyCost), 0);
  
  const isLoading = isFetching || isScanning;

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      // Redirect to login after deletion
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Show Connect AWS if not connected
  if (!user?.awsConnected) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div className="header-content">
              <div className="header-title-section">
                <h1 className="dashboard-title">
                  <span className="title-icon">🛡️</span>
                  CloudGuard Dashboard
                </h1>
                <p className="dashboard-subtitle">Intelligent cloud waste detection and cost optimization</p>
              </div>
              <div className="header-actions">
                <button onClick={logout} className="btn btn-secondary">
                  <span className="btn-icon">🚪</span>
                  Logout
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="btn btn-danger"
                  title="Delete Account"
                >
                  <span className="btn-icon">🗑️</span>
                  Delete Account
                </button>
              </div>
            </div>
          </header>
          <ConnectAWS />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-title-section">
              <h1 className="dashboard-title">
                <span className="title-icon">🛡️</span>
                CloudGuard Dashboard
              </h1>
              <p className="dashboard-subtitle">Intelligent cloud waste detection and cost optimization</p>
            </div>
            <div className="header-actions">
              <button 
                onClick={handleRunScan} 
                disabled={isLoading} 
                className="btn btn-secondary"
              >
                {isScanning ? (
                  <>
                    <span className="btn-spinner"></span>
                    Scanning...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔍</span>
                    Run New Scan
                  </>
                )}
              </button>
              <button 
                onClick={fetchResults} 
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isFetching ? (
                  <>
                    <span className="btn-spinner"></span>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔄</span>
                    Refresh Data
                  </>
                )}
              </button>
              <button onClick={logout} className="btn btn-secondary">
                <span className="btn-icon">🚪</span>
                Logout
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="btn btn-danger"
                title="Delete Account"
              >
                <span className="btn-icon">🗑️</span>
                Delete Account
              </button>
            </div>
          </div>
        </header>

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="delete-confirm-modal">
            <div className="delete-confirm-content">
              <h3>⚠️ Delete Account</h3>
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
              <p className="delete-warning">
                <strong>This will permanently delete:</strong>
                <br />• Your account and profile
                <br />• All your AWS credentials
                <br />• All your scan results and data
              </p>
              <div className="delete-confirm-actions">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="btn btn-danger"
                >
                  {isDeleting ? (
                    <>
                      <span className="btn-spinner"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🗑️</span>
                      Yes, Delete My Account
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="status-card status-loading">
            <div className="status-icon">⏳</div>
            <div className="status-content">
              <h3>Running Scan</h3>
              <p>Analyzing your AWS account. This may take a moment...</p>
            </div>
          </div>
        )}
        {isFetching && !isScanning && (
          <div className="status-card status-loading">
            <div className="status-icon">📊</div>
            <div className="status-content">
              <h3>Fetching Data</h3>
              <p>Retrieving latest scan results from the database...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="status-card status-error">
            <div className="status-icon">⚠️</div>
            <div className="status-content">
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card stat-card-primary">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3 className="stat-label">Total Potential Savings</h3>
                  <p className="stat-value">${totalSavings.toFixed(2)}</p>
                  <span className="stat-period">per month</span>
                </div>
                <div className="stat-glow"></div>
              </div>
              
              <div className="stat-card stat-card-secondary">
                <div className="stat-icon">🖥️</div>
                <div className="stat-content">
                  <h3 className="stat-label">Idle Instances</h3>
                  <p className="stat-value">{instances.length}</p>
                  <span className="stat-period">instances found</span>
                </div>
              </div>
              
              <div className="stat-card stat-card-tertiary">
                <div className="stat-icon">💾</div>
                <div className="stat-content">
                  <h3 className="stat-label">Orphaned Volumes</h3>
                  <p className="stat-value">{volumes.length}</p>
                  <span className="stat-period">volumes found</span>
                </div>
              </div>
              
              <div className="stat-card stat-card-quaternary">
                <div className="stat-icon">🌐</div>
                <div className="stat-content">
                  <h3 className="stat-label">Unattached IPs</h3>
                  <p className="stat-value">{eips.length}</p>
                  <span className="stat-period">IPs found</span>
                </div>
              </div>
            </div>

            {lastFetched && (
              <div className="last-updated">
                <span className="update-icon">🕐</span>
                Last updated: {lastFetched.toLocaleString()}
              </div>
            )}

            {/* Statistics Chart Section */}
            <StatisticsChart />

            <div className="data-sections">
              <div className="data-card">
                <div className="data-card-header">
                  <div className="data-card-title">
                    <span className="data-card-icon">🖥️</span>
                    <h2>Idle EC2 Instances</h2>
                  </div>
                  <span className="data-card-badge">{instances.length}</span>
                </div>
                <div className="data-card-body">
                  {instances.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">✨</div>
                      <h3>No idle instances found!</h3>
                      <p>Great job! All your EC2 instances are being utilized efficiently.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Instance ID</th>
                            <th>Type</th>
                            <th>Est. Monthly Cost</th>
                            <th>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instances.map((inst) => (
                            <tr key={inst.id}>
                              <td><code className="code-cell">{inst.instanceId}</code></td>
                              <td><span className="badge">{inst.instanceType || 'N/A'}</span></td>
                              <td><span className="cost-cell">{inst.estimatedMonthlyCost || '$0.00'}</span></td>
                              <td><span className="reason-badge">Low CPU Usage</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="data-card">
                <div className="data-card-header">
                  <div className="data-card-title">
                    <span className="data-card-icon">💾</span>
                    <h2>Orphaned EBS Volumes</h2>
                  </div>
                  <span className="data-card-badge">{volumes.length}</span>
                </div>
                <div className="data-card-body">
                  {volumes.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">✨</div>
                      <h3>No orphaned volumes found!</h3>
                      <p>Excellent! All your EBS volumes are properly attached.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Volume ID</th>
                            <th>Size (GB)</th>
                            <th>Est. Monthly Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {volumes.map((vol) => (
                            <tr key={vol.id}>
                              <td><code className="code-cell">{vol.volumeId}</code></td>
                              <td><span className="size-badge">{vol.sizeGb || 0} GB</span></td>
                              <td><span className="cost-cell">{vol.estimatedMonthlyCost || '$0.00'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="data-card">
                <div className="data-card-header">
                  <div className="data-card-title">
                    <span className="data-card-icon">🌐</span>
                    <h2>Unattached Elastic IPs</h2>
                  </div>
                  <span className="data-card-badge">{eips.length}</span>
                </div>
                <div className="data-card-body">
                  {eips.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">✨</div>
                      <h3>No unattached EIPs found!</h3>
                      <p>Perfect! All your Elastic IPs are properly allocated.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Allocation ID</th>
                            <th>Public IP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eips.map((eip) => (
                            <tr key={eip.id}>
                              <td><code className="code-cell">{eip.allocationId}</code></td>
                              <td><span className="ip-badge">{eip.publicIp || 'N/A'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

