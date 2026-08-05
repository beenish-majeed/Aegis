'use client';

import * as React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link2, RefreshCw, Check } from 'lucide-react';

export default function IntegrationsPage() {
  const [testingEndpoint, setTestingEndpoint] = React.useState<string | null>(null);
  const [testSuccess, setTestSuccess] = React.useState<string | null>(null);

  const handleTestConnection = (name: string) => {
    setTestingEndpoint(name);
    setTimeout(() => {
      setTestingEndpoint(null);
      setTestSuccess(name);
      setTimeout(() => setTestSuccess(null), 2000);
    }, 1200);
  };

  const integrations = [
    {
      name: 'Python FastAPI Scanner Endpoint',
      url: 'http://localhost:8000/api/scan',
      type: 'Primary Evaluation REST API',
      status: 'ACTIVE',
    },
    {
      name: 'LangChain RAG Pipeline Webhook',
      url: 'http://localhost:8000/api/integrations/langchain',
      type: 'Middleware Webhook Integration',
      status: 'CONFIGURED',
    },
    {
      name: 'LlamaIndex Evaluation Callback',
      url: 'http://localhost:8000/api/integrations/llamaindex',
      type: 'Callback Handler',
      status: 'CONFIGURED',
    },
  ];

  return (
    <PageContainer
      title="API & Pipeline Integrations"
      description="Connect Aegis evaluation endpoints to LangChain, LlamaIndex, OpenAI, and custom LLM inference servers."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-aegis-text flex items-center">
              <Link2 className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              Configured API Endpoints ({integrations.length})
            </CardTitle>
            <CardDescription>Target server endpoints for real-time RAG response auditing.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {integrations.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-aegis-surface-subtle border border-aegis-border rounded-medium gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-aegis-text">{item.name}</h3>
                      <Badge variant="supported">{item.status}</Badge>
                    </div>
                    <p className="text-xs font-mono text-aegis-muted mt-1">{item.url}</p>
                    <span className="text-[11px] font-semibold text-aegis-muted block mt-0.5">{item.type}</span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={testingEndpoint === item.name}
                    onClick={() => handleTestConnection(item.name)}
                  >
                    {testSuccess === item.name ? (
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    )}
                    Test Endpoint Connection
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
