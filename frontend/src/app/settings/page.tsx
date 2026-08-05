'use client';

import * as React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextInput, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Save, RefreshCw, Check, ShieldAlert } from 'lucide-react';
import { featureFlags } from '@/config/feature-flags';

export default function SettingsPage() {
  const [model, setModel] = React.useState('all-MiniLM-L6-v2');
  const [threshold, setThreshold] = React.useState('0.75');
  const [apiUrl, setApiUrl] = React.useState('http://localhost:8000');
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <PageContainer
      title="Workspace Settings & Preferences"
      description="Configure embedding models, similarity thresholds, backend connection endpoints, keyboard shortcuts, and feature toggles."
      actions={
        <Button variant="primary" size="sm" onClick={handleSaveSettings}>
          {isSaved ? <Check className="w-4 h-4 mr-1 text-emerald-300" /> : <Save className="w-4 h-4 mr-1" />}
          Save Changes
        </Button>
      }
    >
      <div className="space-y-8 max-w-4xl">
        {/* Model & Similarity Engine Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-aegis-text flex items-center">
              <SettingsIcon className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              Vector Model & Threshold Settings
            </CardTitle>
            <CardDescription>Configure sentence transformer model and similarity threshold bounds.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <label className="text-xs font-bold text-aegis-muted uppercase tracking-wider block mb-1.5">
                Sentence Transformer Embedding Model
              </label>
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                options={[
                  { label: 'all-MiniLM-L6-v2 (Default - Fast & Lightweight)', value: 'all-MiniLM-L6-v2' },
                  { label: 'all-mpnet-base-v2 (High Accuracy)', value: 'all-mpnet-base-v2' },
                  { label: 'paraphrase-multilingual-MiniLM-L12-v2', value: 'multilingual-mini' },
                ]}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-aegis-muted uppercase tracking-wider">
                  Cosine Similarity Classification Threshold
                </label>
                <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{threshold}</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full h-2 bg-aegis-border rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[11px] text-aegis-muted mt-1">
                Sentences with similarity below {threshold} are flagged as POTENTIALLY_UNSUPPORTED.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Backend Endpoint Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-aegis-text">Backend API Endpoint Connection</CardTitle>
            <CardDescription>Specify the target Python FastAPI scanner service URL.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-bold text-aegis-muted uppercase tracking-wider block mb-1.5">
                API Base URL Endpoint
              </label>
              <TextInput
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-aegis-text">Active Feature Toggles</CardTitle>
            <CardDescription>Configuration status of workspace feature modules.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {Object.entries(featureFlags).map(([flag, enabled]) => (
                <div key={flag} className="flex items-center justify-between p-3 bg-aegis-surface-subtle border border-aegis-border rounded-medium">
                  <span className="font-bold text-aegis-text capitalize">{flag.replace(/([A-Z])/g, ' $1')}</span>
                  <Badge variant={enabled ? 'supported' : 'unsupported'}>
                    {enabled ? 'ENABLED' : 'DISABLED'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardHeader>
            <CardTitle className="text-base font-bold text-aegis-text flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-rose-600 dark:text-rose-400" />
              Danger Zone
            </CardTitle>
            <CardDescription>Reset local workspace configurations and cache stores.</CardDescription>
          </CardHeader>

          <CardContent>
            <Button variant="danger" size="sm">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset Workspace Cache & Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
