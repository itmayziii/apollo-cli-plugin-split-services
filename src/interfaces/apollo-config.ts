export interface ApolloConfig<T extends GatewayConfig | ServiceConfig> {
  splitServices: T
}

export interface GatewayConfig {
  services: SplitService[]
}

export interface SplitService {
  name: string
  gitURL: string
  directory: string
  apolloConfigPath?: string
}

export interface ServiceConfig {
  url: string
}
