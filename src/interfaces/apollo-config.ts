/**
 * Base config we are expecting out of a gateway or a service inside the gateway.
 */
export interface ApolloConfig<T extends GatewayConfig | ServiceConfig> {
  // Top level config property to nest every property this plugin will use to avoid cluttering the top level apollo.config namespace.
  splitServices: T
}

/*
 * Gateway configuration
 */
export interface GatewayConfig {
  // Gateways have services in them.
  services: SplitService[]
}

/**
 * Service listed inside of a gateways configuration.
 */
export interface SplitService {
  // Human friendly name.
  name: string
  // URL to do a git clone from.
  gitURL: string
  // Should be a path relative to the root of the project.
  directory: string
  // Should be a path relative to the root of the project that points to the apollo.config.js file.
  apolloConfigPath?: string
}

/**
 * Configuration for a service being used inside of a gateway.
 */
export interface ServiceConfig {
  // URL to find this service on i.e. http://localhost:4200/graphql, the gateway uses it to hook up the running service.
  url: string
}
