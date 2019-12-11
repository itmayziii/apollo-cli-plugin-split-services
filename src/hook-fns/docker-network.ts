import { Hooks } from '@oclif/config'
import Docker from 'dockerode'
import { DockerNetwork } from '../interfaces/docker'
import { ApolloConfig, GatewayConfig } from '..'

/**
 * Creates a docker network if the apollo config specifies one.
 *
 * @param options
 * @param apolloConfig
 * @param docker
 */
export function dockerNetwork<T extends Hooks['prerun']> (options: T, apolloConfig: ApolloConfig<GatewayConfig>, docker: Docker): Promise<void> {
  if (!apolloConfig.splitServices.docker) return Promise.resolve()
  const configNetworkName = apolloConfig.splitServices.docker.network

  const commandsToRunBefore = [
    'services:init',
    'services:start'
  ]
  if (!commandsToRunBefore.includes(options.Command.id)) return Promise.resolve()

  return docker.listNetworks()
    .then(function findDockerNetwork (networks: DockerNetwork[]) {
      return networks.find((network) => network.Name === configNetworkName)
    })
    .then(function createNetwork (existingNetwork) {
      if (existingNetwork) return
      return docker.createNetwork({
        Driver: 'bridge',
        Name: configNetworkName
      })
    })
}
