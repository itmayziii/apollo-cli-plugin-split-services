/**
 * Base config we are expecting out of a gateway or a service inside the gateway.
 */
export interface ApolloConfig<T extends GatewayConfig | ServiceConfig> {
  splitServices: T
}

/*
 * Gateway configuration
 */
export interface GatewayConfig {
  services: SplitService[]
}

/**
 * Service listed inside of a gateways configuration.
 */
export interface SplitService {
  name: string
  gitURL: string
  directory: string
  apolloConfigPath?: string
}

/**
 * Configuration for a service being used inside of a gateway.
 */
export interface ServiceConfig {
  url: string
}
