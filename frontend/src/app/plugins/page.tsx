'use client';

import * as React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/input';
import { Blocks, Sparkles } from 'lucide-react';

export default function PluginsPage() {
  const [query, setQuery] = React.useState('');

  const plugins = [
    {
      name: 'Pinecone Vector Store Sync',
      category: 'Vector Databases',
      description: 'Automatically pull retrieved context chunks directly from Pinecone vector index collections.',
      status: 'COMING SOON',
    },
    {
      name: 'Qdrant Collection Inspector',
      category: 'Vector Databases',
      description: 'Direct integration with Qdrant payload metadata for distance metric alignment.',
      status: 'COMING SOON',
    },
    {
      name: 'Datadog Observability Exporter',
      category: 'APM & Telemetry',
      description: 'Stream Aegis faithfulness scores and unsupported claim metrics into Datadog dashboards.',
      status: 'COMING SOON',
    },
    {
      name: 'Slack Hallucination Alerts',
      category: 'Notifications',
      description: 'Receive real-time Slack webhooks whenever RAG faithfulness drops below your threshold.',
      status: 'COMING SOON',
    },
  ];

  const filteredPlugins = plugins.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageContainer
      title="Plugin & Extensions Marketplace"
      description="Extend Aegis with third-party vector database connectors, telemetry exporters, and notification integrations."
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="max-w-md">
              <SearchInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search plugin extensions marketplace..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPlugins.map((plugin) => (
            <Card key={plugin.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Blocks className="w-5 h-5 text-indigo-600" />
                    <div>
                      <CardTitle className="text-sm font-bold text-aegis-text">{plugin.name}</CardTitle>
                      <span className="text-[11px] font-semibold text-aegis-muted">{plugin.category}</span>
                    </div>
                  </div>
                  <Badge variant="medium" className="bg-slate-100 text-slate-700 border-slate-300">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                    {plugin.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-xs text-aegis-muted leading-relaxed">{plugin.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
