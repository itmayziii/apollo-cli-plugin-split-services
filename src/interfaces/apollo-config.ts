export interface ApolloConfig<T extends ServiceGatewayConfig | ServiceConfig> {
  services: T[]
}

export interface ServiceGatewayConfig {
  name: string
  gitURL: string
  directory: string
  apolloConfigPath: string
}

export interface ServiceConfig {
  url: string
}
