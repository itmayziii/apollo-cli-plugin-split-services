export interface ApolloConfig {
  services: Service[]
}

export interface Service {
  name: string
  gitURL: string
  directory: string
}