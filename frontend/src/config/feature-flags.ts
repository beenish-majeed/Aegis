export interface FeatureFlagsConfig {
  dashboard: boolean;
  singleScan: boolean;
  batchScan: boolean;
  reports: boolean;
  apiIntegrations: boolean;
  pluginMarketplace: boolean;
}

export const featureFlags: FeatureFlagsConfig = {
  dashboard: true,
  singleScan: true,
  batchScan: true,
  reports: true,
  apiIntegrations: false,
  pluginMarketplace: false,
};
